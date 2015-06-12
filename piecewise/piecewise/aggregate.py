from itertools import chain
from sqlalchemy import case, func, text, BigInteger, Column, DateTime, Float, Integer, String, Table
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql.expression import and_, or_, between, label
from geoalchemy2 import Geometry
from geoalchemy2.functions import GenericFunction, ST_Intersects, ST_X, ST_Y
import datetime
import itertools
import re
import time
import piecewise.maxmind

class ST_MakeBox2D(GenericFunction):
    name = 'ST_MakeBox2D'
    type = Geometry

class ST_Point(GenericFunction):
    name = 'ST_Point'
    type = Geometry

class ST_SnapToGrid(GenericFunction):
    name = 'ST_SnapToGrid'
    type = Geometry

class Aggregator(object):
    def __init__(self, database_uri, cache_table_name, statistics_table_name, bins, statistics, filters):
        self.database_uri = database_uri
        self.cache_table_name = cache_table_name
        self.statistics_table_name = statistics_table_name
        self.bins = bins
        self.statistics = statistics
        self.filters = filters

    def make_cache_table(self, metadata):
        return Table(self.cache_table_name, metadata, 
                Column('id', BigInteger, primary_key = True),
                Column('time', DateTime),
                Column('location', Geometry("POINT", srid=4326)),
                Column('ip', BigInteger),
                Column('countrtt', BigInteger),
                Column('sumrtt', BigInteger),
                Column('download_time', BigInteger),
                Column('download_octets', BigInteger),
                Column('upload_time', BigInteger),
                Column('upload_octets', BigInteger))

    def make_table(self, metadata):
        bin_columns = chain.from_iterable(b.postgres_columns for b in self.bins)
        stat_columns = chain.from_iterable(b.postgres_columns for b in self.statistics)

        return Table(self.statistics_table_name, metadata, Column('id', Integer, primary_key = True), *list(chain(bin_columns, stat_columns)))

    def ingest_bigquery_query(self):
        select_clause = [
                "web100_log_entry.log_time AS time",
                "connection_spec.client_geolocation.longitude AS longitude",
                "connection_spec.client_geolocation.latitude AS latitude",
                "PARSE_IP(connection_spec.client_ip) AS ip",
                "web100_log_entry.snap.CountRTT AS countrtt",
                "web100_log_entry.snap.SumRTT AS sumrtt",
                "web100_log_entry.snap.SndLimTimeRwin + web100_log_entry.snap.SndLimTimeCwnd + web100_log_entry.snap.SndLimTimeSnd AS download_time",
                "web100_log_entry.snap.HCThruOctetsAcked AS download_octets",
                "web100_log_entry.snap.Duration AS upload_time",
                "web100_log_entry.snap.HCThruOctetsReceived AS upload_octets"
        ]

        where_clause = list(chain.from_iterable(f.bigquery_filter() for f in self.filters))
        tables = self._tables_for(self.filters)

        return '\n'.join([
            'SELECT',
            ', '.join(select_clause),
            'FROM ',
            ', '.join('[%s]'% t for t in tables),
            'WHERE',
            ' AND '.join(where_clause),
            ';'])

    def _tables_for(self, filters):
        all_tables = []
        current_year_month = time.gmtime()[:2] # first two fields are year and month, handy.
        years = itertools.count(2010)
        months = range(1, 12 + 1)
        possible_year_months = ((year, month) for year in years for month in months)
        valid_year_months = itertools.takewhile(lambda x: x < current_year_month, possible_year_months)

        for f in filters:
            if isinstance(f, TemporalFilter):
                after = time.gmtime(f.after)[:2]
                before = time.gmtime(f.before)[:2]
                valid_year_months = itertools.ifilter(lambda x: after <= x <= before, valid_year_months)

        return ['plx.google:m_lab.%04d_%02d.all' % ym for ym in valid_year_months]

    def bigquery_row_to_postgres_row(self, bq_row):
        bq_row = [f['v'] for f in bq_row['f']]
        timestamp, longitude, latitude, ip, countrtt, sumrtt, dl_time, dl_octets, ul_time, ul_octets = bq_row

        timestamp = timestamp and datetime.datetime.utcfromtimestamp(float(timestamp))
        location = longitude and latitude and "srid=4326;POINT(%f %f)" % (float(longitude), float(latitude))
        ip = ip and int(ip)
        countrtt = countrtt and int(countrtt)
        sumrtt = sumrtt and int(sumrtt)
        dl_time = dl_time and float(dl_time)
        dl_octets = dl_octets and int(dl_octets)
        ul_time = ul_time and float(ul_time)
        ul_octets = ul_octets and int(ul_octets)

        pg_row = dict(
                time=timestamp,
                location=location,
                ip = ip,
                countrtt=countrtt,
                sumrtt = sumrtt,
                download_time = dl_time,
                download_octets = dl_octets,
                upload_time = ul_time,
                upload_octets = ul_octets)

        return pg_row

    def __repr__(self):
        return """Aggregator(bins={bins}, statistics={statistics}, filters={filters})""".format(
                bins=self.bins,
                statistics=self.statistics,
                filters=self.filters)

class Bins(object):
    def join_table(self, metadata):
        pass

class SpatialGridBins(Bins):
    label = "spatial_grid"

    def __init__(self, resolution):
        self.resolution = resolution

    @property
    def postgres_columns(self):
        return [Column('cell', Geometry('POINT', srid=4326))]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.cell]
        snapped_geom = func.ST_SnapToGrid(full_table.c.location, self.resolution)
        select_query = (query
                .column(snapped_geom)
                .group_by(snapped_geom))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table, res):
        if isinstance(res, basestring):
            try:
                res = float(res)
            except ValueError:
                res = self.resolution
        snapped_geom = func.ST_SnapToGrid(aggregate_table.c.cell, res)
        grid_cell = func.ST_MakeBox2D(snapped_geom, func.ST_Translate(snapped_geom, res, res))
        return query.column(label('cell', func.ST_AsGeoJSON(grid_cell))).group_by(snapped_geom)

    def postgres_aggregates(self, resolution):
        if isinstance(resolution, basestring):
            try:
                resolution = float(resolution)
            except ValueError:
                resolution = self.resolution
        return [
            label('cell_x', func.floor(ST_X(Column('cell')) / resolution) * resolution),
            label('cell_y', func.floor(ST_Y(Column('cell')) / resolution) * resolution)]

    def postgres_filters(self, params):
        if isinstance(params, basestring):
            params = map(float, params.split(","))
        xmin, ymin, xmax, ymax = params
        return [
            ST_Intersects(Column('cell'), ST_MakeBox2D(ST_Point(xmin, ymin), ST_Point(xmax, ymax)))]

    def __repr__(self):
        return """Grid(res={resolution})""".format(
                resolution=self.resolution)

class SpatialJoinBins(Bins):
    label = "spatial_join"

    def __init__(self, table, geometry_column, key):
        self.table = table
        self.geometry_column = geometry_column
        self.key = key

    @property
    def postgres_columns(self):
        return [Column('join_key', Integer)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.join_key]
        fk = Column(self.key, Integer)
        geom = Column(self.geometry_column, Geometry())
        join_table = Table(self.table, full_table.metadata, fk, geom)
        select_query = (query.select_from(join_table)
             .where(ST_Intersects(full_table.c.location, geom))
             .column(fk)
             .group_by(fk))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table, params):
        fk = Column(self.key, Integer)
        geom = Column(self.geometry_column, Geometry())
        join_table = Table(self.table, aggregate_table.metadata, fk, geom)
        if params == 'key':
            query = query.column(aggregate_table.c.join_key)
        else:
            query = query.column(func.ST_AsGeoJSON(func.ST_Collect(geom)))

        return (query
                .select_from(join_table)
                .where(aggregate_table.c.join_key == fk)
                .group_by(aggregate_table.c.join_key))

class ISPBins(Bins):
    label = "isp_bins"

    def __init__(self, maxmind_file, rewrites):
        self.maxmind_file = maxmind_file
        self.rewrites = rewrites
        self._regexes = None
        self._maxmind_db = None

    @property
    def regexes(self):
        if self._regexes is None:
            self._regexes = []
            for alias, patterns in self.rewrites.iteritems():
                regex = re.compile('|'.join(re.escape(i) for i in patterns))
                self._regexes.append((alias, regex))
        return self._regexes

    @property
    def maxmind_db(self):
        if self._maxmind_db is None:
            self._maxmind_db = piecewise.maxmind.load(self.maxmind_file)
        return self._maxmind_db

    def rewrite(self, isp):
        if isp is not None:
            for (alias, regex) in self.regexes:
                if regex.search(isp):
                    return alias

    def postgres_aggregate_dimension(self, t):
        labeled_ranges = [(label, piecewise.maxmind.ip_ranges(self.maxmind_db, pattern)) for (label, pattern) in self.regexes]
        def ranges_to_sql_filter(ranges):
            betweens = (between(t.c.ip, low, high) for (low, high) in ranges)
            return and_(*betweens)
        cases = [(ranges_to_sql_filter(ranges), label) for (label, ranges) in labeled_ranges]
        return case(cases, else_=None)

    @property
    def postgres_columns(self):
        return [Column('isp', String)]

    def postgres_aggregates(self, isps):
        return [Column('isp')]

    def postgres_filters(self, params):
        if params:
            return [Column('isp').in_(params.split(","))]
        else:
            return []

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.isp]

        t = full_table
        labeled_ranges = [(shortname, piecewise.maxmind.ip_ranges(self.maxmind_db, pattern)) for (shortname, pattern) in self.regexes]
        def ranges_to_sql_filter(ranges):
            betweens = (between(t.c.ip, low, high) for (low, high) in ranges)
            return or_(*betweens)
        cases = [(ranges_to_sql_filter(ranges), shortname) for (shortname, ranges) in labeled_ranges]
        shortname = case(cases, else_=None)

        select_query = (query.column(label("isp", shortname)).group_by("isp"))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table, params):
        return (query
                .column(aggregate_table.c.isp)
                .group_by(aggregate_table.c.isp))

    def filter_query_to_report(self, query, aggregate_table, params):
        if params:
            isps = params.split(",")
            return query.where(aggregate_table.c.isp.in_(isps))
        else:
            return query

    def __repr__(self):
        return """ISPBins""".format(
                resolution=self.resolution)

class TemporalBins(Bins):
    label = "time_slices"

    def __init__(self, resolution):
        self.resolution = resolution

    def build_query_to_populate(self, query, full_table, aggregate_table):
        t = full_table
        truncated_time = func.floor(func.extract("epoch", t.c.time) / self.resolution) * self.resolution
        time = text("TIMESTAMP 'epoch'") + truncated_time * datetime.timedelta(seconds=1)
        select_query = query.column(time).group_by(time)
        insert_columns = [aggregate_table.c.time_step]
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table, params):
        if isinstance(params, basestring):
            try:
                res = int(params)
            except ValueError:
                res = self.resolution
        else:
            res = params
        time = (res * 
            func.floor(func.extract("epoch", aggregate_table.c.time_step) / res))
        return (query
                .column(label("time_slice", time))
                .group_by(time))

    def filter_query_to_report(self, query, aggregate_table, params):
        if isinstance(params, basestring):
            params = map(int, params.split(","))
        after, before = params
        time = func.extract("epoch", aggregate_table.c.time_step)
        return query.where(between(time, after, before))

    @property
    def postgres_columns(self):
        return [Column('time_step', DateTime)]

    def __repr__(self):
        return "Timeslices(res={resolution})".format(resolution=self.resolution)


class Filter(object):
    pass

class BBoxFilter(Filter):
    def __init__(self, bbox):
        self.bbox = bbox

    def bigquery_filter(self):
        xmin, ymin, xmax, ymax = self.bbox
        return [
            "connection_spec.client_geolocation.latitude > {0}".format(ymin),
            "connection_spec.client_geolocation.longitude > {0}".format(xmin),
            "connection_spec.client_geolocation.latitude < {0}".format(ymax),
            "connection_spec.client_geolocation.longitude < {0}".format(xmax)
        ]

    def __repr__(self):
        return """BBOX{0}""".format(self.bbox)

class GeoJsonFilter(Filter):
    def __init__(self, geojson):
        self.geojson = geojson

    def __repr__(self):
        return """GeoJson@{0}""".format(self.geojson)

class TemporalFilter(Filter):
    def __init__(self, after, before):
        self.after = after
        self.before = before

    def bigquery_filter(self):
        return ["IS_EXPLICITLY_DEFINED(web100_log_entry.log_time)",
                "web100_log_entry.log_time > {0}".format(self.after),
                "web100_log_entry.log_time < {0}".format(self.before)]

    def __repr__(self):
        return """{0} < time < {1}""".format(self.after, self.before)

class RawFilter(Filter):
    def __init__(self, query):
        self.query = query

    def bigquery_filter(self):
        return [self.query]

    def __repr__(self):
        return "\"{0}\"".format(self.query)


class Statistic(object):
    def bigquery_to_postgres(self, *fields):
        return zip(map(lambda c: c.name, self.postgres_columns), fields)


class _AverageRTT(Statistic):
    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.sumrtt, aggregate_table.c.countrtt]
        select_query = (query
              .column(func.sum(full_table.c.sumrtt))
              .column(func.sum(full_table.c.countrtt)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        mean = func.sum(a.c.sumrtt) / func.sum(a.c.countrtt)
        is_safe = func.sum(a.c.countrtt) > 0
        safe_mean = (case([(is_safe, mean)], else_ = 0))
        return query.column(label('AverageRTT', safe_mean))

    @property
    def postgres_columns(self):
        return [Column('sumrtt', Integer), Column('countrtt', Integer)]

    def __repr__(self):
        return "AverageRTT"

class _MedianRTT(Statistic):
    @property
    def postgres_columns(self):
        return [Column('rtt_samples', ARRAY(Float))]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.rtt_samples]
        mean = full_table.c.sumrtt / full_table.c.countrtt
        is_safe = full_table.c.countrtt > 0
        safe_mean = case([(is_safe, mean)], else_ = None)
        select_query = (query.column(func.array_agg(safe_mean)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        median = func.median(aggregate_table.c.rtt_samples)
        return query.column(label("MedianRTT", median))

    def __repr__(self):
        return "MedianRTT"

class _AverageDownload(Statistic):
    @property
    def postgres_columns(self):
        return [Column('download_octets', BigInteger), Column('download_time', Float)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.download_octets, aggregate_table.c.download_time]
        select_query = (query
                .column(func.sum(full_table.c.download_octets))
                .column(func.sum(full_table.c.download_time)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        mean = func.sum(a.c.download_octets) / func.sum(a.c.download_time)
        is_safe = func.sum(a.c.download_time) > 0
        safe_mean = case([(is_safe, mean)], else_ = None)
        return query.column(label("AverageDownload", safe_mean))

class _MedianDownload(Statistic):
    @property
    def postgres_columns(self):
        return [Column('download_samples', ARRAY(Float))]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.download_samples]
        mean = full_table.c.download_octets / full_table.c.download_time
        is_safe = full_table.c.download_time > 0
        safe_mean = case([(is_safe, mean)], else_ = None)
        select_query = (query.column(func.array_agg(safe_mean)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        mean = func.sum(a.c.download_octets) / func.sum(a.c.download_time)
        is_safe = func.sum(a.c.download_time) > 0
        safe_mean = case([(is_safe, mean)], else_ = None)
        return query.column(label("MedianDownload", safe_mean))

class _AverageUpload(Statistic):
    @property
    def postgres_columns(self):
        return [Column('upload_octets', BigInteger), Column('upload_time', Float)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.upload_octets, aggregate_table.c.upload_time]
        select_query = (query
                .column(func.sum(full_table.c.upload_octets))
                .column(func.sum(full_table.c.upload_time)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        mean = func.sum(a.c.upload_octets) / func.sum(a.c.upload_time)
        is_safe = func.sum(a.c.upload_time) > 0
        safe_mean = case([(is_safe, mean)], else_ = None)
        return query.column(label("AverageUpload", safe_mean))

class _MedianUpload(Statistic):
    @property
    def postgres_columns(self):
        return [Column('upload_samples', ARRAY(Float))]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.upload_samples]
        mean = full_table.c.upload_octets / full_table.c.upload_time
        is_safe = full_table.c.upload_time > 0
        safe_mean = case([(is_safe, mean)], else_ = None)
        select_query = (query.column(func.array_agg(safe_mean)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        mean = func.sum(a.c.upload_octets) / func.sum(a.c.upload_time)
        is_safe = func.sum(a.c.upload_time) > 0
        safe_mean = case([(is_safe, mean)], else_ = None)
        return query.column(label("MedianUpload", safe_mean))

AverageRTT = _AverageRTT()
MedianRTT = _MedianRTT()
AverageDownload = _AverageDownload()
MedianDownload = _MedianDownload()
AverageUpload = _AverageUpload()
MedianUpload = _MedianUpload()

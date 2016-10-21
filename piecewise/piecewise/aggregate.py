from itertools import chain
from sqlalchemy import case, create_engine, func, text, BigInteger, Boolean, Column, DateTime, Float, Integer, MetaData, String, Table
from sqlalchemy.dialects.postgresql import ARRAY, INT8RANGE
from sqlalchemy.sql.expression import and_, or_, between, join, label
from geoalchemy2 import Geometry
from geoalchemy2.functions import GenericFunction, ST_Intersects, ST_X, ST_Y
import datetime
import itertools
import re
import time
import piecewise.maxmind

def aggregate(config, debug=False):
    from sqlalchemy.schema import CreateTable
    engine = create_engine(config.database_uri)
    metadata = MetaData()
    records = config.make_cache_table(metadata)
    for agg in config.aggregations:
        if not debug:
            agg.build_aggregate_table(engine, metadata, records)
        else:
            query = agg.build_aggregate_query(engine, metadata, records)
            print query.compile(engine)

class ST_MakeBox2D(GenericFunction):
    name = 'ST_MakeBox2D'
    type = Geometry

class ST_Point(GenericFunction):
    name = 'ST_Point'
    type = Geometry

class ST_SnapToGrid(GenericFunction):
    name = 'ST_SnapToGrid'
    type = Geometry

class Aggregation(object):
    def __init__(self, name, statistics_table_name, bins, statistics):
        self.name = name
        self.statistics_table_name = statistics_table_name
        self.bins = bins
        self.statistics = statistics

    def build_aggregate_query(self, engine, metadata, records):
        statistics_table = self.make_table(metadata)
        statistics_table.create(engine, checkfirst = True)

        # Delete all records from stats table before aggregating, since
        # subsequent runs append rather than overwite.
        engine.execute(statistics_table.delete())

        selection = records.select().with_only_columns([])
        columns = []
        for b in self.bins:
            cols, selection = b.build_query_to_populate(selection, records, statistics_table)
            columns += cols
        for s in self.statistics:
            cols, selection = s.build_query_to_populate(selection, records, statistics_table)
            columns += cols

        return statistics_table.insert().from_select(columns, selection)

    def build_aggregate_table(self, engine, metadata, records):
        query = self.build_aggregate_query(engine, metadata, records)

        with engine.begin() as conn:
            conn.execute(query)

    def make_table(self, metadata):
        bin_columns = chain.from_iterable(b.postgres_columns for b in self.bins)
        stat_columns = chain.from_iterable(b.postgres_columns for b in self.statistics)
        return Table(self.statistics_table_name, metadata,
                Column('id', Integer, primary_key = True),
                *list(chain(bin_columns, stat_columns)),
                keep_existing = True)

    def selection(self, engine, metadata, bins, filters, statistics):
        table = self.make_table(metadata)

        bin_keys = []
        filter_predicates = []

        selection = table.select().with_only_columns([])
        for b in self.bins:
            if b.label in bins:
                selection = b.build_query_to_report(selection, table, bins[b.label])
            if b.label in filters:
                selection = b.filter_query_to_report(selection, table, filters[b.label])
        for s in statistics:
            selection = s.build_query_to_report(selection, table)

        return selection

    def query(self, engine, metadata, bins, filters, statistics):
        selection = self.selection(engine, metadata, bins, filters, statistics)

        with engine.connect() as conn:
            return conn.execute(selection)

    def __repr__(self):
        return "{name}: table={table} bins={bins} stats={stats}".format(name=self.name, table=self.statistics_table_name, bins=self.bins, stats=self.statistics)


class Aggregator(object):
    def __init__(self, database_uri, cache_table_name, filters, aggregations):
        self.database_uri = database_uri
        self.cache_table_name = cache_table_name
        self.filters = filters
        self.aggregations = aggregations

    def make_cache_table(self, metadata):
        return Table(self.cache_table_name, metadata, 
                Column('id', BigInteger, primary_key = True),
                Column('time', DateTime),
                Column('location', Geometry("POINT", srid=4326)),
                Column('client_ip', BigInteger),
                Column('server_ip', BigInteger),
                Column('countrtt', BigInteger),
                Column('sumrtt', BigInteger),
                Column('download_flag', Boolean),
                Column('download_time', BigInteger),
                Column('download_octets', BigInteger),
                Column('upload_time', BigInteger),
                Column('upload_octets', BigInteger),
                Column('bigquery_key', String),
                Column('test_id', String))

    def make_extra_data_table(self, metadata):
        return Table("extra_data", metadata,
                Column('id', BigInteger, primary_key = True),
                Column("timestamp", DateTime),
                Column("verified", Boolean),
                Column("bigquery_key", String),
                Column("bigquery_test_id", String),
                Column("connection_type", String),
                Column("advertised_download", Integer),
                Column("actual_download", Float),
                Column("advertised_upload", Integer),
                Column("actual_upload", Float),
                Column("min_rtt", Integer),
                Column("location_type", String),
                Column("cost_of_service", Integer),
                Column('client_ip', BigInteger),
                Column("location", Geometry("Point", srid=4326)))

    def ingest_bigquery_query(self):
        select_clause = [
                "web100_log_entry.log_time AS time",
                "connection_spec.client_geolocation.longitude AS longitude",
                "connection_spec.client_geolocation.latitude AS latitude",
                "PARSE_IP(connection_spec.client_ip) AS client_ip",
                "PARSE_IP(connection_spec.server_ip) AS server_ip",
                "web100_log_entry.snap.CountRTT AS countrtt",
                "web100_log_entry.snap.SumRTT AS sumrtt",
                "connection_spec.data_direction AS data_direction",
                "web100_log_entry.snap.SndLimTimeRwin + web100_log_entry.snap.SndLimTimeCwnd + web100_log_entry.snap.SndLimTimeSnd AS download_time",
                "8 * web100_log_entry.snap.HCThruOctetsAcked AS download_octets",
                "web100_log_entry.snap.Duration AS upload_time",
                "8 * web100_log_entry.snap.HCThruOctetsReceived AS upload_octets",
                "CONCAT(String(web100_log_entry.snap.StartTimeStamp % 1000000), String(web100_log_entry.snap.LocalAddress)) AS bigquery_key",
                "test_id"
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
        valid_year_months = itertools.takewhile(lambda x: x <= current_year_month, possible_year_months)

        for f in filters:
            if isinstance(f, TemporalFilter):
                after = time.gmtime(f.after)[:2]
                before = time.gmtime(f.before)[:2]
                valid_year_months = itertools.ifilter(lambda x: after <= x <= before, valid_year_months)

        return ['plx.google:m_lab.ndt.all']

    def bigquery_row_to_postgres_row(self, bq_row):
        bq_row = [f['v'] for f in bq_row['f']]
        timestamp, longitude, latitude, client_ip, server_ip, countrtt, sumrtt, direction, dl_time, dl_octets, ul_time, ul_octets, bigquery_key, test_id = bq_row

        timestamp = timestamp and datetime.datetime.utcfromtimestamp(float(timestamp))
        location = longitude and latitude and "srid=4326;POINT(%f %f)" % (float(longitude), float(latitude))
        client_ip = client_ip and int(client_ip)
        server_ip = server_ip and int(server_ip)
        countrtt = countrtt and int(countrtt)
        sumrtt = sumrtt and int(sumrtt)
        direction = direction and bool(int(direction))
        dl_time = dl_time and float(dl_time)
        dl_octets = dl_octets and int(dl_octets)
        ul_time = ul_time and float(ul_time)
        ul_octets = ul_octets and int(ul_octets)
        bigquery_key = bigquery_key
        test_id = test_id

        pg_row = dict(
                time=timestamp,
                location=location,
                client_ip = client_ip,
                server_ip = server_ip,
                countrtt=countrtt,
                sumrtt = sumrtt,
                download_flag = direction,
                download_time = dl_time,
                download_octets = dl_octets,
                upload_time = ul_time,
                upload_octets = ul_octets,
                bigquery_key = bigquery_key,
                test_id = test_id)

        return pg_row

class Bins(object):
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

    def __init__(self, table, geometry_column, key, join_custom_data, key_type):
        self.table = table
        self.geometry_column = geometry_column
        self.key = key
        self.key_type = key_type
        self.join_custom_data = join_custom_data

    @property
    def postgres_columns(self):
        return [Column('join_key', self.key_type)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.join_key]
        fk = Column(self.key, Integer)
        geom = Column(self.geometry_column, Geometry())
        bins_table = Table(self.table, full_table.metadata, fk, geom)

        if self.join_custom_data: 
            extra_data = Table("extra_data", full_table.metadata, 
                    Column("timestamp", DateTime),
                    Column("verified", Boolean),
                    Column("bigquery_key", String),
                    Column("bigquery_test_id", String),
                    Column("connection_type", String),
                    Column("advertised_download", Integer),
                    Column("actual_download", Float),
                    Column("advertised_upload", Integer),
                    Column("actual_upload", Float),
                    Column("min_rtt", Integer),
                    Column("location_type", String),
                    Column("cost_of_service", Integer),
                    Column("location", Geometry("Point", srid=4326)),
                    keep_existing = True)

            joining = join(full_table, extra_data,
                    and_(extra_data.c.bigquery_test_id == func.left(full_table.c.test_id, func.length(extra_data.c.bigquery_test_id))),
                    isouter = True)
            query = query.select_from(joining)
            location = case([(extra_data.c.verified, func.coalesce(extra_data.c.location, full_table.c.location))], else_ = full_table.c.location)
        else:
            location = full_table.c.location

        select_query = (query.select_from(bins_table)
             .where(ST_Intersects(location, geom))
             .column(fk)
             .group_by(fk))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table, params):
        fk = Column(self.key, Integer)
        geom = Column(self.geometry_column, Geometry())
        join_table = Table(self.table, aggregate_table.metadata, fk, geom)
        if params == 'key':
            query = query.column(label(self.key, aggregate_table.c.join_key))
        else:
            query = query.column(label('geometry', func.ST_AsGeoJSON(func.ST_Collect(geom))))

        return (query
                .select_from(join_table)
                .where(aggregate_table.c.join_key == fk)
                .group_by(aggregate_table.c.join_key))

    def __repr__(self):
        return 'SpatialJoinBins(table={table} geom={geom} key={key} join_custom_data={join}, key_type={key_type})'.format(
                table=self.table, geom=self.geometry_column, key=self.key, join=self.join_custom_data, key_type=self.key_type)

class ISPBins(Bins):
    label = "isp_bins"

    def __init__(self, maxmind_table, rewrites):
        self.maxmind_table = maxmind_table
        self.rewrites = rewrites
        self._maxmind_db = None

    @property
    def postgres_columns(self):
        return [Column("isp", String)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.isp]
        ip_range = Column("ip_range", INT8RANGE)
        isp_name = Column("label", String)
        join_table = Table(self.maxmind_table, full_table.metadata, ip_range, isp_name, keep_existing = True)
        isp_label = label('maxmind_isp', self._sql_rewrite(isp_name))
        select_query = (query.select_from(join_table)
                .where(ip_range.contains(full_table.c.client_ip))
                .column(isp_label)
                .group_by('maxmind_isp'))

        return insert_columns, select_query

    def _sql_rewrite(self, isp_name_col):
        cases = []
        for short_name, patterns in self.rewrites.iteritems():
            tests = [isp_name_col.ilike('%{}%'.format(pat)) for pat in patterns]
            cases.append((or_(*tests), short_name))
        return case(cases, else_ = isp_name_col)

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
        return """ISPBins(maxmind_table={})""".format(self.maxmind_table)

class TemporalBins(Bins):
    label = "time_slices"

    "time units supported by postgres date_trunc"
    _known_units = { 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium' }

    def __init__(self, resolution):
        assert resolution in self._known_units
        self.resolution = resolution

    def build_query_to_populate(self, query, full_table, aggregate_table):
        t = full_table
        truncated_time = func.date_trunc(self.resolution, t.c.time)
        select_query = query.column(truncated_time).group_by(truncated_time)
        insert_columns = [aggregate_table.c.time_step]
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table, params):
        assert params in self._known_units
        res = params

        truncated_time = func.date_trunc(res, aggregate_table.c.time_step)
        return (query
                .column(label("time_slice", func.extract("epoch", truncated_time)))
                .group_by(truncated_time))

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

    def __repr__(self):
        return self.label


class _AverageRTT(Statistic):
    label = "AverageRTT"
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
        return query.column(label('rtt_avg', safe_mean))

    @property
    def postgres_columns(self):
        return [Column('sumrtt', BigInteger), Column('countrtt', Integer)]

class _MedianRTT(Statistic):
    label = "MedianRTT"

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

class _DownloadCount(Statistic):
    label = "DownloadCount"

    @property
    def postgres_columns(self):
        return [Column('download_count', Integer)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.download_count]
        tally = case([(full_table.c.download_flag == True, 1)], else_ = 0)
        select_query = query.column(func.sum(tally))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        return query.column(label("download_count", func.sum(a.c.download_count)))

class _AverageDownload(Statistic):
    label = "AverageDownload"

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
        return query.column(label("download_avg", safe_mean))

class _MedianDownload(Statistic):
    label = "MedianDownload"

    @property
    def postgres_columns(self):
        return [Column('download_samples', ARRAY(Float))]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.download_samples]
        mean = full_table.c.download_octets / full_table.c.download_time
        is_safe = and_(full_table.c.download_time > 0, full_table.c.download_flag == 't')
        safe_mean = case([(is_safe, mean)], else_ = None)
        select_query = (query.column(func.array_agg(safe_mean)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        median = func.median(aggregate_table.c.download_samples)
        return query.column(label("download_median", median))

class _UploadCount(Statistic):
    label = "UploadCount"

    @property
    def postgres_columns(self):
        return [Column('upload_count', Integer)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.upload_count]
        tally = case([(full_table.c.download_flag == False, 1)], else_ = 0)
        select_query = query.column(func.sum(tally))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        return query.column(label("upload_count", func.sum(a.c.upload_count)))

class _AverageUpload(Statistic):
    label = "AverageUpload"

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
        return query.column(label("upload_avg", safe_mean))

class _MedianUpload(Statistic):
    label = "MedianUpload"

    @property
    def postgres_columns(self):
        return [Column('upload_samples', ARRAY(Float))]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.upload_samples]
        mean = full_table.c.upload_octets / full_table.c.upload_time
        is_safe = and_(full_table.c.upload_time > 0, full_table.c.download_flag == 'f')
        safe_mean = case([(is_safe, mean)], else_ = None)
        select_query = (query.column(func.array_agg(safe_mean)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        median = func.median(aggregate_table.c.upload_samples)
        return query.column(label("upload_median", median))

class _DownloadMin(Statistic):
    label = "DownloadMin"

    @property
    def postgres_columns(self):
        return [Column('download_min', Integer)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.download_min]
        mean = full_table.c.download_octets / full_table.c.download_time
        is_safe = and_(full_table.c.download_time > 0, full_table.c.download_flag == 't')
        safe_mean = case([(is_safe, mean)], else_ = None)
        select_query = (query.column(func.min(safe_mean)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        return query.column(label("download_min", func.min(a.c.download_min)))

class _DownloadMax(Statistic):
    label = "DownloadMax"

    @property
    def postgres_columns(self):
        return [Column('download_max', Integer)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.download_max]
        mean = full_table.c.download_octets / full_table.c.download_time
        is_safe = and_(full_table.c.download_time > 0, full_table.c.download_flag == 't')
        safe_mean = case([(is_safe, mean)], else_ = None)
        select_query = (query.column(func.max(safe_mean)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        return query.column(label("download_max", func.max(a.c.download_max)))

class _UploadMin(Statistic):
    label = "UploadMin"

    @property
    def postgres_columns(self):
        return [Column('upload_min', Integer)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.upload_min]
        mean = full_table.c.upload_octets / full_table.c.upload_time
        is_safe = and_(full_table.c.upload_time > 0, full_table.c.download_flag == 'f')
        safe_mean = case([(is_safe, mean)], else_ = None)
        select_query = (query.column(func.min(safe_mean)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        return query.column(label("upload_min", func.min(a.c.upload_min)))

class _UploadMax(Statistic):
    label = "UploadMax"

    @property
    def postgres_columns(self):
        return [Column('upload_max', Integer)]

    def build_query_to_populate(self, query, full_table, aggregate_table):
        insert_columns = [aggregate_table.c.upload_max]
        mean = full_table.c.upload_octets / full_table.c.upload_time
        is_safe = and_(full_table.c.upload_time > 0, full_table.c.download_flag == 'f')
        safe_mean = case([(is_safe, mean)], else_ = None)
        select_query = (query.column(func.max(safe_mean)))
        return insert_columns, select_query

    def build_query_to_report(self, query, aggregate_table):
        a = aggregate_table
        return query.column(label("upload_max", func.max(a.c.upload_max)))

AverageRTT = _AverageRTT()
MedianRTT = _MedianRTT()
DownloadCount = _DownloadCount()
AverageDownload = _AverageDownload()
MedianDownload = _MedianDownload()
UploadCount = _UploadCount()
AverageUpload = _AverageUpload()
MedianUpload = _MedianUpload()
DownloadMin = _DownloadMin()
DownloadMax = _DownloadMax()
UploadMin = _UploadMin()
UploadMax = _UploadMax()

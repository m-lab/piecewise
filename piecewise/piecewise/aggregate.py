from itertools import chain
from sqlalchemy import case, func, Column, Float, Integer, String, Table
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql.expression import label
from geoalchemy2 import Geometry
from geoalchemy2.functions import GenericFunction, ST_Intersects, ST_X, ST_Y
import re
import piecewise.maxmind

class ST_MakeBox2D(GenericFunction):
    name = 'ST_MakeBox2D'
    type = Geometry

class ST_Point(GenericFunction):
    name = 'ST_Point'
    type = Geometry

def make_table(metadata, columns):
    return Table('statistics', metadata,
            Column('id', Integer, primary_key = True),
            Column('time_step', Integer),
            Column('cell', Geometry('POINT')),
            *columns)

class Aggregator(object):
    def __init__(self, database_uri, bins, statistics, filters):
        self.database_uri = database_uri
        self.bins = bins
        self.statistics = statistics
        self.filters = filters

    def make_table(self, metadata):
        bin_columns = chain.from_iterable(b.postgres_columns for b in self.bins)
        stat_columns = chain.from_iterable(b.postgres_columns for b in self.statistics)
        # print list(chain(bin_columns, stat_columns))

        return Table('statistics', metadata, Column('id', Integer, primary_key = True), *list(chain(bin_columns, stat_columns)))

    def ingest_bigquery_query(self):
        bin_selectors = chain.from_iterable(b.bigquery_selector() for b in self.bins)
        aggregate_selectors = chain.from_iterable(a.bigquery_aggregates for a in self.statistics)
        select_clause = list(chain(bin_selectors, aggregate_selectors))

        where_clause = list(chain.from_iterable(f.bigquery_filter() for f in self.filters))

        group_clause = list(chain.from_iterable(b.bigquery_group() for b in self.bins))

        return '\n'.join([
            'SELECT',
            ', '.join(select_clause),
            'FROM [plx.google:m_lab.2010_01.all]',
            'WHERE',
            ' AND '.join(where_clause),
            'GROUP BY',
            ', '.join(group_clause),
            ';'])
        # """
        # SELECT
        #    INTEGER(INTEGER(web100_log_entry.log_time / {resolution}) * {resolution}) AS time_step,
        #    (FLOOR(connection_spec.client_geolocation.latitude * 10) + 0.5) / 10 as lat,
        #    (FLOOR(connection_spec.client_geolocation.longitude * 10) + 0.5) / 10 as long,
        #    {aggregates}
        # FROM [plx.google:m_lab.2010_01.all]
        # WHERE project == 0 AND
        #       IS_EXPLICITLY_DEFINED(web100_log_entry.log_time) AND
        #       web100_log_entry.log_time > {start_date} AND
        #       web100_log_entry.log_time < {end_date} AND
        #       web100_log_entry.is_last_entry == true AND
        #       connection_spec.data_direction == 1
        # GROUP BY time_step, lat, long;
        # """

    def bigquery_row_to_postgres_row(self, bq_row):
        bq_row = [f['v'] for f in bq_row['f']]
        pg_row = dict()
        i = 0
        selectors = iter(self.bins)
        try:
            while i < len(bq_row):
                s = selectors.next()
                n = len(s.bigquery_selector())
                fields = bq_row[i:(i + n)]
                pg_row.update(s.bigquery_to_postgres(*fields))
                i = i + n
        except StopIteration, e:
            pass

        selectors = iter(self.statistics)
        while i < len(bq_row):
            s = selectors.next()
            n = len(s.bigquery_aggregates)
            fields = bq_row[i:(i + n)]
            pg_row.update(s.bigquery_to_postgres(*fields))
            i = i + n

        return pg_row

    def __repr__(self):
        return """Aggregator(bins={bins}, statistics={statistics}, filters={filters})""".format(
                bins=self.bins,
                statistics=self.statistics,
                filters=self.filters)

class Bins(object):
    pass

class SpatialGridBins(Bins):
    label = "spatial_grid"

    def __init__(self, resolution):
        self.resolution = resolution

    def bigquery_selector(self):
        return [
            "(FLOOR(connection_spec.client_geolocation.latitude / {0}) + 0.5) * {0} AS lat".format(self.resolution),
            "(FLOOR(connection_spec.client_geolocation.longitude / {0}) + 0.5) * {0} AS long".format(self.resolution)
        ]

    def bigquery_group(self):
        return ['lat', 'long']

    def bigquery_to_postgres(self, long, lat):
        return [('cell', 'POINT({0} {1})'.format(long, lat))]

    @property
    def postgres_columns(self):
        return [Column('cell', Geometry('POINT'))]

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

class ISPBins(Bins):
    label = "isp_bins"

    def __init__(self, maxmind_file, rewrites):
        self.maxmind_file = maxmind_file
        self.rewrites = rewrites
        self._regexes = None
        self._maxmind_db = None

    @property
    def maxmind_db(self):
        if self._maxmind_db is None:
            self._maxmind_db = piecewise.maxmind.load(self.maxmind_file)
        return self._maxmind_db

    def rewrite(self, isp):
        if isp is not None:
            if self._regexes is None:
                self._regexes = []
                for alias, patterns in self.rewrites.iteritems():
                    regex = re.compile('|'.join(re.escape(i) for i in patterns))
                    self._regexes.append((alias, regex))
            for (alias, regex) in self._regexes:
                if regex.search(isp):
                    return alias

    def bigquery_selector(self):
        return ['PARSE_IP(connection_spec.client_ip) AS ip_addr']

    def bigquery_group(self):
        return ["ip_addr"]

    def bigquery_to_postgres(self, ip):
        result = piecewise.maxmind.lookup(self.maxmind_db, int(ip))
        return [('isp', self.rewrite(result))]

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

    def __repr__(self):
        return """ISPBins""".format(
                resolution=self.resolution)

class TemporalBins(Bins):
    label = "time_slices"

    def __init__(self, resolution):
        self.resolution = resolution

    def bigquery_selector(self):
        return ["INTEGER(INTEGER(web100_log_entry.log_time / {0}) * {0}) AS time_step".format(self.resolution)]

    def bigquery_group(self):
        return ["time_step"]

    def bigquery_to_postgres(self, time):
        return [('time_step', time)]

    @property
    def postgres_columns(self):
        return [Column('time_step', Integer)]

    def postgres_aggregates(self, resolution):
        if isinstance(resolution, basestring):
            try:
                resolution = int(resolution)
            except ValueError:
                resolution = self.resolution
        return [label('time_slice', func.floor(Column("time_step") / resolution) * resolution)]

    def postgres_filters(self, params):
        if isinstance(params, basestring):
            params = map(int, params.split(","))
        after, before = params
        time = Column("time_step")
        return [time > after, time < before]

    def __repr__(self):
        return """Timeslices(res={resolution})""".format(
                resolution=self.resolution)


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
    @property
    def bigquery_aggregates(self):
        return ['SUM(web100_log_entry.snap.SumRTT)', 'SUM(web100_log_entry.snap.CountRTT)']

    @property
    def postgres_columns(self):
        return [Column('sumrtt', Integer), Column('countrtt', Integer)]

    @property
    def postgres_aggregates(self):
        return [label('AverageRTT', case([(func.sum(Column('countrtt')) > 0, func.sum(Column('sumrtt')) / func.sum(Column('countrtt')))], else_= None))]

    def __repr__(self):
        return "AverageRTT"

class _MinRTT(Statistic):
    @property
    def bigquery_aggregates(self):
        return ['MIN(web100_log_entry.snap.MinRTT)']

    @property
    def postgres_columns(self):
        return [Column('minrtt', Integer)]

    @property
    def postgres_aggregates(self):
        return [func.min(Column('minrtt'))]

    def __repr__(self):
        return "MinRTT"

class _MedianRTT(Statistic):
    @property
    def bigquery_aggregates(self):
        return ['GROUP_CONCAT(STRING(web100_log_entry.snap.SumRTT / web100_log_entry.snap.CountRTT))']

    def bigquery_to_postgres(self, value):
        if value:
            return [('rtt_samples', (float(f) for f in value.split(",")))]
        else:
            return [('rtt_samples', None)]

    @property
    def postgres_columns(self):
        return [Column('rtt_samples', ARRAY(Float))]

    @property
    def postgres_aggregates(self):
        return [] # label('MedianRTT', ???)]

    def __repr__(self):
        return "MedianRTT"

AverageRTT = _AverageRTT()
MedianRTT = _MedianRTT()
MinRTT = _MinRTT()

"""
Configuration parser for Piecewise
"""

import calendar, time
import piecewise.aggregate
from piecewise.aggregate import Aggregator, Bins, Statistic, Filter

def parse_date(utc_time):
    return calendar.timegm(time.strptime(utc_time, '%b %d %Y %H:%M:%S'))

def read_config(config):
    "Construct an aggregator from a parsed JSON document"
    assert config.get("piecewise_version") == "1.0", "Configuration must be for v1.0 of piecewise"

    database_uri = config['database_uri']
    bins = [_read_bin(b) for b in config['bins']]
    statistics = [_read_statistic(s) for s in config['statistics']]
    filters = [_read_filter(f) for f in config.get('filters', [])]

    return Aggregator(database_uri, bins, statistics, filters)

def _read_bin(bin_spec):
    typ = bin_spec['type']
    if typ == 'spatial_grid':
        resolution = bin_spec['resolution']
        return piecewise.aggregate.SpatialGridBins(resolution)
    elif typ == 'spatial_hexes':
        raise Exception('Spatial hex bins not yet implemented')
    elif typ == 'spatial_join':
        raise Exception('Spatial joins not yet implemented')
    elif typ == 'time_slices':
        resolution = bin_spec['resolution']
        return piecewise.aggregate.TemporalBins(resolution)
    raise Exception("Unknown bin type {0}".format(typ))

known_statistics = {
       'AverageRTT' : piecewise.aggregate.AverageRTT,
       'MinRTT' : piecewise.aggregate.MinRTT
   }

def _read_statistic(stat_spec):
    return known_statistics[stat_spec['type']]

def _read_filter(filter_spec):
    typ = filter_spec['type']
    if typ == 'temporal':
        after = parse_date(filter_spec['after'])
        before = parse_date(filter_spec['before'])
        return piecewise.aggregate.TemporalFilter(after, before)
    elif typ == 'bbox':
        return piecewise.aggregate.BBoxFilter(filter_spec['bbox'])
    elif typ == 'geojson':
        return piecewise.aggregate.GeoJsonFilter(filter_spec['geojson'])
    elif typ == 'raw':
        return piecewise.aggregate.RawFilter(filter_spec['query'])
    raise Exception("Unknown filter type {0}".format(typ))

if __name__ == '__main__':
    import sys, json
    print read_config(json.load(open(sys.argv[1]))).ingest_bigquery_query()

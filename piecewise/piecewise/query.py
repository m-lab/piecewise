from itertools import chain
from piecewise.aggregate import AverageRTT
from sqlalchemy import and_, create_engine, func, select, MetaData
from geoalchemy2 import Geometry
from geoalchemy2.functions import GenericFunction, ST_X, ST_Y

def query(config, aggregates, bins, filters):
    engine = create_engine(config.database_uri)
    metadata = MetaData()
    metadata.bind = engine
    table = config.make_table(metadata)

    bin_keys = []
    filter_predicates = []

    selection = table.select().with_only_columns([])
    for b in config.bins:
        if b.label in bins:
            selection = b.build_query_to_report(selection, table, bins[b.label])
        if b.label in filters:
            selection = b.filter_query_to_report(selection, table, filters[b.label])
    for a in aggregates:
        selection = a.build_query_to_report(selection, table)

    with engine.connect() as conn:
        return conn.execute(selection)

if __name__ == '__main__':
    import sys, json
    import piecewise.config
    config = piecewise.config.read_config(json.load(open(sys.argv[1])))
    results = query(config, 
            [AverageRTT],
            bins = { 'isp_bins' : "" , "time_slices" : str(3 * 3600) }, 
            filters = {}) # { 'spatial_grid' : (0, 0, 10, 10) })
    for r in results:
        print '\t'.join(str(c) for c in r)


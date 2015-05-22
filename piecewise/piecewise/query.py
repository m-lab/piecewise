from itertools import chain
from piecewise.aggregate import AverageRTT, make_table, ST_MakeBox2D, ST_Point, SpatialGridBins
from sqlalchemy import create_engine, func, select, MetaData
from geoalchemy2 import Geometry
from geoalchemy2.functions import GenericFunction, ST_X, ST_Y

def query(config, aggregates, bins, filters):
    pg_columns = list(chain.from_iterable([c for c in a.postgres_columns] for a in aggregates))
    db_uri = 'postgresql+psycopg2://postgres:@/piecewise'
    engine = create_engine(db_uri)
    metadata = MetaData()
    metadata.bind = engine
    table = config.make_table(metadata)

    bin_keys = []
    for b in config.bins:
        if b.label in bins:
            bin_keys = bin_keys + b.postgres_aggregates(bins[b.label])

    filter_predicates = []
    for b in config.bins:
        if b.label in filters:
            filter_predicates = filter_predicates + b.postgres_filters(filters[b.label])

    payload_aggregates = list(chain.from_iterable([x for x in a.postgres_aggregates] for a in aggregates))

    q = select(bin_keys + payload_aggregates) \
            .select_from(table)
    if len(bin_keys) != 0:
        q = q.group_by(*bin_keys)
    if len(filter_predicates) != 0:
        q = q.where(reduce(lambda x, y: x & y, filter_predicates))

    with engine.connect() as conn:
        return list(conn.execute(q))

if __name__ == '__main__':
    import sys, json
    import piecewise.config
    config = piecewise.config.read_config(json.load(open(sys.argv[1])))
    results = query(config, 
            [AverageRTT],
            bins = { 'spatial_grid' : 1 },
            filters = dict()) # { 'spatial_grid' : (0, 0, 10, 10) })
    for r in results:
        print '\t'.join(str(c) for c in r)


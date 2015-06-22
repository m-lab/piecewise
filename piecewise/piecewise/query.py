from itertools import chain
from piecewise.aggregate import AverageRTT
from sqlalchemy import and_, create_engine, func, select, MetaData
from geoalchemy2 import Geometry
from geoalchemy2.functions import GenericFunction, ST_X, ST_Y

def query(config, name, statistics, bins, filters):
    engine = create_engine(config.database_uri)
    metadata = MetaData()
    metadata.bind = engine

    aggregation = None
    for a in config.aggregations:
        if a.name == name:
            aggregation = a

    if aggregation is None:
        raise Exception("unknown aggregation: " + name)

    return aggregation.query(engine, metadata, bins, filters, statistics)


if __name__ == '__main__':
    import piecewise.config
    config = piecewise.config.read_system_config()
    results = query(config, 
            'by_census_block',
            [AverageRTT],
            bins = { 'isp_bins' : "" , "time_slices" : 'hour' }, 
            filters = {}) # { 'spatial_grid' : (0, 0, 10, 10) })
    for r in results:
        print '\t'.join(str(c) for c in r)


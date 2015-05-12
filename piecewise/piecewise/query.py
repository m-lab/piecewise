from piecewise.aggregate import AverageRTT, make_table
from sqlalchemy import create_engine, func, select, MetaData
from geoalchemy2 import Geometry
from geoalchemy2.functions import GenericFunction, ST_X, ST_Y
import time

class ST_MakeBox2D(GenericFunction):
    name = 'ST_MakeBox2D'
    type = Geometry

class ST_Point(GenericFunction):
    name = 'ST_Point'
    type = Geometry

def query(start_date, end_date, resolution, aggregates):
    pg_columns = sum([[c for c in a.postgres_columns] for a in aggregates], [])
    db_uri = 'postgresql+psycopg2://postgres:@/piecewise'
    engine = create_engine(db_uri)
    metadata = MetaData()
    records = make_table(metadata, pg_columns)
    metadata.bind = engine

    pg_aggregates = sum([[x for x in a.postgres_aggregates] for a in aggregates], [])

    with engine.connect() as conn:
        snapped_time = (records.c.time_step / resolution) * resolution
        q = select([snapped_time] + pg_aggregates) \
                .select_from(records) \
                .where(
                    (records.c.time_step > start_date) & 
                    (records.c.time_step < end_date)) \
                .group_by(snapped_time) \
                .order_by(snapped_time)
        results = conn.execute(q)
        return list(results)

def geoquery(lower_left, upper_right, resolution, aggregates):
    pg_columns = sum([[c for c in a.postgres_columns] for a in aggregates], [])
    db_uri = 'postgresql+psycopg2://postgres:@/piecewise'
    engine = create_engine(db_uri)
    metadata = MetaData()
    records = make_table(metadata, pg_columns)
    metadata.bind = engine

    pg_aggregates = sum([[x for x in a.postgres_aggregates] for a in aggregates], [])

    with engine.connect() as conn:
        snapped_x = func.floor(ST_X(records.c.cell) / resolution)
        snapped_y = func.floor(ST_Y(records.c.cell) / resolution)
        q = select([snapped_x, snapped_y] + pg_aggregates) \
                .select_from(records) \
                .group_by(snapped_x, snapped_y) \
                .where(records.c.cell.ST_Intersects(ST_MakeBox2D(
                    ST_Point(lower_left[0] * resolution, lower_left[1] * resolution),
                    ST_Point((upper_right[0] + 1) * resolution, (upper_right[1] + 1) * resolution))))
#                 .where(
#                         ST_MakeBox2D(
#                             ST_MakePoint(snapped_x * resolution, snapped_y * resolution),
#                             ST_MakePoint((snapped_x + 1) * resolution, (snapped_y + 1) * resolution)) \
        results = conn.execute(q)
        return list(results)

if __name__ == '__main__':
    from piecewise.ingest import parse_date
    results = geoquery(
            lower_left = (0, 0),
            upper_right = (10, 10),
            resolution = 1,
            aggregates = [AverageRTT]
    )
    for r in results:
        print '\t'.join(str(c) for c in r)


from piecewise.aggregate import AverageRTT, make_table
from sqlalchemy import create_engine, select, MetaData
import time

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

if __name__ == '__main__':
    from piecewise.ingest import parse_date
    results = query(
            start_date = parse_date('Jan 1 2010 00:00:00'),
            end_date = parse_date('Feb 1 2010 00:00:00'),
            resolution = 3600,
            aggregates = [AverageRTT]
    )
    for r in results:
        print '\t'.join([time.ctime(r[0])] + [str(c) for c in r[1:]])


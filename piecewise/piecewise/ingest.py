from piecewise.bigquery import bigquery_service, PROJECT_NUMBER
from piecewise.aggregate import AverageRTT, make_table
from sqlalchemy import create_engine, func, Column, Float, Integer, MetaData, String, Table
import calendar
import time

def build_query(start_date, end_date, resolution, aggregates):
    query_template = """
        SELECT
           INTEGER(INTEGER(web100_log_entry.log_time / {resolution}) * {resolution}) AS time_step,
           {aggregates}
        FROM [plx.google:m_lab.2010_01.all]
        WHERE project == 0 AND
              IS_EXPLICITLY_DEFINED(web100_log_entry.log_time) AND
              web100_log_entry.log_time > {start_date} AND
              web100_log_entry.log_time < {end_date} AND
              web100_log_entry.is_last_entry == true AND
              connection_spec.data_direction == 1
        GROUP BY time_step;
    """
    return query_template.format(
            start_date = start_date,
            end_date = end_date,
            resolution = resolution,
            aggregates = ', '.join(aggregates)
        )

def make_record(columns, row):
    field_names = ['time_step'] + [c.name for c in columns]
    return dict(zip(field_names, (f['v'] for f in row['f'])))

def make_request(query):
    return { 'configuration' : { 'query' : { 'query' : query } } }

def parse_date(utc_time):
    return calendar.timegm(time.strptime(utc_time, '%b %d %Y %H:%M:%S'))

def ingest(start_date, end_date, resolution, aggregates):
    pg_columns = sum([[c for c in a.postgres_columns] for a in aggregates], [])
    db_uri = 'postgresql+psycopg2://postgres:@/piecewise'
    engine = create_engine(db_uri)
    metadata = MetaData()
    records = make_table(metadata, pg_columns)
    metadata.create_all(engine)

    bq_aggregates = sum([[c for c in a.bigquery_aggregates] for a in aggregates], [])
    query = build_query(
            start_date = start_date,
            end_date = end_date,
            resolution = resolution,
            aggregates = bq_aggregates)

    query_reference = bigquery_service.jobs().insert(
            projectId = PROJECT_NUMBER,
            body = make_request(query)).execute()
    jobId = query_reference['jobReference']['jobId']

    check_job = bigquery_service.jobs().get(projectId = PROJECT_NUMBER, jobId = jobId)
    job_status = check_job.execute()
    while job_status['status']['state'] != 'DONE':
        print 'Waiting 10s for BigQuery result'
        time.sleep(10)
        job_status = check_job.execute()

    query_response = bigquery_service.jobs().getQueryResults(projectId = PROJECT_NUMBER, jobId = jobId).execute()
    inserter = records.insert()
    page_count = 0
    record_count = 0

    while True:
        page_count = page_count + 1
        record_count = record_count + len(query_response['rows'])
        print 'Storing page {0} of results in postgres, total of {1} records'.format(page_count, record_count)

        with engine.begin() as conn:
            # TODO: Batch these up to reduce the number of db queries.  The
            # batch size will need to be smaller than the pages we're getting
            # from BigQuery, if we just do the whole page then we run into
            # out-of-memory errors.
            for row in query_response['rows']:
                conn.execute(inserter, **make_record(pg_columns, row))
            
        page_token = query_response.get('pageToken')
        del query_response
        if page_token is not None:
            query_response = bigquery_service.jobs().getQueryResults(projectId = PROJECT_NUMBER, jobId = jobId, pageToken = page_token).execute()
        else:
            break

if __name__ == '__main__':
    ingest(
            start_date = parse_date('Jan 1 2010 00:00:00'),
            end_date = parse_date('Feb 1 2010 00:00:00'),
            resolution = 60,
            aggregates = [AverageRTT]
    )


import piecewise.bigquery
import piecewise.aggregate
from sqlalchemy import create_engine, func, text, Column, Float, Integer, MetaData, String, Table
from sqlalchemy.sql.expression import label
import calendar
import datetime
import itertools
import time
import sys

def make_request(query):
    return { 'configuration' : { 'query' : { 'query' : query } } }

def ingest(config):
    engine = create_engine(config.database_uri)
    metadata = MetaData()
    records = config.make_cache_table(metadata)
    metadata.create_all(engine)

    engine.execute(records.delete())

    query = config.ingest_bigquery_query()
    bigquery_service = piecewise.bigquery.client()

    start_time = time.time()
    query_reference = bigquery_service.jobs().insert(
            projectId = piecewise.bigquery.PROJECT_NUMBER,
            body = make_request(query)).execute()
    jobId = query_reference['jobReference']['jobId']

    check_job = bigquery_service.jobs().get(projectId = piecewise.bigquery.PROJECT_NUMBER, jobId = jobId)
    job_status = check_job.execute()
    print 'Waiting for BigQuery, this could take several minutes.'
    while job_status['status']['state'] != 'DONE':
        print '.',
        sys.stdout.flush()
        time.sleep(10)
        job_status = check_job.execute()
    finish_time = time.time()
    print ''
    print 'Took %d s to complete'.format(finish_time - start_time)

    query_response = bigquery_service.jobs().getQueryResults(projectId = piecewise.bigquery.PROJECT_NUMBER, jobId = jobId, maxResults = 10000).execute()
    inserter = records.insert()
    page_count = 0
    record_count = 0

    while query_response['totalRows'] > 0:
        page_count = page_count + 1
        record_count = record_count + len(query_response['rows'])
        total_rows = query_response['totalRows']
        print 'Storing page {0} of results in postgres, total of {1}/{2} records'.format(page_count, record_count, total_rows)

        with engine.begin() as conn:
            rows = [config.bigquery_row_to_postgres_row(r) for r in query_response['rows']]
            conn.execute(inserter, rows)
            
        page_token = query_response.get('pageToken')
        del query_response
        if page_token is not None:
            query_response = bigquery_service.jobs().getQueryResults(projectId = piecewise.bigquery.PROJECT_NUMBER, jobId = jobId, maxResults = 1000, pageToken = page_token).execute()
        else:
            break

if __name__ == '__main__':
    import piecewise.config
    config = piecewise.config.read_system_config()
    ingest(config)
    piecewise.aggregate.aggregate(config)

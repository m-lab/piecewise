from piecewise.bigquery import bigquery_service, PROJECT_NUMBER
from piecewise.aggregate import AverageRTT, make_table
from sqlalchemy import create_engine, func, Column, Float, Integer, MetaData, String, Table
import calendar
import time

def make_request(query):
    return { 'configuration' : { 'query' : { 'query' : query } } }

def ingest(config):
    db_uri = 'postgresql+psycopg2://postgres:@/piecewise'
    engine = create_engine(db_uri)
    metadata = MetaData()
    records = config.make_table(metadata)
    metadata.create_all(engine)

    query = config.ingest_bigquery_query()

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

    query_response = bigquery_service.jobs().getQueryResults(projectId = PROJECT_NUMBER, jobId = jobId, maxResults = 10000).execute()
    inserter = records.insert()
    page_count = 0
    record_count = 0

    while True:
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
            query_response = bigquery_service.jobs().getQueryResults(projectId = PROJECT_NUMBER, jobId = jobId, maxResults = 1000, pageToken = page_token).execute()
        else:
            break

if __name__ == '__main__':
    import sys, json
    import piecewise.config
    config = piecewise.config.read_config(json.load(open(sys.argv[1])))
    ingest(config)

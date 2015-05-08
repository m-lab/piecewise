from sqlalchemy import func, Column, Integer, Table

def make_table(metadata, columns):
    return Table('statistics', metadata,
            Column('id', Integer, primary_key = True),
            Column('time_step', Integer),
            *columns)

class Aggregate(object):
    def __init__(self, bigquery_aggregates, postgres_columns, postgres_aggregates):
        self.bigquery_aggregates = bigquery_aggregates
        self.postgres_columns = postgres_columns
        self.postgres_aggregates = postgres_aggregates

AverageRTT = Aggregate(
    bigquery_aggregates = ['SUM(web100_log_entry.snap.SumRTT)', 'SUM(web100_log_entry.snap.CountRTT)'],
    postgres_columns = [Column('sumrtt', Integer), Column('countrtt', Integer)],
    postgres_aggregates = [func.sum(Column('sumrtt')) / func.sum(Column('countrtt'))]
)

MinRTT = Aggregate(
    bigquery_aggregates = ['MIN(web100_log_entry.snap.MinRTT)'],
    postgres_columns = [Column('minrtt', Integer)],
    postgres_aggregates = [func.min(Column('minrtt'))]
)

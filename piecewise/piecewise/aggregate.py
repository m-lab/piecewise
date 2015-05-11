from sqlalchemy import func, Column, Integer, Table

def make_table(metadata, columns):
    return Table('statistics', metadata,
            Column('id', Integer, primary_key = True),
            Column('time_step', Integer),
            *columns)

class Aggregate(object):
    pass

class _AverageRTT(Aggregate):
    @property
    def bigquery_aggregates(self):
        return ['SUM(web100_log_entry.snap.SumRTT)', 'SUM(web100_log_entry.snap.CountRTT)']

    @property
    def postgres_columns(self):
        return [Column('sumrtt', Integer), Column('countrtt', Integer)]

    @property
    def postgres_aggregates(self):
        return [func.sum(Column('sumrtt')) / func.sum(Column('countrtt'))]

class _MinRTT(Aggregate):
    @property
    def bigquery_aggregates(self):
        return ['MIN(web100_log_entry.snap.MinRTT)']

    @property
    def postgres_columns(self):
        return [Column('minrtt', Integer)]

    @property
    def postgres_aggregates(self):
        return [func.min(Column('minrtt'))]

AverageRTT = _AverageRTT()
MinRTT = _MinRTT()

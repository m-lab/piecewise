from sqlalchemy import create_engine, Column, Integer, MetaData, String, Table

if __name__ == '__main__':
    db_uri = 'postgresql+psycopg2://postgres:@/piecewise'
    engine = create_engine(db_uri)
    metadata = MetaData()
    records = Table('records', metadata,
      Column('id', Integer, primary_key=True),
      Column('value', String))
    metadata.create_all(engine)

    inserter = records.insert()
    with engine.begin() as conn:
        conn.execute(inserter, [
            { 'value': "rutabaga" },
            { 'value': "turnip" },
            { 'value': "yam" }
        ])

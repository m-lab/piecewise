from flask import Flask
from sqlalchemy import create_engine, select, MetaData, Table, Column, String, Integer
app = Flask(__name__)

engine = create_engine('postgresql+psycopg2://postgres:@/piecewise')
metadata = MetaData()
records = Table('records', metadata,
	Column('id', Integer, primary_key=True),
	Column('value', String))

@app.route('/')
def hello_world():
    return ("Goodbye World!", None, { 'Content-type' : 'text/plain' })

@app.route('/list')
def list_records():
    with engine.begin() as conn:
        result = conn.execute(select([records]))
        return '\n'.join(row['value'] for row in result)

if __name__ == '__main__': 
    app.run()

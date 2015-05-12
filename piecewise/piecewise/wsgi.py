from flask import Flask, request
from flask.json import dumps
from piecewise.aggregate import AverageRTT
from piecewise.ingest import parse_date
from piecewise.query import geoquery, query
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
    resolution = request.args.get('res', 60, type=int)
    after = request.args.get('after', parse_date('Jan 1 2010 00:00:00'))
    before = request.args.get('before', parse_date('Feb 1 2010 00:00:00'))
    results = query(
            start_date = after,
            end_date = before,
            resolution = resolution,
            aggregates = [AverageRTT]
    )
    results = { 'success': True, 'results': [list(r) for r in results] }
    return (dumps(results), None, { 'Content-type': 'application/json' })

@app.route('/cells')
def map_records():
    resolution = request.args.get('res', 1, type=int)
    ll = request.args.get('ll', "-90,-180")
    ur = request.args.get('ur', "90,180")
    ll = tuple(float(s) for s in ll.split(",", 1))
    ur = tuple(float(s) for s in ur.split(",", 1))
    results = geoquery(
        lower_left = ll,
        upper_right = ur,
        resolution = resolution,
        aggregates = [AverageRTT])
    results = { 'success': True, 'results': [list(r) for r in results] }
    return (dumps(results), None, { 'Content-type': 'application/json' })

if __name__ == '__main__': 
    app.run(debug=True)

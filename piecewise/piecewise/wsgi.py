from flask import Flask, request
from flask.json import dumps
from piecewise.aggregate import AverageRTT
from piecewise.config import parse_date
from piecewise.query import query
from sqlalchemy import create_engine, select, MetaData, Table, Column, String, Integer
app = Flask(__name__)
if not app.debug:
    import logging
    import logging.handlers
    handler = logging.handlers.RotatingFileHandler("/var/log/piecewise/wsgi.log", maxBytes = 10 * 1000 * 1000, backupCount = 5)
    handler.setLevel(logging.WARNING)
    app.logger.addHandler(handler)

import json
import piecewise.config
config = piecewise.config.read_config(json.load(open('/vagrant/piecewise/sample_config.json')))

@app.route('/')
def hello_world():
    return ("Goodbye World!", None, { 'Content-type' : 'text/plain' })

@app.route('/list')
def list_records():
    resolution = request.args.get('res', 60, type=int)
    after = request.args.get('after', parse_date('Jan 1 2010 00:00:00'))
    before = request.args.get('before', parse_date('Feb 1 2010 00:00:00'))
    results = general_query(config,
            [AverageRTT],
            bins = { 'time_slices' : resolution },
            filters = { 'time_slices' : (after, before) })
    results = { 'success': True, 'results': [list(r) for r in results] }
    return (dumps(results), None, { 'Content-type': 'application/json' })

@app.route('/cells')
def map_records():
    resolution = request.args.get('res', 1, type=float)
    ll = request.args.get('ll', "-90,-180")
    ur = request.args.get('ur', "90,180")
    minx, miny = tuple(float(s) for s in ll.split(",", 1))
    maxx, maxy = tuple(float(s) for s in ur.split(",", 1))

    results = general_query(config, 
            [AverageRTT],
            bins = { 'spatial_grid' : resolution },
            filters =  { 'spatial_grid' : (minx, miny, maxx, maxy) })

    results = { 'success': True, 'results': [list(r) for r in results] }
    return (dumps(results), None, { 'Content-type': 'application/json' })

if __name__ == '__main__': 
    app.run(debug=True)

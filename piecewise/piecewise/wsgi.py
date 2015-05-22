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

@app.route("/q")
def query_statistics():
    filters = dict()
    bins = dict()
    for k, v in request.args.iteritems():
        if k.startswith("f."):
            filters[k[2:]] = v
        elif k.startswith("b."):
            bins[k[2:]] = v
    stats = request.args.get("stats","").split(",")
    stats = [piecewise.config.known_statistics[s] for s in stats]

    results = query(config, stats, bins, filters)
    results = { 'keys': results.keys(), 'results' : [list(r) for r in results] }
    return (dumps(results), None, { 'Content-type' : 'application/json' })

if __name__ == '__main__': 
    app.run(debug=True)

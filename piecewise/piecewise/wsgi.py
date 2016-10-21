import decimal
from flask import Flask, request
from flask.json import dumps
from piecewise.aggregate import AverageRTT
from piecewise.config import parse_date
from piecewise.query import query
from sqlalchemy import create_engine, select, MetaData, Table, Column, String, Integer
import StringIO
import csv
app = Flask(__name__)
if not app.debug:
    import logging
    import logging.handlers
    handler = logging.handlers.RotatingFileHandler("/var/log/piecewise/wsgi.log", maxBytes = 10 * 1000 * 1000, backupCount = 5)
    handler.setLevel(logging.WARNING)
    app.logger.addHandler(handler)

import json
import piecewise.config
config = piecewise.config.read_system_config()

@app.route("/q/<aggregation>")
def query_statistics(aggregation):
    filters = dict()
    bins = dict()
    for k, v in request.args.iteritems():
        if k.startswith("f."):
            filters[k[2:]] = v
        elif k.startswith("b."):
            bins[k[2:]] = v
    stats = request.args.get("stats","").split(",")
    stats = [piecewise.config.known_statistics[s] for s in stats]

    results = query(config, aggregation, stats, bins, filters)
    if request.args.get("format", "json") == "csv":
        results = _rows_to_csv(results)
        return (results, None, { 'Content-type' : 'text/csv' })
    else:
        results = _rows_to_geojson(results)
        return (dumps(results), None, { 'Content-type' : 'application/json' })

def _rows_to_csv(rows):
    stringio = StringIO.StringIO()
    try:
        writer = csv.writer(stringio)
        writer.writerow(rows.keys())
        for row in rows:
            writer.writerow(list(row))
        return stringio.getvalue()
    finally:
        stringio.close()

def _rows_to_geojson(rows):
    geometry_key = None
    keys = rows.keys()
    for possible_key in ['cell', 'geometry']:
        if possible_key in keys:
            geometry_key = possible_key
            break
    if geometry_key is not None:
        def row_to_feature(r):
            properties = dict(r.items())
            geometry = json.loads(properties[geometry_key])
            del properties[geometry_key]
            return {
                "type" : "Feature",
                "geometry" : geometry,
                "properties" : properties
            }
    else:
        def row_to_feature(r):
            properties = dict(r.items())
            for k, v in properties.iteritems():
                if isinstance(v, decimal.Decimal):
                    properties[k] = float(v)
            geometry = None
            return {
                "type" : "Feature",
                "geometry" : geometry,
                "properties" : properties
            }

    return {
        "type" : "FeatureCollection",
        "features" : [row_to_feature(r) for r in rows]
    }

if __name__ == '__main__': 
    app.run(debug=True)

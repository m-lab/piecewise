from flask import Flask, Response, request
from flask.json import dumps
from sqlalchemy import create_engine, select, text, MetaData, Table, String, Integer, BigInteger, Boolean, Column, DateTime, String, Integer
from geoalchemy2 import Geometry
import ipaddress
import datetime


app = Flask(__name__)

if not app.debug:
    import logging
    import logging.handlers
    handler = logging.handlers.RotatingFileHandler("/var/log/piecewise/collector.log", maxBytes = 10 * 1000 * 1000, backupCount = 5)
    handler.setLevel(logging.WARNING)
    app.logger.addHandler(handler)

metadata = MetaData()
engine = create_engine("postgresql+psycopg2://postgres:@/piecewise")
metadata.bind = engine
extra_data = Table('extra_data', metadata, 
        Column('id', Integer, primary_key = True),
        Column('timestamp', DateTime),
        Column('verified', Boolean),
        Column('bigquery_key', String),
        Column('location', Geometry("Point", srid=4326)),
        Column('connection_type', String),
        Column('advertised_download', Integer),
        Column('advertised_upload', Integer),
        Column('location_type', String),
        Column('cost_of_service', Integer))
metadata.create_all()

@app.route("/collect", methods=['POST'])
def append_extra_data():
    location_types = ['residence', 'workplace', 'business', 'public', 'other']
    connection_types = ['cable', 'dsl', 'fiber', 'mobile', 'other']

    try:
        if request.form['longitude'] and request.form['latitude']:
            longitude = float(request.form['longitude'])
            latitude = float(request.form['latitude'])
            location = 'srid=4326;POINT(%f %f)' % (longitude, latitude)
    except Exception, e:
        location = None
        app.logger.exception(e)

    if request.form['connection_type'] in connection_types:
        connection_type = request.form['connection_type']
    else:
        connection_type = None

    if request.form['location_type'] in location_types:
        location_type = request.form['location_type']
    else:
        location_type = None

    try:
        advertised_download = int(request.form['advertised_download'])
    except Exception, e:
        advertised_download = None
        app.logger.exception(e)

    try:
        advertised_upload = int(request.form['advertised_upload'])
    except Exception, e:
        advertised_upload = None
        app.logger.exception(e)

    try:
        cost_of_service = float(request.form['cost_of_service'])
    except Exception, e:
        cost_of_service = None
        app.logger.exception(e)

    if len(request.form['bigquery_key']) < 100:
        bigquery_key = request.form['bigquery_key']
    else:
        bigquery_key = None

    try:
        with engine.begin() as conn:
            query = extra_data.insert(dict(
                bigquery_key = bigquery_key,
                location = location,
                connection_type = connection_type,
                advertised_download = advertised_download,
                advertised_upload = advertised_upload,
                location_type = location_type,
                cost_of_service = cost_of_service))
            conn.execute(query)
        return ("", 201, {})
    except Exception, e:
        app.logger.exception(e)
        return ("Failed due to error: " + str(e), 400, {})

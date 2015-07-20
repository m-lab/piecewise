from flask import Flask, Response, request
from flask.json import dumps
from sqlalchemy import create_engine, select, text, MetaData, Table, String, Integer, Numeric, BigInteger, Boolean, Column, DateTime, String, Integer
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
        Column('latitude', Numeric),
        Column('longitude', Numeric),
        Column('connection_type', String),
        Column('advertised_download', Integer),
        Column('advertised_upload', Integer),
        Column('location_type', String),
        Column('cost_of_service', Integer))
metadata.create_all()

@app.route("/collect", methods=['POST'])
def append_extra_data():
    try:
        bigquery_key = request.form['bigquery_key']
        latitude = float(request.form['latitude'])
        longitude = float(request.form['longitude'])
        connection_type = request.form['connection_type']
        advertised_download = int(request.form['advertised_download'])
        advertised_upload = int(request.form['advertised_upload'])
        location_type = request.form['location_type']
        cost_of_service = int(request.form['cost_of_service'])

        with engine.begin() as conn:
            query = extra_data.insert(dict(
                bigquery_key = bigquery_key,
                latitude = latitude,
                longitude = longitude,
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

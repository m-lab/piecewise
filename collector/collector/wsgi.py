from flask import Flask, Response, request
from flask.json import dumps
from sqlalchemy import create_engine, select, text, MetaData, Table, BigInteger, Boolean, Column, DateTime, String, Integer
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
        Column('verified', Boolean, server_default = text("False")),
        Column('timestamp', DateTime),
        Column('client_ip', BigInteger),
        Column('server_ip', BigInteger),
        Column('location', Geometry('POINT', srid=4326)))
metadata.create_all()

@app.route("/collect", methods=['POST'])
def append_extra_data():
    try:
        timestamp = datetime.datetime.utcfromtimestamp(float(request.form['timestamp']))
        client_ip = int(ipaddress.ip_address(request.form['client_ip']))
        server_ip = int(ipaddress.ip_address(request.form['server_ip']))
        latitude = float(request.form['latitude'])
        longitude = float(request.form['longitude'])
        with engine.begin() as conn:
            query = extra_data.insert(dict(
                timestamp = timestamp,
                client_ip = client_ip,
                server_ip = server_ip,
                location = "srid=4326; POINT(%f %f)" % (longitude, latitude)))
            conn.execute(query)
        return ("", 201, {})
    except Exception, e:
        app.logger.exception(e)
        return ("Failed due to error: " + str(e), 400, {})

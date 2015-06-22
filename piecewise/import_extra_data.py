import piecewise.config
from geoalchemy2 import Geometry
from sqlalchemy import MetaData, Table, Column, BigInteger, Integer, DateTime, Boolean, create_engine, func, select, text
from sqlalchemy.sql.expression import label
import json
import csv
import ipaddress
import datetime

aggregator = piecewise.config.read_config(json.load(open("seattle_config.json")))

engine = create_engine(aggregator.database_uri)
metadata = MetaData()
metadata.bind = engine
extra_data = Table('extra_data', metadata, 
        Column('id', Integer, primary_key = True),
        Column('verified', Boolean, server_default = text("False")),
        Column('timestamp', DateTime),
        Column('client_ip', BigInteger),
        Column('server_ip', BigInteger),
        Column('location', Geometry('POINT', srid=4326)))
metadata.create_all()

with engine.begin() as conn, open("seattle_01-05_2015_download.csv") as infile:
    reader = csv.reader(infile)
    headers = reader.next()
    inserts = []
    for row in reader:
        d = dict(zip(headers, row))
        inserts.append(dict(
            timestamp = datetime.datetime.utcfromtimestamp(float(d['web100_log_entry_log_time'])),
            client_ip = int(ipaddress.ip_address(unicode(d['connection_spec_client_ip']))),
            server_ip = int(ipaddress.ip_address(unicode(d['connection_spec_server_ip']))),
            location = "srid=4326;POINT(%f %f)" % (float(d['connection_spec_client_geolocation_longitude']), float(d['connection_spec_client_geolocation_latitude']))
        ))
    conn.execute(extra_data.insert(inserts))


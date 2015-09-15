import piecewise.config
from geoalchemy2 import Geometry
from sqlalchemy import MetaData, Table, Column, String, BigInteger, Integer, DateTime, Boolean, Float, create_engine, func, select, text
from sqlalchemy.sql.expression import label
import json
import datetime

aggregator = piecewise.config.read_config(json.load(open("/etc/piecewise/config.json")))

engine = create_engine(aggregator.database_uri)
metadata = MetaData()
metadata.bind = engine
extra_data = Table('extra_data', metadata, 
        Column('id', Integer, primary_key = True),
        Column('timestamp', DateTime, server_default = func.now()),
        Column('verified', Boolean, server_default = text("True")),
        Column('bigquery_key', String),
        Column('location', Geometry("Point", srid=4326)),
        Column('isp', String),
        Column('connection_type', String),
        Column('advertised_download', Integer),
        Column('actual_download', Float),
        Column('advertised_upload', Integer),
        Column('actual_upload', Float),
        Column('min_rtt', Integer),
        Column('location_type', String),
        Column('cost_of_service', Integer))
metadata.drop_all()
metadata.create_all()

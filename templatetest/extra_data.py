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
        Column('bigquery_test_id', String),
        Column('location', Geometry("Point", srid=4326)),
        Column('actual_download', Float),
        Column('actual_upload', Float),
        Column('min_rtt', Integer),
        Column('client_ip', BigInteger),
        Column('isp', String),
        Column('test_loc', String), Column('service_at_home', String), Column('no_serv_reason', String), Column('household_num', String), Column('household_type', String), Column('household_type_other', String), Column('isp_user', String), Column('service_type', String), Column('download_speed', String), Column('upload_speed', String), Column('other_download', String), Column('other_upload', String), Column('service_cost', String))        
metadata.drop_all()
metadata.create_all()

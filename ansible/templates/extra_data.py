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
        Column('client_ip', BigInteger),
        Column('min_rtt', Integer),
        Column('actual_download', Float),
        Column('actual_upload', Float),
        {%- for field in form_fields -%}
        Column('{{ field[name] }}', {{ field[data_type]}}){% if not loop.last %},{% endif %}
        {% endfor %}
metadata.drop_all()
metadata.create_all()

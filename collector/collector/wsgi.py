from flask import Flask, Response, request, jsonify
from sqlalchemy import create_engine, func, select, text, MetaData, Table, String, Integer, BigInteger, Boolean, Column, DateTime, String, Integer, Float, desc
import sqlalchemy.dialects.postgresql as postgresql
from sqlalchemy.dialects.postgresql import INT8RANGE
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_X, ST_Y, ST_Intersects
import ipaddress
import datetime
import sys
import re
sys.path.append('/opt/piecewise')
import piecewise.config
config = piecewise.config.read_system_config()

app = Flask(__name__)

if not app.debug:
    import logging
    import logging.handlers
    handler = logging.handlers.RotatingFileHandler("/var/log/piecewise/collector.log", maxBytes = 10 * 1000 * 1000, backupCount = 5)
    handler.setLevel(logging.WARNING)
    app.logger.addHandler(handler)

isp_rewrites = [x.rewrites for x in config.aggregations[0].bins if hasattr(x, 'rewrites')]

db_engine = create_engine("postgresql+psycopg2://postgres:@/piecewise")
Base = declarative_base()
Base_automap = automap_base()
Base_automap.prepare(db_engine, reflect=True)
Session = sessionmaker(bind=db_engine)
db_session = Session()

aggregations = []
for aggregation in config.aggregations:
    for bin in (b for b in aggregation.bins if hasattr(b, 'geometry_column')):
	aggregations.append({
            'table': bin.table,
            'geometry_column': bin.geometry_column,
            'key': bin.key,
            'orm': eval('Base_automap.classes.%s' % bin.table)
        })

metadata = MetaData()
metadata.bind = db_engine
extra_data = Table('extra_data', metadata, 
    Column('id', Integer, primary_key = True),
    Column('timestamp', DateTime),
    Column('verified', Boolean),
    Column('bigquery_key', String),
    Column('bigquery_test_id', String),
    Column('location', Geometry("Point", srid=4326)),
    Column('isp', String),
    Column('connection_type', String),
    Column('advertised_download', Integer),
    Column('actual_download', Float),
    Column('advertised_upload', Integer),
    Column('actual_upload', Float),
    Column('min_rtt', Integer),
    Column('client_ip', BigInteger),
    Column('isp_user', String),
    Column('cost_of_service', Integer))
metadata.create_all()

class Results(Base):
    __tablename__ = 'results'
    id = Column('id', Integer, primary_key = True)
    time = Column('time', DateTime)
    location = Column('location', Geometry("Point", srid=4326))
    client_ip = Column('client_ip', BigInteger)
    server_ip = Column('server_ip', BigInteger)
    countrtt = Column('countrtt', BigInteger)
    sumrtt = Column('sumrtt', BigInteger)
    download_flag = Column('download_flag', Boolean)
    download_time = Column('download_time', BigInteger)
    download_octets = Column('download_octets', BigInteger)
    upload_time = Column('upload_time', BigInteger)
    upload_octets = Column('upload_octets', BigInteger)
    bigquery_key = Column('bigquery_key', String)
    test_id = Column('test_id', String)

class ExtraData(Base):
    __tablename__ = 'extra_data'
    id = Column('id', Integer, primary_key = True)
    timestamp = Column('timestamp', DateTime)
    verified = Column('verified', Boolean)
    bigquery_key = Column('bigquery_key', String)
    bigquery_test_id = Column('bigquery_test_id', String)
    location = Column('location', Geometry("Point", srid=4326))
    connection_type = Column('connection_type', String)
    advertised_download = Column('advertised_download', Integer)
    actual_download = Column('actual_download', Float)
    advertised_upload = Column('advertised_upload', Integer)
    actual_upload = Column('actual_upload', Float)
    min_rtt = Column('min_rtt', Integer)
    client_ip = Column('client_ip', BigInteger)
    isp_user = Column('isp_user', String)
    cost_of_service = Column('cost_of_service', String)

class Maxmind(Base):
    __tablename__ = 'maxmind'
    ip_range = Column('ip_range', INT8RANGE, primary_key = True)
    ip_low = Column('ip_low', BigInteger)
    ip_high = Column('ip_high', BigInteger)
    label = Column('label', String)

@app.route("/bq_results", methods=['GET'])
def retrieve_bq_results():
    if request.args.get('limit'):
       limit = int(request.args.get('limit'))
    else:
        limit = 50

    if request.args.get('page'):
        offset = (int(request.args.get('page')) - 1) * limit
    else:
        offset = 0

    if request.args.get('range'):
        try:
            range_start,range_end = request.args.get('range').split(',')
        except:
            pass
    else:
        range_start = None
        range_end = None

    query = db_session.query(Results, func.extract('epoch', Results.time).label('timestamp'))

    if range_start and range_end:
        query = query.filter(func.extract('epoch', Results.time) >= range_start)
        query = query.filter(func.extract('epoch', Results.time) <= range_end)

    query = query.order_by(desc(Results.time)).limit(limit).offset(offset).from_self()

    query = query.outerjoin(Maxmind, Maxmind.ip_range.contains(Results.client_ip))
    query = query.add_columns(Maxmind.label)

    for aggregation in aggregations:
        query = query.outerjoin(aggregation['orm'], ST_Intersects(Results.location, eval('aggregation["orm"].%s' % aggregation['geometry_column'])))
        query = query.add_columns(eval('aggregation["orm"].%s' % aggregation['key']))

    # record_count = db_session.query(Results.id).count()

    try:
        results = query.all()
        db_session.commit()
    except:
        db_session.rollback()

    records = []
    for row in results:
        record = {}
        record['id'] = row.Results.id
        record['timestamp'] = int(row.timestamp)
        record['client_ip'] = row.Results.client_ip
        record['server_ip'] = row.Results.server_ip
        record['count_rtt'] = row.Results.countrtt
        record['sum_rtt'] = row.Results.sumrtt
        record['download_flag'] = row.Results.download_flag
        record['download_time'] = row.Results.download_time
        record['download_octets'] = row.Results.download_octets
        record['upload_time'] = row.Results.upload_time
        record['upload_octets'] = row.Results.upload_octets
        record['bigquery_key'] = row.Results.bigquery_key
        record['test_id'] = row.Results.test_id
        record['isp_user'] = rewrite_isp(row.label)
        for aggregation in aggregations:
            record[aggregation['table']] = eval('row.%s' % aggregation['key'])
        records.append(record)

    if len(records):
        return (jsonify(records=records), 200, {})
    else:
        return ('', 500, {})

@app.route("/extra_data", methods=['GET'])
def retrieve_extra_data():
    if request.args.get('limit'):
       limit = int(request.args.get('limit'))
    else:
        limit = 50

    if request.args.get('page'):
        offset = (int(request.args.get('page')) - 1) * limit
    else:
        offset = 0

    record_count = int(db_session.query(ExtraData).count())

    query = db_session.query(ExtraData, func.extract('epoch', ExtraData.timestamp).label('epoch'))

    query = query.outerjoin(Maxmind, Maxmind.ip_range.contains(ExtraData.client_ip))
    query = query.add_columns(Maxmind.label)

    for aggregation in aggregations:
        query = query.outerjoin(aggregation['orm'], ST_Intersects(ExtraData.location, eval('aggregation["orm"].%s' % aggregation['geometry_column'])))
        query = query.add_columns(eval('aggregation["orm"].%s' % aggregation['key']))

    try:
        results = query.limit(limit).offset(offset).all()
        db_session.commit()
    except:
        db_session.rollback()

    records = []
    for row in results:
        record = {}
        record['id'] = row.ExtraData.id
        record['date_pretty'] = row.ExtraData.timestamp
        record['timestamp'] = int(row.epoch)
        record['client_ip'] = row.ExtraData.client_ip
        record['min_rtt'] = row.ExtraData.min_rtt
        record['advertised_download'] = row.ExtraData.advertised_download
        record['actual_download'] = row.ExtraData.actual_download
        record['advertised_upload'] = row.ExtraData.advertised_upload
        record['actual_upload'] = row.ExtraData.actual_upload
        record['isp_user'] = row.ExtraData.isp_user
        record['connection_type'] = row.ExtraData.connection_type
        record['cost_of_service'] = row.ExtraData.cost_of_service
        record['isp'] = rewrite_isp(row.label)
        for aggregation in aggregations:
            record[aggregation['table']] = eval('row.%s' % aggregation['key'])
        records.append(record)

    if len(records):
        return (jsonify(record_count=record_count, records=records), 200, {})
    else:
        return ('', 500, {})

def rewrite_isp(maxmind_label):
    if not maxmind_label:
        return None
    for short_name, patterns in isp_rewrites[0].iteritems():
        for pattern in patterns:
            pattern = re.compile(pattern, re.IGNORECASE)
            match = re.search(pattern, maxmind_label)
            if match:
                return short_name
    return maxmind_label

@app.route("/unverify", methods=['GET'])
def unverify_extra_data():
    if not request.args.get('id'):
        return ('', 400, {})

    try:
        result = db_session.query(ExtraData).filter_by(
            id=request.args.get('id')).update({"verified": "f"})
        db_session.commit()
    except:
        db_session.rollback()

    if result:
        return ('', 200, {})
    else:
        return ('', 500, {})


@app.route("/verify", methods=['GET'])
def verify_extra_data():
    if not request.args.get('id'):
        return ('', 400, {})

    try:
        result = db_session.query(ExtraData).filter_by(
            id=request.args.get('id')).update({"verified": "t"})
        db_session.commit()
    except:
        db_session.rollback()

    if result:
        return ('', 200, {})
    else:
        return ('', 500, {})

@app.route("/retrieve", methods=['GET'])
def admin_extra_data():
    if request.args.get('limit'):
       limit = int(request.args.get('limit'))
    else:
        limit = 50

    if request.args.get('page'):
        offset = (int(request.args.get('page')) - 1) * limit
    else:
        offset = 0

    order_by = ExtraData.id.desc()
    sort_fields = ['id', 'timestamp', 'advertised_download', 'actual_download',
            'advertised_upload', 'actual_upload', 'min_rtt', 'cost_of_service',
            'isp_user', 'connection_type', 'verified']

    if request.args.get('sort'):
        if request.args.get('sort') in sort_fields:
            if request.args.get('order'):
                if request.args.get('order') in ['desc', 'asc']:
                    order_by = eval('ExtraData.%s.%s()' % (request.args.get('sort'),\
                            request.args.get('order')), {"__builtins__": None},\
                            {"ExtraData": ExtraData})
                else:
                    order_by = eval('ExtraData.%s.%s()' % (request.args.get('sort'),\
                            request.args.get('order')), {"__builtins__": None},\
                            {"ExtraData": ExtraData})
            else:
                order_by = eval('ExtraData.%s.desc()' % request.args.get('sort'),\
                        {"__builtins__": None}, {"ExtraData": ExtraData})

    try:
        record_count = int(db_session.query(ExtraData).count())
        results = db_session.query(ExtraData, ST_X(ExtraData.location).label('lon'),
            ST_Y(ExtraData.location).label('lat')).order_by(
            order_by).limit(limit).offset(offset).all()
        db_session.commit()
    except:
        db_session.rollback()
    
    records = []
    for row in results:
        record = {}
        record['id'] = row[0].id
        record['bigquery_key'] = row[0].bigquery_key
        record['bigquery_test_id'] = row[0].bigquery_test_id
        record['verified'] = row[0].verified
        record['timestamp'] = int(row[0].timestamp.strftime('%s')) * 1000
        record['connection_type'] = row[0].connection_type
        record['isp_user'] = row[0].isp_user
        record['advertised_download'] = row[0].advertised_download
        record['actual_download'] = row[0].actual_download
        record['advertised_upload'] = row[0].advertised_upload
        record['actual_upload'] = row[0].actual_upload
        record['min_rtt'] = row[0].min_rtt
        record['cost_of_service'] = row[0].cost_of_service
        record['latitude'] = row.lat
        record['longitude'] = row.lon
        records.append(record)

    if len(records):
        return (jsonify(record_count=record_count, records=records), 200, {})
    else:
        return ('', 500, {})


@app.route("/collect", methods=['GET'])
def append_extra_data():
    isp_types = ['default', 'comcast', 'centurylink', 'wave', 'other']
    connection_types = ['default', 'wired', 'wireless-single', 'wireless-multiple']
    cost_of_service_types = ['default', 'less_than_25', '25_50', '50_75', '75_100', '100_or_above', 'dont_know']

    try:
        if request.args.get('longitude') and request.args.get('latitude'):
            longitude = float(request.args.get('longitude'))
            latitude = float(request.args.get('latitude'))
            location = 'srid=4326;POINT(%f %f)' % (longitude, latitude)
        else:
            location = None
    except Exception, e:
        location = None
        app.logger.exception(e)

    if request.args.get('connection_type') in connection_types:
        connection_type = request.args.get('connection_type')
    else:
        connection_type = None

    if request.args.get('isp_user') in isp_types:
        if request.args.get('isp_user') == 'other':
            isp_user = request.args.get('other')
        else:
            isp_user = request.args.get('isp_user')
    else:
        isp_user = None

    try:
        advertised_download = int(float(request.args.get('advertised_download')))
    except Exception, e:
        advertised_download = None
        app.logger.exception(e)

    try:
        actual_download = float(request.args.get('actual_download'))
    except Exception, e:
        actual_download = None
        app.logger.exception(e)

    try:
        advertised_upload = int(float(request.args.get('advertised_upload')))
    except Exception, e:
        advertised_upload = None
        app.logger.exception(e)

    try:
        actual_upload = float(request.args.get('actual_upload'))
    except Exception, e:
        actual_upload = None
        app.logger.exception(e)

    try:
        min_rtt = int(float(request.args.get('min_rtt')))
    except Exception, e:
        min_rtt = None
        app.logger.exception(e)

    try:
    	if request.args.get('cost_of_service') in cost_of_service_types:
        	cost_of_service = request.args.get('cost_of_service')
    	else:
        	cost_of_service = None

    except Exception, e:
        cost_of_service = None
        app.logger.exception(e)

    if len(request.args.get('bigquery_key')) < 100:
        bigquery_key = request.args.get('bigquery_key')
    else:
        bigquery_key = None

    try:
        with db_engine.begin() as conn:
            query = extra_data.insert(dict(
                bigquery_key = bigquery_key,
                location = location,
                connection_type = connection_type,
                advertised_download = advertised_download,
                actual_download = actual_download,
                advertised_upload = advertised_upload,
                actual_upload = actual_upload,
                min_rtt = min_rtt,
                isp_user = isp_user,
                client_ip = int(ipaddress.ip_address(unicode(request.remote_addr))),
                cost_of_service = cost_of_service))
            conn.execute(query)
        return ("", 201, {})
        conn.commit()
    except Exception, e:
        db_session.rollback()
        app.logger.exception(e)
        return ("Failed due to error: " + str(e), 400, {})

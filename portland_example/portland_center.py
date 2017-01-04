import piecewise.config
from sqlalchemy import MetaData, Table, Column, create_engine, func, select
from sqlalchemy.sql.expression import label
import json

aggregator = piecewise.config.read_config(json.load(open("piecewise_config.json")))
spatial_bin = filter(lambda x: x.label == 'spatial_join', aggregator.bins)[0]

engine = create_engine(aggregator.database_uri)
metadata = MetaData()
metadata.bind = engine
geom = Column(spatial_bin.geometry_column)
spatial_table = Table(spatial_bin.table, metadata, Column(spatial_bin.geometry_column))
import sys

with engine.begin() as conn, open(sys.argv[1], 'w') as out:
    centroid = func.st_astext(func.st_centroid(func.st_collect(geom)))
    query = select([func.st_x(centroid), func.st_y(centroid)]).select_from(spatial_table)
    (x, y) = conn.execute(query).fetchone()
    out.write("var center = [{lat}, {lon}];".format(lat=y, lon=x))

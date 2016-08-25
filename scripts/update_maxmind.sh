#!/usr/bin/env bash

cd /tmp
rm -f GeoIPASNum2.*
wget http://download.maxmind.com/download/geoip/database/asnum/GeoIPASNum2.zip
unzip GeoIPASNum2.zip

SQL="
	TRUNCATE maxmind
	COPY maxmind (ip_low, ip_high, label) FROM '/tmp/GeoIPASNum2.csv' WITH (FORMAT csv, HEADER false, encoding 'latin1')
	UPDATE maxmind SET ip_range = int8range(ip_low, ip_high)
"

IFS=$'\n'
for stmt in $SQL
do
	su -c "psql -c \"${stmt}\" piecewise" postgres
done

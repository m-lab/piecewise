## Using Piecewise to Extract Raw M-Lab Data

While its original intent is to ingest and aggregate M-Lab data, and display those aggregations on a website or in a visualization, Piecewise can also be used to simply extract raw M-Lab data from a geographic region for a particular time range. It can then be exported and analyzed.

This guide assumes you have completed the following and have successfully completed the initial ingest of M-Lab data:

* [Installing Piecewise](INSTALL.md)
* [Configuring your instance for your location](CONFIG.md)
* [Deploying a Piecewise Server](DEPLOY.md)

1. SSH into the Vagrant VM:
```
$ vagrant ssh
```

2. Become the postgres user:
```
vagrant@debian-jessie:~$ sudo su postgres
```

3. Login to the Postgres command line interface, connect to the piecewise database, and export the *results* table data
```
postgres@debian-jessie:/home/vagrant$ psql
psql (9.4.5)
Type "help" for help.

postgres=# \c piecewise
You are now connected to database "piecewise" as user "postgres".
piecewise=# Copy (Select id,time,st_astext(location) as latlon, client_ip,server_ip, sumrtt, countrtt, download_octets, download_time, upload_octets, upload_time, bigquery_key, test_id From results) To '/tmp/results.csv' With CSV;
piecewise=# \q
postgres@debian-jessie:/home/vagrant$ exit
vagrant@debian-jessie:~$ 
```

At this point you can access your exported CSV at /tmp/results.csv inside the vagrant VM. 

We use secure copy (SCP) to send the CSV somewhere else for analysis:
```
vagrant@debian-jessie:~$ scp /tmp/results.csv username@yourserver.com:
```
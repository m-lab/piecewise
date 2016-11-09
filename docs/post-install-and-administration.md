# Post installation tasks and ongoing maintenance/administration

This document covers key tasks that relate to the ongoing maintenance and administration of a Piecewise server.

## Setup a cron job to regularly re-ingest and aggregate new M-Lab data

Once your Piecewise server is up and running, you will want to add a cron job to regularly re-run the ```piecewise.ingest``` command.

  * Log into your server/VM and become root, then edit the root crontab:
  ```
  $ sudo su
  root$ crontab -e
  ```

  * You may be asked to select a default text editor to use for editing the crontab. 
  * Once you select an editor add a line like the one below to the end of the file, adjusting the time values for your needs:
  ```
  21 1 * * * cd /opt/piecewise && python -m piecewise.ingest > /dev/null
  ```

## Exporting Data from Postgres, Loading Data Into Postgres

In active development of a new Piecewise server, you may be bringing up a Vagrant VM and destroying it regularly to test new features, or to test end-to-end deployment. If your server is looking at a region and time span with a lot of M-Lab data, exporting a database dump from a fully configured Piecewise instance and reimporting it into subsequently created VMs can save you a lot of time. 

Note that the example below are from a running Seattle-based example. Your table names will likely be different, so please adjust as needed.

**Create database dump:**
```
vagrant@jessie $ sudo pg_dump -Ft -U postgres piecewise --clean -t results -t district_statistics -t block_statistics | gzip > /tmp/piecewise.seattle.db.tar.gz
```

At this point you can access your database dump at /tmp/piecewise.seattle.db.tar.gz inside the vagrant VM.  We use secure copy (SCP) to send the CSV somewhere else for analysis:
```
vagrant@debian-jessie:~$ scp /tmp/piecewise.seattle.db.tar.gz username@yourserver.com:
```

You can also download the the dump file from a web-accessible location, or use SCP to copy it from somewhere securely, and load the previously ingested M-Lab data back into your VM.

```
vagrant@jessie $ wget https://web location of your database dump/piecewise.seattle.db.tar.gz
vagrant@jessie $ sudo gunzip -c piecewise.seattle.db.tar.gz | pg_restore -U postgres -d piecewise -O --clean
```

## Using Piecewise to Extract Raw M-Lab Data

While its original intent is to ingest and aggregate M-Lab data, and display those aggregations on a website or in a visualization, Piecewise can also be used to simply extract raw M-Lab data from a geographic region for a particular time range. It can then be exported and analyzed.

This guide assumes you have completed the following and have successfully completed the initial ingest of M-Lab data:

* SSH into the Vagrant VM: ``` $ vagrant ssh ```
* Become the postgres user: ```vagrant@debian-jessie:~$ sudo su postgres```
* Login to the Postgres command line interface, connect to the piecewise database, and export the *results* table data: 

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

## Further Reading

Additional resources on Piecewise:

  * [How Piecewise Works](how-piecewise-works.md) 
  * [Statistics in Piecewise](piecewise-statistics.md)
  * [Advanced Piecewise Customization and Use](customizing-piecewise.md)
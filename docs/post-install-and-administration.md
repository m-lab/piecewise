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

If you want to quickly get started developing with an example dataset, you can load a database dump. Note that the example below are from a running Seattle-based example. Your table names will likely be different, so please adjust as needed.

**Create database dump:**
```
vagrant@jessie $ sudo pg_dump -Ft -U postgres piecewise --clean -t results -t district_statistics -t block_statistics | gzip > piecewise.seattle.db.tar.gz
```

Upload the dump file to a Github repository or other web-accessible location.

**Load database dump:**

```
vagrant@jessie $ wget https://web location of your database dump/piecewise.seattle.db.tar.gz
vagrant@jessie $ sudo gunzip -c piecewise.seattle.db.tar.gz | pg_restore -U postgres -d piecewise -O --clean
```
These things need to be done on the server after Ansible has deployed the site.

* Ingest bigquery data and aggregate it
    * $ cd /opt/piecewise
    * $ sudo python -m piecewise.ingest

* Put center.js where bq2geojson can find it
    * $ cd /opt/piecewise
    * $ python seattle_example/seattle_center.py /opt/bq2geojson/html/js/center.js

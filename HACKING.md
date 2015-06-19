## A Piecewise development environment

To facilitate development, the Piecewise repository includes a [Vagrant](http://vagrantup.com/) configuration (or "Vagrantfile") that prepares a virtual machine ready for use.
Some useful Vagrant commands are:

* `vagrant up` to create and configure a virtual machine from scratch.
* `vagrant ssh` gives command-line access to the virtual machine.
* `vagrant destroy` to discard a virtual machine and reclaim the disk space that was used for it.
* `vagrant provision` will re-run the setup scripts, useful for testing the setup scripts for in-place updates.

Vagrant makes the working directory available at `/vagrant` on the guest machine, so you can switch to that path instead of `/opt/piecewise` to test Python changes quickly without needing to redeploy.  
It is also possible to configure uwsgi and nginx to reference resources from the `/vagrant/` directory to enable faster iteration on those components as well.
References to `/opt/piecewise/` simply need to be replaced with `/vagrant/piecewise`.
However there are some problems with the interaction between nginx and virtualbox, so please also change the `sendfile` option in `/etc/nginx/nginx.conf` to `off`.
Nginx will still serve files but this works around a bug.
It would be a really nice enhancement to have a switch that automates setting this up for development instead of requiring those manual tweaks.

## Code layout

Piecewise is largely driven by instances of the `piecewise.aggregate.Aggregator` class.
These objects carry postgres connection details as well as information about how to filter data coming from BigQuery, how to organize it into "bins," and what aggregate statistics are of interest for a given project.
`piecewise.config` provides facilities for reading in instances of Aggregator from a JSON file.

### Bins

A "bin" defines a dimension by which data will be aggregated, such as a spatial grid.
They manipulate sqlalchemy Query objects in order to add aggregates to queries and insert them into the aggregated table, as well as to perform queries against the aggregated table.

### Filters

A "filter" defines extra conditions to be imposed on the BigQuery data as it is ingested to the Postgres data table.


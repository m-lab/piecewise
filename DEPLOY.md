##Deploying a Piecewise server

To facilitate server deployment, the Piecewise repository includes an [Ansible](http://ansible.com/) playbook that can be used to deploy Piecewise to an Ubuntu server.
Ansible must be installed on a control machine but the server that is being configured needs only to allow SSH access.
Assuming that SSH is configured not to require an interactive password prompt, the steps to configure a Piecewise server with the hostname piecewise-server are as follows.

  1. `echo piecewise-server > hosts`
  1. `ansible-playbook -i hosts playbook.yml`
  1. `ssh piecewise-server`
  1. `cd /opt/piecewise/`
  1. `python -m piecewise.ingest`

Once the piecewise.ingest operation completes, statistics about the Measurement lab data will be available through the Piecewise web API.

##Redeploying a Piecewise server

The playbook included should allow redeployment - with pending updates in the piecewise directory on your local machine, you can simply issue the `ansible-playbook` command again to update the server.
Code will be replaced but the database will not be modified, so you may need to re-ingest the data to complete the update.

##Testing changes

The virtual machine management tool [Vagrant](http://vagrantup.com/) has convenient integration with Ansible which makes testing changes to the deployment script easier to do without potentially causing problems on a public server.
When the virtual machine is running, `vagrant provision` will re-run the Ansible script.
You can also destroy the virtual machine in order to test the deployment in a default setup using `vagrant destroy -f && vagrant up`.
The `vagrant up` command will automatically run the provisioning tool the first time the virtual machine is used after `vagrant destroy`.

##How the deployment script sets things up

Once the deployment script finishes without errors, Piecewise and some accompanying software will be deployed on the system.

  *  The [PostgreSQL](http://postgresql.org/) database server is installed and running with [PostGIS](http://postgis.net/), and serves as the only data store for Piecewise.
     A database called 'piecewise' is created and prepared with functions and auxiliary data that may be used by Piecewise.
     Connections over a local Unix socket are not authenticated so any user with access to the machine may connect as the postgres administrative user.
     The configuration files are in `/etc/postgresql` .
     This server can be restarted with the `service postgresql restart` command.
     The logs are in `/var/log/postgresql` .
  *  The [uwsgi](http://uwsgi-docs.readthedocs.org/en/latest/) application server hosts the Piecewise web API.
     The configuration files are in `/etc/uwsgi` .
     This server can be restarted with the `service uwsgi restart` command.
  *  The [nginx](http://nginx.org/) web server proxies the Piecewise web API to the public Internet and hosts static files.
     The configuration files are in `/etc/nginx` .
     This server can be restarted with the `service nginx restart` command.

Piecewise itself reads configuration from a file in `/etc/piecewise/config.json` and the web API logs errors to `/var/log/piecewise/wsgi.log` .

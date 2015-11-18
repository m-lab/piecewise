## Deploying a Piecewise server

If you have completed the [Install](INSTALL.md) and [Configure](CONFIG.md) documents, you should be ready to deploy your Piecewise server. 

By default, Piecewise uses [Vagrant](http://www.vagrantup.com) to deploy a virtual machines using an [Ansible](http://ansible.com/) playbook.

If you prefer to install Piecewise without Vagrant, see the last section of this document, Notes on Deploying to any machine (or VM) without Vagrant.

## Deploying Piecewise using Vagrant

1. Bring up the piecewise VM using Vagrant:
```
$ vagrant up
```

2. SSH into the Vagrant VM:
```
$ vagrant ssh
```

At this point you should be at a terminal inside the VM. The files for your Piecewise server are located in:
```
/opt/piecewise

and 

/opt/bq2geojson
```

3. Next, edit the file _piecewise/piecewise/bigquery.py_ and replace the value for **PROJECT_NUMBER** with the project number from Google Developers Console.
```
$ sudo vi /opt/piecewise/piecewise/bigquery.py
```

4. Run the piecewise ingest routine:
```
$ cd /opt/piecewise
$ sudo python -m piecewise.ingest
```

On the first run of **piecewise.ingest**, you will be prompted with a URL to authenticate your piecewise instance with the Google account that M-Lab whitelisted. Open the URL provided, authenticate and allow access, then copy verification code onto the command line.

If successful, you will see a number of messages about BigQuery jobs running. If you get an error, it may be due to a misconfiguration or if you used a different account than the one associated with your project in the Google Developer Console. 

Once the last command above completes with no errors, load [http://localhost:8080](http://localhost:8080) in the web browser of the vagrant host machine. The host machine also provides the same web service on its own IP address. You should see a map centered around the region you specified previously, with data aggregated by the shapes you provided.

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

### Customizing the Front-end 

When we use vagrant to deploy a VM, the web server on the VM hosts files here:
```
/opt/bq2geojson/html/
```
When deploying, the bq2geojson repo is pulled in and deployed: [https://github.com/m-lab/bq2geojson](https://github.com/m-lab/bq2geojson) 

Therefore, to prototype changes to the map example that is a front-end to piecewise, we can use the following workflow:

* Within the Vagrant VM environment change to the web directory for bq2geojson:
```
# cd /opt/bq2geojson/html
```
* Make changes, preview on the localhost server, track changes with git (the directory above is a git repo)

### Managing a Deployed Instance of Piecewise
The following are some useful notes and commands for managing your Piecewise server after deployment.

* Pulling in new changes to piecewise backend
```
cd /opt/piecewise.git
sudo git pull
```

* Updates collector, piecewise and piecewise web
TBD

* Cron jobs 
TBD

* Restarting web services
```
sudo service uwsgi restart
sudo service nginx restart
```

* pulling in new frontend changes
```
cd /opt/bq2geojson
sudo git pull
```
 * Customizing database tables or post-test web form
   * Files you need to edit to add tables to extra_data table and web form:
```
piecewise/piecewise/aggregate.py
collector/collector/wsgi.py
```

## Redeploying a Piecewise server

The playbook included should allow redeployment - with pending updates in the piecewise directory on your local machine, you can simply issue the `ansible-playbook` command again to update the server.

Code will be replaced but the database will not be modified, so you may need to re-ingest the data to complete the update.

## Notes on Deploying to any machine (or VM) without Vagrant
It is possible to deploy a piecewise server to any machine. These notes were taken during an installation on RHEL 7.1/Centos 7.1. Note that there is a piecewise branch for rhel7 that can be used to deploy to Red Hat or Centos machines.
  * Spin up a VM with the standard specs (2 core CPU, 4GB RAM, 40GB disk were used in our initial testing). It can be running pretty much any recent version of just about any Linux distro (RHEL 7.1 is fine).
  * If you don't already have one, create an SSH key pair to be used on the machine from which deployment to the VM will happen. This could easily just be your personal workstation or any other Linux machine. When you've created the key pair open the public key and copy it to your clipboard.
  * Login to the VM as root and add the public key from the previous step to /root/.ssh/authorized_keys. This will allow the user on the deployment workstation to do things via pubkey authentication on the VM as root without needing a password.
  * On the deployment workstation, install Ansible... probably something as easy as '$ yum install ansible'. I happen to be using v 1.9.2, but you can probably use whichever version as long as it is reasonably recent.
  * On the deployment workstation make a git clone of the Piecewise repository:
```
$ git clone https://github.com/opentechinstitute/piecewise.git
```
  * Enter the cloned directory and edit playbook.yml, removing the 2 lines referencing sudo.
  * Create a file named "hosts" with the following content, where, of course, you replace "<ip or name of VM>" with either the domain name or IP address of the VM:

    <ip or name of VM> ansible_ssh_user=root

  * Run Ansible with:

    $ ansible-playbook -i hosts playbook.yml

You'll see Ansible do it's thing, printing information to the screen. It should complete within a few minutes, and (assuming your terminal supports color) you shouldn't see any red in the information printed. If this is the case, then the basic deployment went fine and should be done.

The next steps are actually getting M-Lab data into the deployment, and is less of an ops/sysadmin thing than a application level thing. This document outlines the entire setup process one of our fellows went through while deploying to an Ubuntu box. See steps #8-#15 on populating your piecewise instance with M-Lab data.


## Deploying a Piecewise server

If you have completed the [Install](INSTALL.md) and [Configure](CONFIG.md) documents, you should be ready to deploy your Piecewise server.

By default, Piecewise uses [Vagrant](http://www.vagrantup.com) to deploy a virtual machines using an [Ansible](http://ansible.com/) playbook.

If you prefer to install Piecewise without Vagrant, see the last section of this document, Notes on Deploying to any machine (or VM) without Vagrant.

## Deploying Piecewise using Vagrant

**Bring up the piecewise VM using Vagrant:**
```
$ vagrant up
```

If this command completes without error, load [http://localhost:8080](http://localhost:8080) in the web browser of the vagrant host machine. The host machine also provides the same web service on its own IP address. You should see a map centered around the region you specified previously, but no data will be aggregated yet. 

If there were errors in the Vagrant/Ansible provisioning process, they will be shown in your terminal. These must be resolved before proceeding.

**SSH into the Vagrant VM**
```
$ vagrant ssh
```

At this point you should be at a terminal inside the VM. Details about the web server, database, and logs running in your newly deployed VM are listed below:

  * The files for your Piecewise server are located in ```/opt/piecewise```
  * The folder ```/opt/piecewise_web``` contains the files served by your VM
  *  The [PostgreSQL](http://postgresql.org/) database server is installed and running with [PostGIS](http://postgis.net/), and serves as the only data store for Piecewise.
    * A database called 'piecewise' is created and prepared with functions and auxiliary data that may be used by Piecewise.
    * Connections over a local Unix socket are not authenticated so any user with access to the machine may connect as the postgres administrative user.
    * The configuration files are in `/etc/postgresql` .
    * This server can be restarted with the `service postgresql restart` command.
    * The logs are in `/var/log/postgresql` .
  *  The [uwsgi](http://uwsgi-docs.readthedocs.org/en/latest/) application server hosts the Piecewise web API.
    * The configuration files are in `/etc/uwsgi` .
    * This server can be restarted with the `service uwsgi restart` command.
  *  The [nginx](http://nginx.org/) web server proxies the Piecewise web API to the public Internet and hosts static files.
    * The configuration files are in `/etc/nginx` .
    * This server can be restarted with the `service nginx restart` command.
  * Piecewise itself reads configuration from a file in `/etc/piecewise/config.json` and the web API logs errors to `/var/log/piecewise/wsgi.log` .


## Connect your BigQuery project and ingest M-Lab data

Next, edit the file _piecewise/piecewise/bigquery.py_ and replace the value for **PROJECT_NUMBER** with the project number from Google Developers Console.
```
$ sudo vi /opt/piecewise/piecewise/bigquery.py
```

**Run the piecewise ingest routine:**
```
$ cd /opt/piecewise
$ sudo python -m piecewise.ingest
```

On the first run of **piecewise.ingest**, you will be prompted with a URL to authenticate your piecewise instance with the Google account that M-Lab whitelisted. Open the URL provided, authenticate and allow access, then copy verification code onto the command line.

If successful, you will see a number of messages about BigQuery jobs running. If you get an error, it may be due to a misconfiguration or if you used a different account than the one associated with your project in the Google Developer Console.

Once the last command above completes with no errors, again load [http://localhost:8080](http://localhost:8080). You should now see your map with data aggregated by the shapes you provided in the configuration section.

## Providing Authentication to /admin

By default, Piecewise provides a basic administrative interface to view, verify and unverify results submitted by users. After running the Piecewise setup script, you should **protect the /admin directory using htaccess or other means of authentication**.

SSH into your VM and add htaccess-based or other permissions for the directory: **/opt/piecewise_web/admin**

In our sample directory, we put our htaccess file in ```/opt/piecewise.git/htaccess```

## Prototyping and testing changes

Once you have successfully deployed a new Piecewise server, you'll undoubtedly want to make customizations to the visual display from its default colors, layout, text, etc. Because of the way Piecewise is deployed, this can be somewhat confusing at first. Understanding the location of files and how they get updated will help.

  


Generally, we have used the steps below to prototype and then commit front-end changes to a running Piecewise server:

**Prototyping changes**

  * Use web browser based developer tools to prototype HTML/CSS changes
  * Edit corresponding files in your local Piecewise repository to add those changes

To preview visual or text changes only, it is convenient to run Python's **SimpleHTTPServer** command from within the ```piecewise_web``` folder. 

  ```
  $ cd piecewise_web
  $ python -m SimpleHTTPServer
  ```

Note that while using Python's SimpleHTTPServer to preview is useful in quickly previewing many visual elementsdoes not show your map centered on your configured region, and also excludes other Piecewise server-specific features.

To prototype and preview changes will all Piecewise server-specific features, you must update the code inside your VM. The code in your VM is actually a clone of the Github repository you used. this makes pulling changes into a running VM very easy:

  * Commit your changes to your local fork and push the changes to Github
  * Log into your VM, navigate to the Piecewise git repo, and pull in your changes

  ```
  $ vagrant ssh

  vagrant@jessie $ cd /opt/piecewise.git
  vagrant@jessie $ sudo git pull
  ```

Depending on the changes you're making, you may need to restart services running inside the VM:

```
vagrant@jessie $ sudo service uwsgi restart
vagrant@jessie $ sudo service nginx restart
```

## Deploying to any machine (or VM) without Vagrant

It is possible to deploy a piecewise server to any machine. These notes were taken during an installation on RHEL 7.1/Centos 7.1. Note that there is a piecewise branch for rhel7 that can be used to deploy to Red Hat or Centos machines.

  * Spin up a VM with the standard specs (2 core CPU, 4GB RAM, 40GB disk were used in our initial testing). It can be running pretty much any recent version of just about any Linux distro (RHEL 7.1 is fine).
  * If you don't already have one, create an SSH key pair to be used on the machine from which deployment to the VM will happen. This could easily just be your personal workstation or any other Linux machine. When you've created the key pair open the public key and copy it to your clipboard.
  * Login to the VM as root and add the public key from the previous step to /root/.ssh/authorized_keys. This will allow the user on the deployment workstation to do things via pubkey authentication on the VM as root without needing a password.
  * On the deployment workstation, install Ansible... probably something as easy as '$ yum install ansible'. I happen to be using v 1.9.2, but you can probably use whichever version as long as it is reasonably recent.
  * On the deployment workstation make a git clone of the Piecewise repository:
```
$ git clone https://github.com/your-github-name/piecewise.git
```
  * Enter the cloned directory and edit playbook.yml, removing the 2 lines referencing sudo.
  * Create a file named "hosts" with the following content, where, of course, you replace "<ip or name of VM>" with either the domain name or IP address of the VM:

    <ip or name of VM> ansible_ssh_user=root

  * Run Ansible with:

    $ ansible-playbook -i hosts playbook.yml

You'll see Ansible do it's thing, printing information to the screen. It should complete within a few minutes, and (assuming your terminal supports color) you shouldn't see any red in the information printed. If this is the case, then the basic deployment went fine and should be done.

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
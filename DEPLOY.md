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

##Notes on Deploying to any machine (or VM) without Vagrant
It is possible to deploy a piecewise server to any machine. These notes were taken during an installation on RHEL 7.1/Centos 7.1. Note that there is a piecewise branch for rhel7 that can be used to deploy to Red Hat or Centos machines.
  * Spin up a VM with the standard specs (2 core CPU, 4GB RAM, 40GB disk were used in our initial testing). It can be running pretty much any recent version of just about any Linux distro (RHEL 7.1 is fine).
  * If you don't already have one, create an SSH key pair to be used on the machine from which deployment to the VM will happen. This could easily just be your personal workstation or any other Linux machine. When you've created the key pair open the public key and copy it to your clipboard.
  * Login to the VM as root and add the public key from the previous step to /root/.ssh/authorized_keys. This will allow the user on the deployment workstation to do things via pubkey authentication on the VM as root without needing a password.
  * On the deployment workstation, install Ansible... probably something as easy as '$ yum install ansible'. I happen to be using v 1.9.2, but you can probably use whichever version as long as it is reasonably recent.
  * On the deployment workstation make a git clone of the Piecewise repository:

    $ git clone https://github.com/opentechinstitute/piecewise.git

  * Enter the cloned directory and edit playbook.yml, removing the 2 lines referencing sudo.
  * Create a file named "hosts" with the following content, where, of course, you replace "<ip or name of VM>" with either the domain name or IP address of the VM:

    <ip or name of VM> ansible_ssh_user=root

  * Run Ansible with:

    $ ansible-playbook -i hosts playbook.yml

You'll see Ansible do it's thing, printing information to the screen. It should complete within a few minutes, and (assuming your terminal supports color) you shouldn't see any red in the information printed. If this is the case, then the basic deployment went fine and should be done.

The next steps are actually getting M-Lab data into the deployment, and is less of an ops/sysadmin thing than a application level thing. This document outlines the entire setup process one of our fellows went through while deploying to an Ubuntu box. See steps #8-#15 on populating your piecewise instance with M-Lab data.

## Deploying a Piecewise server to a development VM

If you have completed the [Install](install.md), [Service Account setup](service-accounts.md) and [Configure](config.md) documents, you should be ready to test your code in a VM on your **development** workstation. By default, Piecewise currently uses [Vagrant](http://www.vagrantup.com) to create a virtual machine on your **development** workstatin and then uses our [Ansible](http://ansible.com/) playbooks to deploy your customized Piecewise code into the VM.

If you prefer to install Piecewise without Vagrant, or if you are ready to deploy to a **production** server or VM, please see the last section of this document, [Deploying Piecewise to a **production** server or VM using Ansible _without_ Vagrant](#deploying-piecewise-to-a-production-server-or-vm-using-ansible-without-vagrant).

## Deploying Piecewise to a VM on your **development** workstation using Vagrant

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

Once the last command above completes with no errors, again load [http://localhost:8080](http://localhost:8080). You should now see your map with data aggregated by the shapes you provided in the configuration section. If you don't, you may needto restart the Python webserver in your VM with: 

```$ sudo service uwsgi restart```

## Providing Authentication to /admin

By default, Piecewise provides a basic administrative interface to view, verify and unverify results submitted by users. After running the Piecewise setup script, you should **protect the /admin directory using htaccess or other means of authentication**.

SSH into your VM and add htaccess-based or other permissions for the directory: **/opt/piecewise_web/admin**

In our sample directory, we put our htaccess file in ```/opt/piecewise.git/htaccess``` and used the program [htpasswd](http://httpd.apache.org/docs/current/programs/htpasswd.html) to add authorized usernames and passwords. 

## Prototyping and testing changes

Once you have successfully deployed a new Piecewise server to a VM on your **development** workstation, you'll undoubtedly want to make customizations to the visual display from its default colors, layout, text, etc. Because of the way Piecewise is deployed, this can be somewhat confusing at first. Understanding the location of files and how they get updated will help.

Generally, we have used different methods to prototype and then commit front-end changes to a running Piecewise server:

### Basic changes to HTML, CSS and JavaScript in ```piecewise_web/```

You can use the steps below to preview basic changes to HTML, CSS and JavaScript, where we don't necessarily need to see all server-side Piecewise features such as aggregation layers or having the map at it's intended center and zoom level. 

  * Use web browser based or other developer tools to prototype HTML/CSS changes
  * Edit corresponding files in your local Piecewise repository to add those changes
  * Run Python's **SimpleHTTPServer** command from within the ```piecewise_web``` folder of your **development** workstation. 

  ```
  $ cd piecewise_web
  $ python -m SimpleHTTPServer
  ```

Note that while using Python's SimpleHTTPServer to preview is useful in quickly previewing many visual elementsdoes not show your map centered on your configured region, and also excludes other Piecewise server-specific features.

### Full preview of changes with server-side features

The method above is helpful for making edits to text, colors, placement of controls, etc. However, to prototype and preview changes with all Piecewise server-specific features, you must update the code inside your VM. The code in your VM is actually a clone of the Github repository you used. This makes pulling basic changes into a running VM very easy:

  * Use web browser based or other developer tools to prototype HTML/CSS changes
  * Edit corresponding files in your local Piecewise repository to add those changes
  * Commit your changes to your local fork and push the changes to Github
  * Log into your VM, navigate to the Piecewise git repo, and pull in your changes with git:

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

## Deploying Piecewise to a **production** server or VM using Ansible _without_ Vagrant

The procedure described above is useful when you want to deploy Piecewise into a local VM for testing and development. But in most cases, once you've customized Piecewise and are ready to deploy it on the Internet, you likely have a server or virtual machine where the application will be hosted. In this case, we'll deploy our customized Piecewise code using Ansible only, after making a couple small configurations on your deployment workstation and on your remote server or VM.

The instructions below were tested on a server/VM running Debian Jessie, though any version of Linux shoud be supported.

### Generate or obtain an SSH key for your deployment workstation

In order to run Ansible from your deployment workstation, and to seamlessly deploy your customized Piecewise code to a remote server, you need an SSH public key. On most Linux and Mac systems, you can find your SSH public key in ```/home/username/.ssh/```. It is usually named ```id_rsa.pub```. Locate this file and copy its contents. In the next step, you'll paste your SSH public key into a file on your server or VM.

### Prepare your server or VM

  * Configure a VM in your cloud service of choice (AWS, Linode, Azure, etc.) or a bare-metal server with a static IP address available on the Internet, running Debian Jessie. If desired, configure your server to respond to a domain name instead of just an IP address.
  * Login to your server or VM and create a user account with sudo privileges, to be used to deploy your Piecewise code 
  * Open the file ```/home/yourusername/.ssh/authorized_keys```, replacing "yourusername" with the name of the user you just created. If the file ```authorized_keys``` doesn't exist, create a new file with that name
  * Paste the contents of your SSH public key into this file and save.
  * Now Ansible can ssh to this VM or server without the need for a password
  * As the root user on your VM or server, paste the contents of you SSH public key into the root user's authorized_keys file, located in ```/root/.ssh/authorized_keys``` and save.
  * Now Ansible can login as your deployment user, and act as the root user to deploy to your server without needing a password

  ```TO DO: Revise these instructions after refactoring Ansible playbooks to use ansible-vault```

### Update Ansible's hosts file and Deploy Piecewise to the remote server

On your deployment workstation, in your piecewise folder, create a file named ```hosts``` with the line below, replacing "(ip or name of VM)" with either the domain name or IP address of the VM:

  ```(IP address or domain name of VM) ansible_ssh_user=root```

Save the file, then run Ansible to deploy your customized Piecewise code to your VM or server:

```$ ansible-playbook -i hosts playbook.yml```

Ansible will run the playbook, printing information to the screen. It should complete within a few minutes, and (assuming your terminal supports color) you shouldn't see any red in the information printed. If this is the case, then the basic deployment went fine and should be done.

When Ansible has completed, login to your VM or server over SSH, and proceed with the steps below.

  * As root, edit the file ```/opt/piecewise/piecewise/bigquery.py``` and replace the value for **PROJECT_NUMBER** with the project number from Google Developers Console.

```
$ sudo vi /opt/piecewise/piecewise/bigquery.py
```

  * Run the piecewise ingest command:
```
$ cd /opt/piecewise
$ sudo python -m piecewise.ingest
```

The first time you run **piecewise.ingest**, you will be prompted with a URL to authenticate your piecewise instance with the Google account that M-Lab whitelisted. Open the URL provided, authenticate using the Google account you set up earlier, and allow access, then copy verification code onto the command line.

If successful, you will see a number of messages about BigQuery jobs running. If you get an error, it may be due to a misconfiguration or if you used a different account than the one associated with your project in the Google Developer Console.

  * Restart Python's uwsgi service:
  ```
  $ sudo service uwsgi restart
  ```

You should have a running instance of Piecewise available at your server or VM's public IP address or domain name. 

## Next move on to [Post installation tasks and ongoing maintenance/administration](post-install-and-administration.md)

## Further Reading

Additional resources on Piecewise:

  * [How Piecewise Works](how-piecewise-works.md) 
  * [Statistics in Piecewise](piecewise-statistics.md)
  * [Advanced Piecewise Customization and Use](customizing-piecewise.md)
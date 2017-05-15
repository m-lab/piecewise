## Deploying Piecewise to your virtual machine or server

You should now be ready to deploy your customized Piecewise code to your previously provisioned VM or server. Piecewise is deployed using an Ansible playbook: ```ansible/deploy-piecewise.yml```

To run this playbook and deploy your customized code to your server, open a terminal window and navigate to the directory where your Piecewise files are on your local computer. Then run the following command in your terminal window:

```$ ansible-playbook -i ansible/inventory/debian8-hosts ansible/deploy-piecewise.yml```

Ansible will run through the commands in the playbook, setup the remote VM/server and install Piecewise. Messages about the status of the deployment will appear in the terminal window as Ansible runs them. Assuming that the playbook completes without error, open a web browser and visit the IP or domain name of your VM/server. You should see a map centered around the region you specified previously, but no data will be aggregated yet. 

If there were errors in the Ansible deployment process, they will be shown in your terminal. These must be resolved before proceeding.

## Log into your VM/Server

Now that your code is deployed to your VM/Server, we need to log in and run a couple post installation setup tasks. SSH into your VM/server to get started: ```$ ssh <Ansible deployment user>@<your server/vm IP address>```. 

The remaining commands below use the default deployment locations as specified in the Piecewise global config file variable: ```base_path: /opt```. 

### Connect your Server to your BigQuery project and ingest M-Lab data

First, change to the directory where you deployed Run the piecewise ingest routine. If you are using ```root``` as your Ansible deployment user, ```sudo``` is not required in the second command below: 

```
$ cd /opt/piecewise
$ sudo python -m piecewise.ingest
```

The first time that ```python -m piecewise.ingest``` is run, you will be prompted with a message to visit a URL to authenticate your piecewise instance with the Google account that you setup earlier. The prompt will look like the one below:

```
$ sudo python -m piecewise.ingest
Go to the following link in your browser:

    https://accounts.google.com/o/oauth2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fbigquery&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code&client_id=233384409938-f4775mdhc8qocob1icesp76nqdtsero3.apps.googleusercontent.com&access_type=offline

Enter verification code: 
```

Open the URL provided, authenticate and allow access, then copy verification code onto the command line.

If successful, you will see a number of messages about BigQuery jobs running. If you get an error, it may be due to a misconfiguration or if you used a different account than the one associated with your project in the Google Developer Console.

Once the last command above completes with no errors, restart the Python webserver:

```$ sudo service uwsgi restart```

You should now see your map with data aggregated by the shapes you provided in the configuration section.

### Providing Authentication Account to /admin

By default, Piecewise provides a basic administrative interface to view, verify and unverify results submitted by users. After running the Piecewise setup script, you should **protect the /admin directory using htaccess or other means of authentication**. We use the program [htpasswd](http://httpd.apache.org/docs/current/programs/htpasswd.html) to add authorized usernames and passwords.

Piecewise expects an htaccess password file to be saved at: ```/opt/piecewise/htaccess```

To create this file and add a new user and password to it, use the commands below:

```
$ cd /opt/piecewise
$ sudo htpasswd -c htpasswd admin
(you will be prompted to enter a password)
```

To add a new user to an existing htpasswd file, just remove the ```-c``` in the command above.

### Setup a cron task to ingest and aggregate data on a schedule

To keep your server updated with the latest data, we need to set up a scheduled task that runs the ingest command above on a regular basis. In this example, we'll set up a daily scheduled task using the linux utility, cron.

If you are not already logged into your server as root, do so or become the root user.
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

Save and close.

## Next move on to [Post-Installation Administration and Management](post-install-and-administration.md)
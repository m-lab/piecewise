On this page: 

* Deployment Workstation Requirements
* Setting up a virtual machine or server
* Creating required accounts
* Forking Piecewise code to your Github account and cloning a copy on your local computer

## Deployment Workstation Requirements

Piecewise is deployed to your server using your computer. Below are the requirements for specific operating systems to work with and deploy Piecewise.

* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [Ansible](https://docs.ansible.com/ansible/intro_installation.html#installing-the-control-machine)

## Set up a virtual machine or server

Your server or VM can be hosted on a local area network, a cloud VM provider like Azure, AWS, Google Cloud, etc., or anywhere else. The basic connectity requirements are a static IP and/or domain name, accessible via the SSH protocol and a user account with `sudo` privileges. 

Server requirements will vary based on implementation parameters, such as the size of the geographic region being ingested from M-Lab, but generally we have used these specs for a city-wide metro area:

* 2.8GHz dual core processor
* 2GB RAM
* ~40GB of storage (SSD drive preferred)

Piecewise has been successfully deployed to servers running these operating systems:

* Debian Jessie
* Debian Stretch
* Ubuntu 14.04
* RHEL 7

Once your server or VM is set up, add your SSH public key to your server to enable password-less login. The contents of your SSH public key should be added to `/root/.ssh/authorized_keys` on the remote server or VM. If you're new to using SSH keys, the help articles below may be helpful.

* [Overview of the SSH File Transfer Protocol](https://en.wikipedia.org/wiki/SSH_File_Transfer_Protocol) 
* [Checking for existing SSH keys](https://help.github.com/articles/checking-for-existing-ssh-keys/)
* [https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)

## Create required accounts

Running a Piecewise server requires: 

* A Google account (Gmail, GApps for Business/Work/Non-profit)
* Subscribing that Google account to the [M-Lab Discuss Group](https://groups.google.com/a/measurementlab.net/forum/#!forum/discuss) to whitelist the account so you will not be charged for queries to M-Lab's dataset in BigQuery
* A project in Google Developer Console for that Google account, with billing enabled 
(**you will not be billed because your account is whitelisted, but BigQuery requires API applications to have billing enabled**)
* A [MapBox](https://www.mapbox.com/) account if you intend to use MapBox base maps

1. Create/Identify a Google account to use for your instance of Piecewise.

2. Subscribe that account to the [M-Lab Discuss Group](https://groups.google.com/a/measurementlab.net/forum/#!forum/discuss)

Once subscribed to M-Lab Discuss, **your account will be whitelisted to query the M-Lab dataset at no charge**.

## Fork Piecewise code to your Github account

1. [Fork](https://help.github.com/articles/fork-a-repo/) the Piecewise repo from [https://github.com/opentechinstitute/piecewise](https://github.com/opentechinstitute/piecewise)

2. Clone your fork onto your local computer

```$ git clone https://github.com/opentechinstitute/piecewise.git```

3. Change into the piecewise directory

```$ cd piecewise/```

You're now ready to begin customizing Piecewise code for your desired location. 

## Next: [Customizing Piecewise for your location](config.md)

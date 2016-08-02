## Installing Piecewise

### Server Requirements

Piecewise should install and run on any Linux server, either within a virtual machine or on bare metal. Installation instructions here will focus on the default installation method to deploy inside a VM provisioned by Vagrant and Ansible.

Piecewise has been successfully deployed on the following platforms:

* Debian Jessie
* Debian Stretch
* Ubuntu 14.04
* RHEL 7

Server specs and requirements will vary based on implementation parameters like the size of the geographic region being ingested from M-Lab, but generally we have used these specs for a city-wide metro area:

* 2.8GHz dual core processor
* 2GB RAM
* ~40GB of storage (SSD drive preferred)

### Installing Piecewise Pre-requisites

This section details how to install the prerequisite components that your server will need and obtaining the Piecewise software. At the end of this section you should have all the necessary software components for deploying your Piecewise server and will be ready to configure and deploy it.

#### Installation for Debian Jessie

1. Install virtualbox, virtualbox-dkms, vagrant, ansible, git

        sudo apt-get install vagrant ansible virtualbox virtualbox-dkms git

2. Clone the piecewise repo

        git clone https://github.com/opentechinstitute/piecewise.git

3. Change into the piecewise directory
        cd piecewise/

#### Installation for Debian Stretch

1. Add the contrib repo to your apt sources in **/etc/apt/sources.list**:

        deb http://ftp.us.debian.org/debian/ stretch main contrib

2. Follow steps #2-3 in the instructions for Debian Jessie above.


### Installation for Ubuntu 14.04

1. Download and install ansible:

        sudo apt-get install software-properties-common
        sudo apt-add-repository ppa:ansible/ansible
        sudo apt-get update
        sudo apt-get install ansible

2. Download and install virtual-box:

        sudo apt-get install virtualbox

3. Download and install vagrant:

        sudo apt-get install vagrant

4. Download and add the jessie64 box for piecewise:

        vagrant box add jessie64 http://static.gender-api.com/debian-8-jessie-rc2-x64-slim.box
        vagrant box list
        jessie64  (virtualbox)

5. Clone the git repository for piecewise:

        git clone https://github.com/opentechinstitute/piecewise.git
        cd piecewise

### Installation for RHEL 7 / CentOS 7

TBD - using piecewise RHEL7 branch


Next move on to [Configuring your instance for your location](CONFIG.md)
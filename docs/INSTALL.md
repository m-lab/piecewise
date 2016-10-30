## Installing Piecewise

Piecewise can be installed and run on any Linux server or virtual machine. We are currently using two tools to automate the deployment of Piecewise: _Vagrant_ and _Ansible_. All customization, development and testing is done on a **development** workstation and when ready, deployed to a **production** server or VM. These instructions will use the terms "**Development**" and "**Production**" to distinguish between these two types of deployments. 

During customization and testing, we use _Vagrant_ to deploy Piecewise into a VM running on your **development** workstation. Vagrant creates a VM and deploys your customized code to it using Ansible.

When you're ready to deploy your customized Piecewise code to a production server or VM, we'll use Ansible without Vagrant.

### Production Server/VM Requirements

Server specifications and requirements will vary based on implementation parameters, such as the size of the geographic region being ingested from M-Lab, but generally we have used these specs for a city-wide metro area:

* 2.8GHz dual core processor
* 2GB RAM
* ~40GB of storage (SSD drive preferred)

Piecewise has been successfully deployed on the following platforms:

* Debian Jessie
* Debian Stretch
* Ubuntu 14.04
* RHEL 7

Your **production** server or VM should be configured with a public IP address or domain name, be accessible via SSH, and have a user account with sudo privileges. 


### Installing Piecewise Pre-requisites on your Development Workstation

This section details how to install the prerequisites that your **development** workstation will need to deploy Piecewise using Vagrant and Ansible. At the end of this section you should have all the necessary software components necessary for deploying your customized Piecewise code to a VM on your **development** computer for testing.

#### Installation for Debian Jessie

1. Install virtualbox, vagrant, ansible, git

        sudo apt-get install vagrant ansible virtualbox virtualbox-dkms git

   Also install the Virtualbox kernel modules and Guest Additions:

        sudo apt-get install virtualbox-dkms virtualbox-guest-dkms virtualbox-guest-additions-iso virtualbox-guest-utils virtualbox-guest-x11

2. [Fork](https://help.github.com/articles/fork-a-repo/) the Piecewise piecewise repo from https://github.com/opentechinstitute/piecewise 

3. Clone your fork onto your **development** workstation

        git clone https://github.com/opentechinstitute/piecewise.git

4. Change into the piecewise directory

        cd piecewise/

You're now ready to begin customizing Piecewise code for your desired location. 


#### Installation for Debian Stretch

1. Add the contrib repo to your apt sources in **/etc/apt/sources.list**:

        deb http://ftp.us.debian.org/debian/ stretch main contrib

2. Follow steps #2-4 in the instructions for Debian Jessie above.


### Installation for Ubuntu 14.04

1. Download and install ansible:

        sudo apt-get install software-properties-common
        sudo apt-add-repository ppa:ansible/ansible
        sudo apt-get update
        sudo apt-get install ansible

2. Download and install virtual-box and vagrant:

        sudo apt-get install virtualbox vagrant

3. Download and add the jessie64 box for piecewise:

        vagrant box add jessie64 http://static.gender-api.com/debian-8-jessie-rc2-x64-slim.box
        vagrant box list
        jessie64  (virtualbox)

4. Follow steps #2-4 in the instructions for Debian Jessie above.


### Installation for Mac OS

TBD

### Installation for RHEL 7 / CentOS 7

TBD - using piecewise RHEL7 branch


## Next move on to [Setup external service accounts required to run Piecewise](service-accounts.md)
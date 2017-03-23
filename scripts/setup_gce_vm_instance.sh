#!/bin/bash
echo ' '
echo 'This script assists you in creating a Google Cloud Compute Engine VM instance.'
echo 'Please note that currently this script convenience during DEVELOPMENT by automating'
echo 'the default options for most GCE VMs and does not include all available options, '
echo 'such as customizing disk size, type, etc. We could add more features in the future.'
echo ' '
echo 'The script assumes you have:'
echo ' - installed the Google Cloud SDK: https://cloud.google.com/sdk/downloads'
echo ' - subscribed your @gmail.com or other google account to M-Lab Discuss: '
echo '   https://groups.google.com/a/measurementlab.net/forum/#!forum/discuss'
echo ' - created a project for your Piecewise install in the Google Cloud Console: '
echo '   https://console.cloud.google.com/'
echo ' - configured your installed Google Cloud SDK with the Google account and '
echo '   project name above'
echo ' '
echo 'If you need to cancel, press CTRL-C, complete the requirements above and '
echo 'then re-run this script.'
echo ' '
read -p 'Name of your GCE VM instance: ' vmName
read -p 'Image family (debian-8 or rhel-7): ' imageFam

if [ $imageFam = 'debian-8' ]; then
	imageProj='debian-cloud'
elif [$imageFam = 'rhel-7' ]; then
	imageProj='rhel-cloud'
else
	read -p 'Image family must be either debian-8 or rhel-7: ' imageFam
fi
echo 'Select a GCE Instance zone. Available zones are: '
gcloud compute zones list --format='value(name)'
echo ' '
read -p 'Enter the zone you wish to use for this VM instance: ' zone

echo 'Creating GCE VM ' . $imageFam . 'instance ' . $vmName . 'in zone ' . $zone
gcloud compute instances create $vmName --image-family $imageFam --image-project $imageProj --zone $zone --tags http-server,https-server

echo 'Adding your SSH access to the VM instance'
gcloud compute config-ssh

echo 'Your development VM is now created on GCE.'
echo ' '
echo 'Please make a note the IP address above and use it next as you follow our'
echo 'documentation to customize and deploy Piecewise.'
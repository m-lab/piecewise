#!/bin/bash

echo "This script assists you in creating a Google Cloud Compute Engine VM instance."
echo " "
echo "The script assumes you have:"
echo " - installed the Google Cloud SDK: https://cloud.google.com/sdk/downloads"
echo " - subscribed your @gmail.com or other google account to M-Lab Discuss: https://groups.google.com/a/measurementlab.net/forum/#!forum/discuss"
echo " - created a project for your Piecewise install in the Google Cloud Console: https://console.cloud.google.com/"
echo " - configured your installed Google Cloud SDK with the Google account and project name above"
echo " "
echo "If you need to cancel, press CTRL-C, complete the requirements above and then re-run this script."
echo " "
read -p 'Name of your GCE VM instance: ' vmName
read -p 'Image family (debian-8 or rhel-7): ' imageFam
read -p 'Image project (debian-cloud or rhel-cloud): ' imageProj
read -p 'GCE Instance Zone: (ie: us-central1-a): ' zone

echo "Creating GCE VM $imageFam instance $vmName in zone $zone"
gcloud compute instances create $vmName --image-family $imageFam --image-project $imageProj --zone $zone

echo "Adding your SSH access to the VM instance"
gcloud compute config-ssh

echo "Adding firewall rules to your VM to accept port 80 and port 443 (HTTP and HTTPS)"
gcloud compute firewall-rules create ALLOW-HTTP --allow tcp:80,icmp
gcloud compute firewall-rules create ALLOW-HTTPS --allow tcp:443,icmp

echo "VM Instance Created. Details below."
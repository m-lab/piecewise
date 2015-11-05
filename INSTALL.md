## Piecewise

Piecewise is a tool for digesting and visualizing Measurement Lab data - user-volunteered Internet performance test results. It is based on the idea of composable statistics - ones for which we can combine results from multiple samples to get a valid result for the combination of the samples. For example, by tracking the sample count and total, we can compute a count and total for the overall population (which can then be trivially converted to an arithmetic mean.) The samples are selected along configurable dimensions such as time slices or a spatial grid, so Piecewise can support histogram and heatmap types visualizations at varying granularity.

Piecewise is considered beta software and is not supported by the Open Technology Institute, New America or M-Lab. "Supported" in this documentation refers to known working implementations or configurations, and not a level of support for installations of piecewise. 

### Code

Piecewise can be found on Github: [https://github.com/opentechinstitute/piecewise](https://github.com/opentechinstitute/piecewise) 

### Community

Questions, comments, contributions, etc. about Piecewise should be addressed via Github or ??email alias??

[[TOC]]

## Server Requirements

Piecewise should install and run on any Linux server, either within a virtual machine or on bare metal. Installation instructions here will focus on the default installation method to deploy inside a VM provisioned by Vagrant and Ansible. 

As of September 2015, Piecewise has been successfully deployed on the following platforms:

* Debian Jessie

* Debian Stretch 

* Ubuntu 14.04.

* RHEL 7

Server specs and requirements will vary based on implementation parameters like the size of the geographic region being ingested from M-Lab, but generally we have used these specs for a city-wide metro area:

* 2.8GHz dual core processor

* 2GB RAM

* ~40GB of storage (SSD drive preferred)

## Installing Piecewise Pre-requisites

This section details how to install the prerequisite components that your server will need and obtaining the Piecewise software. At the end of this section you should have all the necessary software components for deploying your Piecewise server and will be ready to configure and deploy it. 

### Installation for Debian Jessie, Stretch

1. Add the contrib repo to your apt sources in **/etc/apt/sources.list**:

        deb http://ftp.us.debian.org/debian/ stretch main contrib

2. Install virtualbox, vagrant, ansible, git

        sudo apt-get install vagrant ansible virtualbox git

3. Clone the piecewise repo

        git clone https://github.com/opentechinstitute/piecewise.git

4. Change into the piecewise directory
        cd piecewise/

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

        vagrant box add jessie64
      <http://static.gender-api.com/debian-8-jessie-rc2-x64-slim.box>
        vagrant box list
      jessie64  (virtualbox)

5. Clone the git repository for piecewise:

        git clone https://github.com/opentechinstitute/piecewise.git
        cd piecewise

### Installation for RHEL 7 / CentOS 7

TBD - using piecewise RHEL7 branch

### Installation without Vagrant in a VM or not in a VM

TBD

## Configuring and Deploying a Piecewise VM

We’re now ready to customize your copy of Piecewise for the region you care about. We recommend starting a text file to document information about your application that you’ll need to configure Piecewise, and that you might want to have on hand for your own documentation.

Configuring and deploying Piecewise will involve the following steps:

* Ask M-Lab to whitelist a Google Developer account 

* Setup a project in Google Developer Console

* Configure Piecewise for your location

### Whitelist a Google Account to use with your Piecewise instance

Piecewise requires a Google Account to be configured for ingesting M-Lab data from BigQuery. We recommend creating a separate account to use specifically for this purpose, rather than a personal account.

1. Create/Identify a Google account to use for your instance of Piecewise.

2. Email [support@measurementlab.net](mailto:support@measurementlab.net) to request that your Google account be whitelisted to query the M-Lab dataset.

3. Once M-Lab confirms your account is whitelisted, proceed.

### Configure an API project in the Google Developers console

1. Go to Google Developers console and log in using the account that was whitelisted by M-Lab:[ https://console.developers.google.com/project](https://console.developers.google.com/project)![image alt text](image_0.png)

2. Create a Google-API project (or choose an already existing project) and turn on permissions for the BigQuery API

3. Create a new client ID for the project, selecting "Installed Application" for Application Type  and “Other” for Installed Application Type![image alt text](image_1.png)

4. Save the client_secrets.json file to the piecewise/piecewise folder (it should replace the old client_secrets.json file already in there)

5. Turn on billing for the project in Google console (you will not be billed because your account is whitelisted, but Big Query requires API applications to have billing enabled)

4. In the Overview section of your new project, note the Project ID number

### Configure Piecewise for your location

The purpose of the Piecewise server is to consume M-Lab data from a particular geographic region and to aggregate it by sub-regions within that area. On your server, navigate to your Piecewise directory and check-out the **examples** branch of Piecewise:

        git checkout examples

The examples branch contains several examples of Piecewise customizations for different geographic areas. There are several directories ending with **_example** which you can use, copy or customize. For this documentation, we’ll be using the **baltimore_example** folder.

#### Creating your own configuration folder

You can copy one of these example folders to start your own configuration. For example, to create Baltimore example we used these steps:

1. Copy the folder, and rename key files:

        cp -rf seattle_example baltimore_example
        mv seattle_tasks.yml baltimore_tasks.yml
        mv seattle_center.py baltimore_center.py

2. Remove unneeded files:

        rm seattle_council_districts.geojson
        rm seattle_census10_blockgroups.topojson
        rm -rf seattle_blkgrpce10/
        rm seattle_bigquery_results.sql.gz

3. Import your shapefiles and topojson files:

        mkdir maryland_blkgrps
        scp critzo@192.168.4.181:maryland_shape_files/* ./maryland_blkgrps/
        scp critzo@192.168.4.181:Downloads/cb_2014_24_bg_500k.json ./maryland_blkgrps_2014.json

We end with this list of files:
```
ls
```

```
baltimore_center.py            	
baltimore_tasks.yml         	
center.js        	
extra_data.py
maryland_blkgrps/
  	cb_2014_24_bg_500k.cpg  	cb_2014_24_bg_500k.shp.ea.iso.xml
    cb_2014_24_bg_500k.dbf  	cb_2014_24_bg_500k.shp.iso.xml
    cb_2014_24_bg_500k.prj  	cb_2014_24_bg_500k.shp.xml
    cb_2014_24_bg_500k.shp  	cb_2014_24_bg_500k.shx
maryland_blkgrps_2014.json
piecewise_config.json
README.md
```

#### Gather your map files and coordinates

First we need to gather some information which we’ll use later to configure your Piecewise server.

* Geographic bounding box coordinates from which raw data will be consumed

* A shapefile containing the regions by which raw data will be aggregated by piecewise

* A topojson file corresponding to the same regions as the above shapefile, which will be used by the map front-end

##### Select a geographic bounding box

Use the tool of your choice to select the geographic area you’re interested in. We used [http://boundingbox.klokantech.com/](http://boundingbox.klokantech.com/) and searched for Baltimore, MD. You can also draw an arbitrary bounding box. After selecting an area, copy/paste the coordinates at the bottom of the page to use as the coordinates of your bounding box.

##### Obtain shapefiles for your data aggregation areas

Piecewise requires a shapefile containing the areas you wish M-Lab data to be aggregated into. Download your shapefile and topojson file. Later we’ll copy these files into your copy of Piecewise on your server. The US Census Bureau provides downloadable shapefiles for a variety of boundaries in the US, such as census tracts: [https://www.census.gov/geo/maps-data/data/cbf/cbf_blkgrp.html](https://www.census.gov/geo/maps-data/data/cbf/cbf_blkgrp.html) 

It’s also good practice to open the shapefile in QGIS or another program to confirm it’s ok.

##### Obtain a topojson file for your front-end map

The map front-end to Piecewise requires a topojson file based on the same shapefile you downloaded in the previous section. You can use QGIS or another desktop program to create this file, or use a service like [http://mapshaper.org/](http://mapshaper.org/) to upload your shapefile and then choose to save it in topojson format.

Gather the info below and modify your Piecewise config files:

**piecewise/baltimore_example/center.js** 

Provides the geographic center of your map. Find the center of your map on Google Maps and enter the latitude and longitude.

    var center = [39.2847064,-76.620486];

**piecewise/baltimore_example/baltimore_tasks.yml**
This is the Ansible tasklist for the Baltimore example. The highlighted areas were modified from a previous example after we copied the folder, and correspond to the folder and file names we made above.

```yml
---
- name: Copy geo data to server

  copy: src=baltimore_example/{{ item.src }} dest=/opt/bq2geojson/html/{{ item.dest }}

  with_items:

  	- { src: maryland_blkgrps_2014.json, dest: maryland_blkgrps_2014.json }

  	- { src: maryland_blkgrps, dest: '' }

  	- { src: center.js, dest: js/center.js }

- name: Copy extra_data.py to server

  copy: src=baltimore_example/extra_data.py dest=/opt/piecewise/

- pip: name=ipaddress state=latest

- name: Ingest census blocks to postgres

  command: ogr2ogr -f PostgreSQL -t_srs EPSG:4326 -nln maryland_blkgrps -nlt MultiPolygon 'PG:user=postgres dbname=piecewise' /opt/bq2geojson/html/maryland_blkgrps/cb_2014_24_bg_500k.shp

- name: Install baltimore piecewise configuration

  copy: src=baltimore_example/piecewise_config.json dest=/etc/piecewise/config.json

- name: Restart uwsgi so piecewise config is detected

  service: name=uwsgi state=restarted

- command: python extra_data.py chdir=/opt/piecewise

```


**piecewise/baltimore_example/piecewise_config.json**

This is the main configuration file for your Piecewise deployment. You will be updating some sections of this file for your deployment, most importantly information about the aggregations you desire. We’ll use the Baltimore, MD example here and highlight what was changed.

```json
	"aggregations": [{

    	"name": "by_census_block",	

    	"statistics_table_name": "block_statistics",

    	"bins": [

        	{ "type" : "spatial_join", "table" : "baltimore_census_blocks", "geometry_column" : "wkb_geometry", "key" : "district", "join_custom_data" : true },

        	{ "type" : "time_slices", "resolution" : "month" },
```
since we are
	

```yml
	"filters": [

    	{ "type": "temporal", "after": "Jan 1 2014 00:00:00", "before" : "Jan 1 2050 00:00:00" },

    	{ "type": "bbox", "bbox": [-76.711519,39.197207,-76.529453,39.372206] },
```

**piecewise/playbook.yml**

Lastly, we’ll modify the main Ansible playbook YAML file to point at our new Baltimore example tasks file.

```yml
---
- hosts: all

  tasks:

	- include: system_tasks.yml

  	sudo: True

	- include: user_tasks.yml

	- include: baltimore_example/baltimore_tasks.yml

  	sudo: True
```
         	

#### Set the time range for ingesting data

- in the piecewise_config.json you will find the options used for Seattle example, here the aggregation is done for council districts and census blocks, you can delete one of them and the other can look like this:

```
"aggregations": [{

       "name": "by_county", <- here add any name that is significant to you

       "statistics_table_name": "county_statistics", <- same here

       "bins": [

           { "type" : "spatial_join", "table" : "newengland", "geometry_column" : "wkb_geometry", "key" : "geoid", "key_type" : "string" ,"join_custom_data" : true }, <- look in the GeoJSON file and see what key you can use to aggregate, here we use the geoid for aggregation, we also have to mention the type of the key (string)

	...]

   }]
```

- in piecewise_config.json file in the filters section replace the bbox attribute with the CSV values for your location saved from[ http://boundingbox.klokantech.com/](http://boundingbox.klokantech.com/)  

- in the playbook.yml file replace - include: seattle_example/seattle_tasks.yml with - include: newengland_example/newengland_tasks.yml

First, gather the following information:

1. Make a copy of the Select the geographic boundaries you desire and configure Piecewise to consume M-Lab raw data originating from that region. This is in the form of geographic coordinates forming a bounding box, for example: [-122.6733398438,47.3630134401,-121.9509887695,47.8076208172]

2. Choose the sub-geographic areas by which the consumed raw data should be aggregated. This should be a topojson, geojson or geographic shape file.

3. Determine a time range for which data should be consumed from M-Lab

4. Configure an aggregation corresponding to your imported shapefile, topojson, or geojson areas

5. Prepare piecewise configuration files with this information and deploy

6. In the file _piecewise/piecewise/bigquery.py_ replace **PROJECT_NUMBER** with your project number from Google Developers Console.

7. Bring up the piecewise VM using Vagrant:

        $ vagrant up

8. SSH into the Vagrant VM:

        $ vagrant ssh

9. Confirm the correct PROJECT NUMBER inside the deployed vagrant VM:

        $ sudo vi /opt/piecewise/piecewise/bigquery.py

10. Run the piecewise ingest routine:

        $ cd /opt/piecewise
        $ sudo python -m piecewise.ingest

On the first run of **piecewise.ingest**, you will be prompted with a URL to authenticate your piecewise instance with the Google account that M-Lab whitelisted. Open the URL provided, authenticate and allow access, then copy verification code onto the command line.

If successful, you will see a number of messages about BigQuery jobs running. Once completed, load [http://localhost:8080](http://localhost:8080) in the web browser of the vagrant host machine. The host machine also provides the same web service on its own IP address.

### Customizing the front-end 

When we use vagrant to deploy a VM, the web server on the VM hosts files here:

         /opt/bq2geojson/html/

When deploying, the bq2geojson repo is pulled in and deployed: [https://github.com/m-lab/bq2geojson](https://github.com/m-lab/bq2geojson) 

Therefore, to prototype changes to the Seattle map example that is a frontend to piecewise, we can use the following workflow:

* Within the vagrant VM environment change to the web directory for bq2geojson:

        # cd /opt/bq2geojson/html

* Make changes, preview on the localhost server, track changes with git (the directory above is a git repo)

### Managing a Deployed Instance of Piecewise

* pulling in new changes to piecewise backend

        cd /opt/piecewise.git
        sudo git pull

* updates collector, piecewise and piecewise web

* cron jobs 

* restarting web services

        sudo service uwsgi restart

        sudo service nginx restart

* pulling in new frontend changes

        cd /opt/bq2geojson
        sudo git pull


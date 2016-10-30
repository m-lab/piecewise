## Customizing and configuring your Piecewise code

We’re now ready to customize your copy of Piecewise for the region you care about. We recommend starting a text file to document information about your application that you’ll need to configure Piecewise, and to have on hand for your own documentation.

The instructions on this page explain how to customize Piecewise on your **development** workstation, and test deployment in a VM, deployed using Vagrant and Ansible. Instructions on how to deploy your customized Piecewise code to a **production** server or VM can be found in our deployment documentation under [Deploying to production servers or VMs](https://github.com/opentechinstitute/piecewise/blob/stevenscounty/docs/DEPLOY.md#deploying-to-any-machine-or-vm-using-ansible-without-vagrant)

Also, please note that these instructions focus on the minimum customizations necessary to replicate the Seattle Broadband Map for a new location. To go beyond minumum customizations, we recommend completing these instructions to gain an understanding of the application, then read [Advanced Piecewise Customization](customizing-piecewise.md).

The basic steps for customizing Piecewise on a **development** workstation are:

  * Customize location-specific folders and files
  * Update Piecewise configuration files with geographic information about your region
  * Deploy and test your customizations to a VM on your **development** workstation

### Customize location-specific folder and files

When you first clone the Piecewise code, it is customized for its original use in the Seattle Broadband Map. To use Piecewise for a new location, we will:

  * Rename key folders and files
  * Obtain and save geodata for your desired location
  * Update the Piecewise configuration files

In this example, we'll configure Piecewise for the city of Baltimore, Maryland, to aggregate M-Lab data by US Census Blocks.

Please note that all commands below assume you are using linux or MacOS command line from inside the main ```piecewise``` folder cloned from your fork on Github.

#### Rename key folders and files

Rename the **seattle_example** folder and two configuration files inside it: 
>
>  ```
>  mv seattle_example baltimore_example
>  mv baltimore_example/seattle_tasks.yml baltimore_example/baltimore_tasks.yml
>  mv baltimore_example/seattle_center.py baltimore_example/baltimore_center.py
>  ```

Remove Seattle specific files:

>  ```
>  rm -rf  baltimore_example/seattle_*
>  ```

#### Obtain and save geodata for your desired location

Next, we need to gather some information to configure your Piecewise server:

  * Geographic bounding box coordinates from which M-Lab data will be consumed
  * The latitude and longitude coordinates for the center of your map
  * A shapefile containing the regions by which M-Lab data will be aggregated
  * A topojson file **created from the shapefile**, which is used to create the areas from the shapefile on the map visualization

##### Select a geographic bounding box

> We need to tell Piecewise the geographic area we're interested in. Piecewise will get M-Lab data from tests that have been run from within that area. The _bounding box_ will be in the form of four coordinates. There are many tools to help define a bounding box. We used [http://boundingbox.klokantech.com/](http://boundingbox.klokantech.com/). 
> 
> Search for "Baltimore, MD" on [http://boundingbox.klokantech.com/](http://boundingbox.klokantech.com/) and then change the settings in the lower left menu to **CSV**
>
> Copy the coordinates at the bottom of the page to use as the coordinates of your bounding box. They should like this: ```-76.711519,39.197207,-76.529453,39.372206```
>
> **Open the file ```baltimore_example/piecewise_config.json```**. Near the end of this file, replace the bounding box coordinates with your coordinates on this line: ```{ "type": "bbox", "bbox": [-76.711519,39.197207,-76.529453,39.372206] },``` with the bounding box coordinates you copied above.
>
> Save your changes. You will make additional changes to this file later. 

##### Find the coordinates for the center of your map:

> Piecewise needs to know the coordinates for the center of your map. Again, there are many ways to find this information. We searched [Google Maps](https://www.google.com/maps) for Baltimore, MD, which shows us [a map with Baltimore at the center](https://www.google.com/maps/place/Baltimore,+MD/@39.2848182,-76.6906973,12z/data=!3m1!4b1!4m2!3m1!1s0x89c803aed6f483b7:0x44896a84223e758).
> 
> Find the latitude and longitude coordinates for your desired location.
> 
> We obtained the latitude and longitude coordinates by copying them from the URL:
> 
> ```
> https://www.google.com/maps/place/Baltimore,+MD/@39.2848182,-76.6906973,12z/
> data=!3m1!4b1!4m2!3m1!1s0x89c803aed6f483b7:0x44896a84223e758
> ```
>
> The map center is the two coordinates after the @ sign in the URL: ```39.2848182,-76.6906973```. 
> 
> You can also note the _zoom level_ of the map, which can be useful later when we make customizations to the map. In this example, the zoom level is 12, denoted as ```12z```in the URL immediately following the two coordinates.
> 
> Open the file ```baltimore_example/center.js```, and replace the latitude and longitude coordinates between the brackets on this line: ```var center = [39.2847064,-76.620486];``` with your map center coordinates.

##### Obtain shapefiles for your data aggregation areas

> Piecewise will eventually download M-Lab test data that was submitted from within the four coordinates you gathered in the previous step. Its real power, however, is that Piecewise will also compute aggregate statistics from the raw M-Lab data for smaller areas within that bounding box. You can define multiple aggregations and use them as different layers in the same map or visualization. For example, we might use city council districts, counties, countries, census blocks or other shapes to aggregate M-Lab data.
> 
> Piecewise needs two geodata files for each aggregation layer you wish to use on your map. One of the files is used to aggregate M-Lab data and the other to present the aggregate data on the default map view.
> 
> For each aggregation you wish to present, you will need:
> 
>  * a **shape file (.shp)** - used by piecewise scripts to aggregate M-Lab data and save the statistics in a database
>  * a **topojson file (.topojson or .json)** - created from the shape file above, used to present aggregate data on the map
>
> Shapefiles are the most widely used geodata format used in the GIS community. The US Census Bureau provides downloadable shapefiles for a variety of boundaries in the US: [https://www.census.gov/geo/maps-data/data/cbf/cbf_blkgrp.html](https://www.census.gov/geo/maps-data/data/cbf/cbf_blkgrp.html). In the US, GIS people in cities or states often publish shapefiles for their communities that often amend or correct the shapefiles provided by the US Census Bureau. ```TO DO: add reference to international shapefile sources```
> 
> Once you locate the shapefile(s) you need, it's good practice to open the shapefile in [QGIS](http://www.qgis.org/en/site/) or another GIS program to confirm that it meets the requirements to use within your Piecewise application. When you open the shapefile(s) in your GIS program, **make a note of the name of its unique key field.** You'll use that later in these instructions.
> 
>  Shapefile requirements:
>
>  * Must contain at least one field that serves as a unique key, for example "geoid" or "geoid10" in the case of census block groups
>  * Numeric fields should be of the type "integer" or "float". ```TO DO: test float```
>  * Text fields should be of the type "string"
>  * Fields of the type "real" are NOT supported

##### Create a folder for your geodata file(s)

> ```mkdir baltimore_example/maryland_blkgrps```
> 
> Save/copy your shapefile(s) to the folder. **Note:** Shapefiles usually come with several other related project files. **All project files that come with your .shp file should be placed in your Piecewise application folder, not just the .shp file.**

##### Create a topojson file from your shapefile

> The shapefile(s) above will be used by Piecewise to aggregate raw M-Lab data, but you also want to use a map or other visualization to display your data.
> 
> The map visualization that Piecewise provides by default requires a **topojson file that is created from the same shapefile** you downloaded in the previous section.
> 
> Here are some resources for creating or converting geofiles:
> 
>  * [QGIS](http://www.qgis.org/en/site/)
>  * [Mapshaper](http://mapshaper.org/)
>  * [Topojson / geojson converter](http://jeffpaine.github.io/geojson-topojson/)
>
> Save your topojson file to the **baltimore_example** folder. In our example, this file is named **maryland_blkgrps_2015.json**
>
> When you're done, the **baltimore_example** folder should contain the files below:
> 
> ```
> baltimore_center.py
> baltimore_tasks.yml
> center.js
> extra_data.py
> maryland_blkgrps/
>   	cb_2015_24_bg_500k.cpg  	cb_2015_24_bg_500k.shp.ea.iso.xml
>     cb_2015_24_bg_500k.dbf  	cb_2015_24_bg_500k.shp.iso.xml
>     cb_2015_24_bg_500k.prj  	cb_2015_24_bg_500k.shp.xml
>     cb_2015_24_bg_500k.shp  	cb_2an015_24_bg_500k.shx
> maryland_blkgrps_2015.json
> piecewise_config.json
> README.md
> ```

#### Update the Piecewise configuration files

Now we have all the information we need to configure your Piecewise server. This will involve updating the values in several files in your configuration folder.

##### Edit the primary Ansible playbook

The main Ansible playbook YAML file, ```piecewise/playbook.yml```, must be edited to include our new Baltimore example Ansible playbook. Lines in this file that begin with a **#** sign are code comments that highlight the modifications you need to make to the lines below the comment.

```
---
# This is main Ansible playbook that configures your Piecewise server. You don't 
# need to be an Ansible expert to use Piecewise. Follow the instructions in the 
# code comments below to configure Piecewise for your desired location.
#
# For more information about Ansible and the syntax of this file, please see:
# http://docs.ansible.com/ansible/YAMLSyntax.html
#
# ------------------------------------------------------------------
# 
# 1) Rename the folder "seattle_example" to match your folder name, and 
#    the file "seattle_tasks.yml" to match the file name in your folder.
#
#    For example, change:
#       include: seattle_example/seattle_tasks.yml
#    to:
#       include: baltimore_example/baltimore_tasks.yml

- hosts: all
  tasks:
  - include: system_tasks.yml
    sudo: True
  - include: user_tasks.yml
  - include: seattle_example/seattle_tasks.yml
    sudo: True
```

##### Edit the system tasks Ansible playbook

The Ansible playbook, ```piecewise/system_tasks.yml```, installs and configures the software needed to run Piecewise. For most customizations of Piecewise, only a small change is needed to tell Ansible where your customized code is hosted. 

Open ```piecewise/system_tasks.yml``` and look for the section below:

```
# The command below tells Ansible where to download or copy your customized Piecewise files
# when it deploys your VM. Change the **repo** to match your fork and **version** to match 
# your branch.
#
#    For example, change:
#       git: repo=https://github.com/opentechinstitute/piecewise.git
#       dest=/opt/piecewise.git/
#       version=master
#    to:
#       git: repo=https://github.com/baltimore-github-org/piecewise.git
#       dest=/opt/piecewise.git/
#       version=master
#
# Note that the example above is fictious. Use the github URL of your fork and your branch. 

- name: Fetch piecewise
  git: repo=https://github.com/opentechinstitute/piecewise.git
       dest=/opt/piecewise.git/
       version=master
```

##### Edit the Ansible playlist containing local specific information

The Ansible tasklist, ```baltimore_example/baltimore_tasks.yml```, configures the location specific aspects of your Piecewise server. Lines in this file that begin with a **#** sign are code comments that highlight the modifications you need to make to the lines below the comment.

```
---
# This is the Ansible playbook that configures the location specific 
# aspects of your Piecewise server. You don't need to be an Ansible expert
# to use Piecewise. The commands in this playbook each begin with: "- name:" 
# and consist of multiple subsequent lines.
#
# Each section of Ansible commands below are preceded with code comments 
# to assist new Piecewise developers or implementers with customizing Piecewise
# for a new location, complementing the instructions in our documentation:
#   https://github.com/opentechinstitute/piecewise/blob/master/docs/CONFIG.md 
#
# For more information about Ansible and the syntax of this file, please see:
# http://docs.ansible.com/ansible/YAMLSyntax.html
#
# ------------------------------------------------------------------
# 
# 1) Rename the folder name "seattle_example" to match your folder name. 
#
#    For example, change:
#       copy: src=seattle_example/{{ item.src }}
#    to:
#       copy: src=baltimore_example/{{ item.src }}
#
# 2) On the lines following "with_items:", update the name of the json file 
#    to match the name of your topojson file and change the name of the shapefile folder 
#    to reflect your Piecewise instance.
#
#    For example, change:
#       with_items:
#        - { src: seattle_census10_blockgroups.topojson, dest: seattle_census10_blockgroups.topojson }
#        - { src: seattle_blkgrpce10, dest: '' }
#    to:
#        - { src: src: maryland_blkgrps_2015.json, dest: maryland_blkgrps_2015.json }
#        - { src: maryland_blkgrps, dest: '' }

- name: Copy geo data to server
  copy: src=seattle_example/{{ item.src }}
  dest=/opt/piecewise_web/{{ item.dest }}
  with_items:
   	- { src: maryland_blkgrps_2015.json, dest: maryland_blkgrps_2015.json }
  	- { src: maryland_blkgrps, dest: '' }
  	- { src: center.js, dest: js/center.js }

# ------------------------------------------------------------------
#
# 3) Rename the folder name "seattle_example" to match your folder name. 
#
#    For example, change:
#       copy: src=seattle_example/extra_data.py dest=/opt/piecewise
#    to:
#       copy: src=baltimore_example/extra_data.py dest=/opt/piecewise/

- name: Copy extra_data.py to server
  copy: src=baltimore_example/extra_data.py dest=/opt/piecewise/
- pip: name=ipaddress state=latest

# ------------------------------------------------------------------
#
# 4) Change the Ansible command that imports your geodata to reflect the 
# name of the folder containing your shapefiles as well as the shapefile itself.
#
#    For example, change:
#
#        command: ogr2ogr -f PostgreSQL -t_srs EPSG:4326 -nln seattle_blkgrpce10 -nlt 
#        MultiPolygon 'PG:user=postgres dbname=piecewise' 
#        /opt/piecewise_web/seattle_blkgrpce10/CENSUS10_blkgrp_WGS.shp
#    to:
#        command: ogr2ogr -f PostgreSQL -t_srs EPSG:4326 -nln maryland_blkgrps -nlt 
#        MultiPolygon 'PG:user=postgres dbname=piecewise' 
#        /opt/piecewise_web/maryland_blkgrps/cb_2015_24_bg_500k.shp
#
- name: Ingest census blocks to postgres
  command: ogr2ogr -f PostgreSQL -t_srs EPSG:4326 -nln seattle_blkgrpce10 -nlt MultiPolygon 'PG:user=postgres dbname=piecewise' /opt/piecewise_web/seattle_blkgrpce10/CENSUS10_blkgrp_WGS.shp

# ------------------------------------------------------------------
#
# 5) Rename the folder name "seattle_example" to match your folder name. 
#
#    For example, change:
#       copy: src=seattle_example/piecewise_config.json dest=/etc/piecewise/config.json
#    to:  
#       copy: src=baltimore_example/piecewise_config.json dest=/etc/piecewise/config.json

- name: Install piecewise configuration
  copy: src=baltimore_example/piecewise_config.json dest=/etc/piecewise/config.json

# ------------------------------------------------------------------
# The remaining Ansible commands do not need to be changed for customization of Piecewise. 
# ------------------------------------------------------------------

- name: Restart uwsgi so piecewise config is detected
  service: name=uwsgi state=restarted
- command: python extra_data.py chdir=/opt/piecewise

```

##### Edit the main Piecewise configuration file

The main configuration file for your Piecewise deployment is ```baltimore_example/piecewise_config.json```. You will be updating some sections of this file for your deployment, most importantly the information about the aggregations you want to be applied.

This JSON file is arranged in sections with sub-elements. The relevant sections we will change begin with **"aggregations"** and **"filters"**. Each section below begins with a code block from the relevant section, followed by instructions on what to change, and ending with the edited section of code. In our examples, we are using the folder and file names for our Baltimore example. Your folder and file names will likely differ.

**Aggregations Section Changes:**

```
"aggregations": [{
       "name": "by_census_block",
       "statistics_table_name": "block_statistics",
       "bins": [
          { "type" : "spatial_join", "table" : "seattle_blkgrpce10", "geometry_column" : "wkb_geometry", "key" : "geoid", "key_type" : "string" ,"join_custom_data" : true },
...
```

1. Change ```"by_census_block"``` to any name that is significant for the shapefile areas that you downloaded earlier.

2. Change ```"block_statistics"``` to a table name significant to your project. This defines the table name to store aggregated statistics for your Piecewise server.

3. In the sub-section labeled ```"bins"```, change ```"table" : "seattle_blkgrpce10"``` to:   ```"table" : "maryland_blkgrps"```. This table name is the same as the folder where you saved your geodata files.
      
4. Also in the ```"bins"``` section, change: ```"key" : "geoid"``` to: ```"key" : "<unique key field name>"```. The key name is the unique field in your geodata file which is used to join aggregated M-Lab data to geodata regions.

**Filters Section Changes**

```
  "filters": [
      { "type": "temporal", "after": "Jan 1 2014 00:00:00", "before" : "Jan 1 2050 00:00:00" },
      { "type": "bbox", "bbox": [-122.6733398438,47.3630134401,-121.9509887695,47.8076208172] },
...
```

In the "filters" section, change the "after" and "before" dates to reflect the start date from which M-Lab data should be ingested. Leaving the end date far in the future ensures data will be collected until that date.


#### Customize the HTML page that displays aggregated M-Lab data

At this point, we have customized all of the Piecewise backend components for a new location. We now need to update the HTML page that displays aggregated M-Lab data.


##### Update the map script to use your new location files and settings

Open ```piecewise_web/index.html``` and find the JavaScript near the end of the file that begins with:

``` 
    <script>
    // This is the Piecewise mapping script.

    ...
    </script>
```

Follow the instructions in the code comments to customize the map. Relevant code sections to change are pasted below.

**Change the polygonType variable name to reflect the type of aggregation you're using if needed**

```
// polygonType is a variable name defining your aggregation regions. 
// Change the name to reflect the aggregated regions you are using if needed.
var polygonType = 'census_block_groups';
```

**Define the minimum number of data points for a region to show aggregate M-Lab data**

```
// The minimum number of data points in any given polygon for a it to be
// considered statistically relevant.  These cells will either not be displayed
// or will be displayed with a different styling.
var minDataPoints = 5;
```

**Define the layers that are going to be added to the map**

```   
var geoLayers = {
  'census_block_groups': {
    'name': 'Census block groups',
    'polygonFile': 'seattle_census10_blockgroups.topojson',
    'dataUrl': 'stats/q/by_census_block?format=json&stats=AverageRTT,DownloadCount,MedianDownload,AverageDownload,UploadCount,MedianUpload,AverageUpload,DownloadMax,UploadMax&b.spatial_join=key&b.time_slices=month&f.time_slices=',
    'dbKey': 'geoid10',
    'geoKey': 'GEOID10',
    'cache': null,
    'layer': null
  },
};
```

* Change ```'census_block_groups'``` to match the value of ```var polygonType = ``` that you set in step #1.
* Change ```'name': 'Census block groups',``` to a more relevant name if needed.
* Change ```'polygonFile': 'seattle_census10_blockgroups.topojson',``` to the name of your topojson file. For example: ```'polygonFile': 'maryland_blkgrps_2015.json',``` 
* In the previous section of these instructions when editing ```piecewise_config.json```, if you changed the value in the **aggregation** section from  ```"name": "by_census_block",``` to something else, change the corresponding text in the line below:
```
  'dataUrl': 'stats/q/by_census_block?format=json&stats=AverageRTT,DownloadCount,MedianDownload,AverageDownload,UploadCount,MedianUpload,AverageUpload,DownloadMax,UploadMax&b.spatial_join=key&b.time_slices=month&f.time_slices=',
```
* Change the dbKey and geoKey values to the key names used in your geofiles:
```
'dbKey': 'geoid',
'geoKey': 'GEOID',
```

Note that the name of the field for dbKey and geoKey are the same, one is in capital letters. The reason for this is that the dbKey field name is stored in the Postgres database in lowercase and the geoKey field name is stored in your topojson file in capital letters. 


**Define your base tile layer**

To use Open Street Maps tiles, uncomment the lines below that start with ```var osmLayer ...``` by removing "//" from the beginning of the line.

```
// Use Open Street Maps as a base tile layer
var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>' +
    'contributors'
});
```

To use Mapbox tiles, uncomment the lines below that start with ```var mapboxLayer ...``` by 
removing "//" from the beginning of the line, and replace the text ```newamerica.lcl1jan5``` with your Mapbox account name and map id.

```
// Use Mapbox as a base tile layer
var mapboxLayer = L.tileLayer(
    'https://{s}.tiles.mapbox.com/v3/newamerica.lcl1jan5/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://mapbox.com/">Mapbox</a>'
});
```

**Set the default base layer**

With the default base layer defined, we can now add it to the map.

```
// Set the default base tile layer. 
// If using Open Street Maps: map.addLayer(osmLayer);
// If using Mapbox: map.addLayer(mapboxLayer);
map.addLayer(mapboxLayer);
```

Ensure that your preferred base layer is added to the ```var baseLayers``` array:
```
var baseLayers = {
   'Mapbox': mapboxLayer
};
```

## Commit your changes and update your fork and branch

The last thing you need to do before moving on to deploying Piecewise is commit and push all your changes to your fork. As you can see in the last step in the previous section, **Ansible downloads the repository and branch you specify during the deployment process.**

## Next move on to [Deploying your Piecewise instance](deploy.md)
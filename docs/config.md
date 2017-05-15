On this page:

* Obtaining geographic information and data, and adding it to your local copy of Piecewise
* Customizing Piecewise config files

## Obtaining geographic information and data, and adding it to your local copy of Piecewise

You will need to gather some information to configure your Piecewise server. 

  * Geographic bounding box coordinates from which M-Lab data will be consumed
  * A shapefile containing the regions by which M-Lab data will be aggregated
  * A topojson file **created from the shapefile**, which is used to create the areas from the shapefile on the map visualization

We recommend that you open a text document to save some of this information for future reference, and to use to customize Piecewise in later steps.

### Select a geographic bounding box

We need to tell Piecewise the geographic area we're interested in. Piecewise will get M-Lab data from tests that have been run from within that area. The _bounding box_ will be in the form of four coordinates. There are many tools to help define a bounding box. We used [http://boundingbox.klokantech.com/](http://boundingbox.klokantech.com/). 
 
* Enter your location in the box labelled "Find a place with Google ..." on [http://boundingbox.klokantech.com/](http://boundingbox.klokantech.com/) and press enter. Some example searches: "Baltimore, MD" or "Clearwater County, WA"
* In the lower left menu change the settings to: **CSV**
* Copy the coordinates at the bottom of the page into your documentation. They should like this: ```-116.4559, 46.2657, -114.5947, 46.9346```
  * The four coordinates are the southwest and northeast corners of the area you selected. From left to right, these values are: ```<southwest longitude>,<southwest latitude,<northeast longitude>,<northeast latitude>```
  * In your text file, put the values into the format below:

  ```
  map_coordinate_southwest: 
    lat: 46.2657
    lon: -116.4559

  map_coordinate_northeast: 
    lat: 46.9346
    lon: -114.5947
  ```

### Import geographic data files to use to aggregate M-Lab data

Piecewise will eventually download M-Lab test data that was submitted from within the four coordinates you gathered in the previous step. Its real power, however, is that Piecewise will also compute aggregate statistics from the raw M-Lab data for smaller areas within that bounding box. You can define multiple aggregations and use them as different layers in the same map or visualization. For example, we might use city council districts, counties, countries, census blocks or other shapes to aggregate M-Lab data.
 
For each aggregation you wish to present, you will need:

* a **shape file (.shp)** - used by piecewise scripts to aggregate M-Lab data and save the statistics in a database
* a **topojson file (.topojson or .json)** - created from the shape file above, used to present aggregate data on the map

Shapefiles are the most widely used geodata format used in the GIS community. The US Census Bureau provides downloadable shapefiles for a variety of boundaries in the US: [https://www.census.gov/geo/maps-data/data/cbf/cbf_blkgrp.html](https://www.census.gov/geo/maps-data/data/cbf/cbf_blkgrp.html). In the US, GIS people in cities or states often publish shapefiles for their communities that often amend or correct the shapefiles provided by the US Census Bureau. 

```TO DO: add reference to international shapefile sources```

Once you locate the shapefile(s) you need, it's good practice to open the shapefile in [QGIS](http://www.qgis.org/en/site/) or another GIS program to confirm that it meets the requirements to use within your Piecewise application. When you open the shapefile(s) in your GIS program, **make a note of the name of its unique key field.** You'll use that later in these instructions.

Shapefile requirements:

* Must contain at least one field that serves as a unique key, for example "geoid" or "geoid10" in the case of census block groups
* Numeric fields should be of the type "integer" or "float". ```TO DO: test float```
* Text fields should be of the type "string"
* Fields of the type "real" are NOT supported

#### Download and save shapefiles

Download and save your shapefiles to the folder ```local_customizations/geofiles/```. For example, listed below are the 2015 census block group shapefiles for Washington State, USA. The file ```wa_censusblocks.topojson``` is created in the next step, but included here because it will be saved in the same folder.

```
local_customizations/
└── geofiles
    ├── cb_2015_53_bg_500k.cpg
    ├── cb_2015_53_bg_500k.dbf
    ├── cb_2015_53_bg_500k.prj
    ├── cb_2015_53_bg_500k.shp
    ├── cb_2015_53_bg_500k.shp.ea.iso.xml
    ├── cb_2015_53_bg_500k.shp.iso.xml
    ├── cb_2015_53_bg_500k.shp.xml
    ├── cb_2015_53_bg_500k.shx
    └── wa_censusblocks.topojson
```

#### Create a topojson file from your shapefile

The last file listed above ```wa_censusblocks.topojson``` is created from the shapefile ```cb_2015_53_bg_500k.shp```. 

Here are some resources for creating a copy of your shapefiles in topojson format:

* [QGIS](http://www.qgis.org/en/site/)
* [Mapshaper](http://mapshaper.org/)
* [Topojson / geojson converter](http://jeffpaine.github.io/geojson-topojson/)

Save your topojson file to the same folder as above, ```local_customizations/geofiles/```.

## Customizing Piecewise config files

Two configuration files are used to configure Piecewise and Ansible to deploy your new site. 

* ```ansible/inventory/debian8-hosts```
* ```ansible/group_vars/all/piecewise_global_config.yml```

### Update the hosts file

Update ```ansible/inventory/debian8-hosts``` with the IP address of your server or VM running the Debian 8 linux operating system. If you are deploying as a user other than root, update the username as well.

### Customize the variables in the Piecewise global config file

The Piecewise global configuration file is located in ```ansible/group_vars/all/piecewise_global_config.yml```. The variables in this file are used by our Ansible deployment and administration playbooks to manage and deploy your customized code. The file contains many variables and values in [YAML format](https://en.wikipedia.org/wiki/YAML), suitable [for use with Ansible](https://docs.ansible.com/ansible/YAMLSyntax.html.) 

The global configuration file intended to be self-documented. Open it in your text editor and read through the comments from top to bottom. The file is extensively commented to advise you on what each variable is used for and what format to enter it in. Comment lines start with "#". 

You will see single variables and their values, for example:

```yaml
# The variables below define the messages and labels provided to the user before and 
# after the test.
run_test_heading: "Test your speed!"
test_result_heading: "Your test results"
```

There are also more complex nested variables, for example:

```yaml
form_fields:
  1:
    isp_user:
      field_type: select_list
      db_type: String
      name: isp_user
      id: isp_user
      text: "Who is your Internet Serice Provider?"
      options:
        1:
          default: "------"
        2:
          comcast: "Comcast"
        3:
          centurylink: "CenturyLink"
        4:
          wave: "Wave"
        5:
          other: "Other"
      required: yes
  2:
    other_isp:
      field_type: text
...
```

## Commit your changes and update your fork and branch

The last thing you need to do before moving on to deploying Piecewise is commit and push all your changes to your fork. Technically this is not required to deploy Piecewise since Ansible will use the files on your local machine. 

## Next move on to [Deploying your Piecewise instance](deploy.md)

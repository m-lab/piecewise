On this page:

* Obtaining geographic information and data, and adding it to your local copy of Piecewise
* Customizing Piecewise config files

## Obtaining geographic information and data, and adding it to your local copy of Piecewise

You will need to gather some information to configure your Piecewise server. 

  * Geographic bounding box coordinates from which M-Lab data will be consumed
  * A shapefile containing the regions by which M-Lab data will be aggregated
  * A topojson file **created from the shapefile**, which is used to create the areas from the shapefile on the map visualization

We recommend that you *open a text document to save some of this information for future reference*, and to use to customize the Piecewise configuration file in later steps. In the instructions below, we'll refer to this text document as your "Piecewise server documentation file."

### Select a geographic bounding box

We need to tell Piecewise the geographic area we're interested in. Piecewise will get M-Lab data from tests that have been run from within that area. The _bounding box_ will be in the form of four coordinates. There are many tools to help define a bounding box. We used [http://boundingbox.klokantech.com/](http://boundingbox.klokantech.com/). 
 
* Enter your location in the box labelled "Find a place with Google ..." on [http://boundingbox.klokantech.com/](http://boundingbox.klokantech.com/) and press enter. Some example searches: "Baltimore, MD" or "Clearwater County, WA"
* In the lower left menu change the settings to: **CSV**
* Copy the coordinates at the bottom of the page into your **Piecewise server documentation file**. They should like this: ```-116.4559, 46.2657, -114.5947, 46.9346```
  * The four coordinates are the southwest and northeast corners of the area you selected. From left to right, these values are: ```<southwest longitude>,<southwest latitude,<northeast longitude>,<northeast latitude>```
  * Put the values into your **Piecewise server documentation file** in the format below:

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

For shapefiles covering non-US regions, one source is the [GADM database of Global Administrative Areas](http://gadm.org/country).

Once you locate the shapefile(s) you need, it's good practice to open the shapefile in [QGIS](http://www.qgis.org/en/site/) or another GIS program to confirm that it meets the requirements to use within your Piecewise application. When you open the shapefile(s) in your GIS program, **make a note of the name of its unique key field.** You'll use that later in these instructions.

A few additional instructions for QGIS:

1. Download and install QGIS
2. Project > New
3. Layer > Add Layer > Add Vector Layer with local .shp files
4. Choose target granularity level. In the case of gadm.org shapefiles, 0 equals country (least specific) to 3 is most specific.
5. Remove unused local files. At this point, you should have 6 files: .cpg, .csv, .dbf, .prj, .shp, .shx. For more info on Shapefiles: [http://wiki.gis.com/wiki/index.php/Shapefile](http://wiki.gis.com/wiki/index.php/Shapefile)

Shapefile requirements:

* Must contain at least one field that serves as a unique key, for example "geoid" or "geoid10" in the case of census block groups
* Numeric fields should be of the type "integer" or "float". ```TO DO: test float```
* Text fields should be of the type "string"
* Fields of the type "real" are NOT supported

#### Download and save shapefiles

Your shapefiles will be downloaded and saved to the folder ```local_customizations/geofiles/```. 

Out of the box, Piecewise supports shapefiles for a single location. Multiple locations and aggregations are possible, but are an advanced customization option that is not yet implemented for general use.

The ```geofiles``` folder contains example shapefiles from the 2015 census block group for Washington State, USA, and the file ```wa_censusblocks.topojson```.

First remove the shapefiles and replace them with ones for the region you are interested in. 

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

#### Required Fields

Throughout the Piecewise global configuration file, a comment is provided for each field to note which are:

* **# !REQUIRED!** - required fields that must be changed
* **# #DEFAULT#** - field has a default value which you can change if desired, but can safely leave as-is

* If a field is marked required, you must enter a value or change the default value. 
* In some cases a group of fields is listed with required following them, all variables listed are required.
* For your convenience, a list of all required fields is provided below in the order they appear in the Piecewise global configuration file.

| Variable | Required/Default | Description |
| -------- | ---------------- | ----------- |
| env: | !REQUIRED! | Instructs Ansible whether this is a server/VM in development or in production. Supported values: production, development |
| project_name: | #DEFAULT# | The name of your forked repository. This is likely 'piecewise', unless you have renamed the repository after forking it from https://github.com/opentechinsstute.org/piecewise |
| remote: | !REQUIRED! | The URL where your repository is available. You can use any valid git remote.|
| piecewise_commit: | !REQUIRED! | Specify any ref (eg. branch, tag, SHA) to be deployed. This ref must be pushed to the remote git_repo before it can be deployed. |
| bigquery_project_num: | !REQUIRED! | The BigQuery Project Number or Project Name from your project details in the Google Cloud Console at https://console.cloud.google.com This can be the numeric project number or the project name text. |
| database_name: | #DEFAULT# |  |
| database_user: | #DEFAULT# |  |
| database_user_group: | #DEFAULT# |  |
| site_fqdn: | | FQDN stands for Fully Qualified Domain Name. This value should contain either the domain name of your production server (ie: www.mywebsite.com) or the IP address of your development or production server, ie: 111.222.333.444 Use an IP address for development, either on a server/VM on our LAN or a development server/VM on a cloud service like Linode, GCE, Amazon, etc. Once you have the server's domain name in DNS working, you can use it instead of the IP address.|
| site_contact: | !REQUIRED! | The email address to use for your SSL certificates. |
| site_country: | !REQUIRED! | The two letter county code for your SSL certificates.|
| site_state: | !REQUIRED! | The name of your state for your SSL Certificates. |
| site_city: | !REQUIRED! | The name of your city for your SSL Certificates. |
| site_ou: | !REQUIRED! | The name of your organization for your SSL Certificates. |
| self_signed_ssl_cert_path: | #DEFAULT# | Where self signed certificates should be saved on your remote VM/server. | 
| self_signed_ssl_key_path: | #DEFAULT# | Where self signed certificates keys should be saved on your remote VM/server. |
| letsencrypt_ssl_key_path: | #DEFAULT# | Where Let's Encrypt certificates should be saved on your remote VM/server. |
| base_path: | #DEFAULT# | Where the base files from your repo will be copied on the remote server. |
| temp_path: | #DEFAULT# | Temporary location on the remote server where files may be extracted temporarily. | 
| site_path: | #DEFAULT# | Where the website files should be on the server. |
| shape_file: | !REQUIRED! | The filename of the shapefile Piecewise should use for your aggregations.|
| dbKey: | !REQUIRED! | The field name of the unique key in your shape file. |
| dbKeyDataType: | !REQUIRED! | The data type of dbKey. |
| shape_projection: | !REQUIRED! | The SRS reprojection/transform to use for this shapefile. |
| geometry_type: | !REQUIRED! | The geometry type for the layer created from this shapefile. |
| layer_name: | !REQUIRED! | The name you wish to be used for this shapefile layer in postgres. |
| aggregation_name: | !REQUIRED! | The name you wish Piecewise to use to name this aggregation. |
| aggregation_stats_table_name: | !REQUIRED! | The table name to use for aggregate statistics. |
| map_coordinate_southwest: | | | 
|   lat: | !REQUIRED! | The latitude for the southwest corner of the bounding box defining the region from which you are interested in pulling M-Lab NDT data.|
|   lon: | !REQUIRED! | The longitude for the southwest corner of the bounding box.|
| map_coordinate_northeast: | | | 
|   lat: | !REQUIRED! | The latitude for the northeast corner of the bounding box. |
|   lon: | !REQUIRED! | The longitude for the northeast corner of the bounding box.|
| map_data_start_date: | !REQUIRED! | Sets the start date from which your server will obtain M-Lab NDT test data. |
| map_data_end_date: | !REQUIRED! | Sets the end date from which your server will obtain M-Lab NDT test data. |
| topojson_file: | !REQUIRED! | The file name of a topojson format geo file that is created using the shapefile defined above and saved in the folder ```/local_customizations/geofiles/``` |
| geoKey: | !REQUIRED! | The field name in your topojson file which corresponds to the unique key in your shapefile. This is typically the same as dbKey, but in CAPITAL LETTERS. |
| mapscript_start_year: | #DEFAULT# | The first year that should be displayed in the 'year' dropdown. |
| mapscript_start_month: | #DEFAULT# | Defines the start month in the timeline. |
| mapscript_base_layer: | #DEFAULT# | Defines the type of base layer to be used on the map. Either Mapbox.com or OpenStreetMaps base layers are supported. Set mapscript_base_layer to either: 'mapbox' OR 'osm' |
| mapscript_osm_api_url: | #DEFAULT# | The default OpenStreetMap API url. |
| mapscript_mapbox_api_url: | #DEFAULT# | If you are using a Mapbox base layer, set the API URL for your Mapbox tiles in this variable. |
| mapscript_min_data_points: | #DEFAULT# | Sets the minimum number of tests which must be present in any aggregate area defined by your shapefile in order to be displayed on the aggregate website map. |
| mapscript_zoom_level: | #DEFAULT# | The initial zoom level for the map display. |
| mapscript_layer_name: | #DEFAULT# | Name of the map layer in the website's JavaScript code. |
| mapscript_layer_name_pretty: | #DEFAULT# | Name of the map layer on the website as displayed to the user. |
| mapscript_json_type: | #DEFAULT# | The type of geofile to be used by JavaScript. The only supported value currently is 'topojson'. |
| mapscript_month_names: | #DEFAULT# | Month names as displayed on the website. |
| form_fields: | !REQUIRED! | Variables which define the website form as it appears to the user. See complete instructions in the Piecewise global configuration file on customizing the elements of 'form_fields'. |
| site_name: | #DEFAULT# | Defines the HTML page title element. |
| intro_text: | #DEFAULT# | Defines the heading text that precedes the HTML survey form, provided to users before they may take the test.|
| consent_message: | #DEFAULT# | Defines the message displayed next to the consent checkbox. |
| run_test_heading: | #DEFAULT# | These variables define the messages and labels provided to the user before and after the test. |
| test_result_heading: | #DEFAULT# | |
| download_result_label: | #DEFAULT# | |
| download_result_unit: | #DEFAULT# | |
| upload_result_label: | #DEFAULT# | |
| upload_result_unit: | #DEFAULT# | |
| rtt_result_label: | #DEFAULT# | |
| rtt_result_unit: | #DEFAULT# | |
| thank_you_heading: | #DEFAULT# | |
| thank_you_message: | #DEFAULT# | |
| next_action_message: | #DEFAULT# | 'next_action_' variables define the action items present to the user after they run the test. |
| next_action_show_map_text: | #DEFAULT# | Set 'next_action_' variables to 'none' to exclude them the website.|
| next_action_learn_about_text: | #DEFAULT# | |
| next_action_learn_about_link: | #DEFAULT# | |
| next_action_social_share_text: | #DEFAULT# | To exclude all social share options, set 'next_action_social_share_text' to 'none'. |
| social_share_twitter: | #DEFAULT# | 'social_share_' variables define the links to be used for social sharing actions. |
| social_share_gplus: | #DEFAULT# | |
| social_share_facebook: | #DEFAULT# | |
| social_share_stumbleupon: | #DEFAULT# | |
| social_share_reddit: | #DEFAULT# | |
| social_share_linkedin: | #DEFAULT# | |
| social_share_email: | #DEFAULT# | |
| icon_test_label: | #DEFAULT# | 'icon_' and 'mapview_icon_' variables define the text accompanying the icons in the user interface. |
| icon_test_alt_text: | #DEFAULT# | |
| icon_browse_label: | #DEFAULT# | |
| icon_browse_alt_text: | #DEFAULT# | |
| icon_learn_label: | #DEFAULT# | |
| icon_learn_alt_text: | #DEFAULT# | |
| icon_learn_link: | #DEFAULT# | |
| mapview_icon_test_alt_text: | #DEFAULT# | |
| mapview_icon_learn_alt_text: | #DEFAULT# | |
| mapview_icon_learn_link: | #DEFAULT# | |
| mapcontrols_zoom_pos: | #DEFAULT# | T'mapcontrols_' variables control where the map controls are placed in the UI. These should not be changed. |
| mapcontrols_legend_pos: | #DEFAULT# | |

#### Description of Variables in Piecewise Global Configuration File

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

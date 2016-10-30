# Advanced Piecewise Customization

Our Install, Configure, Deploy, and Post-Deployment documents cover basic configuration of Piecewise for a new location.  This document outlines how to customize additional components of the Piecewise application in greater detail. 

## How to use commonly recognized ISP names in your aggregated statistcs instead of the Autonomous System names detected by Piecewise

### About ISP names detected by Piecewise

When it ingests and aggregates M-Lab data, Piecewise looks up the IP address from test results in the [Maxmind Geolite2 Database](http://dev.maxmind.com/geoip/geoip2/geolite2/) to find the [Autonmous System](https://en.wikipedia.org/wiki/Autonomous_system_%28Internet%29) (AS) associated with that IP address. These names are aggregated by Piecewise, but may not reflect the public names of ISPs which consumers in your region recognize. Additionally, ISPs often have multiple AS's. 

By defaut, the map Piecewise provides doesn't use the ISP names detected in test data, but grouping statistics by ISP is supported by Piecewise, so building additional visualizations using the ISP groupings or "bins" is possible. For example, in the [Seattle Broadband Map](http://broadbandmap.seattle.gov/) the default map view shows M-Lab data for the current month. The map uses an API URL to get the data that is displayed in each census block:

```
http://broadbandmap.seattle.gov/stats/q/by_census_block?format=json&stats=AverageRTT,DownloadCount,MedianDownload,AverageDownload,UploadCount,MedianUpload,AverageUpload,DownloadMax,UploadMax&b.spatial_join=key&b.time_slices=month&f.time_slices=1475280000,1477958399
```

Loading this URL shows us JSON data containing the selected metrics, during the time range selected, for each census block:

```
{
	geometry: null,
	properties: {
	download_avg: 3.4292537313,
	download_count: 1,
	download_max: 3,
	download_median: 3,
	geoid10: "530330097011",
	rtt_avg: 65.58008658008659,
	time_slice: 1475280000,
	upload_avg: 4.8057203311,
	upload_count: 1,
	upload_max: 8,
	upload_median: 8
},
```

By adding the parameter ```&b.isp_bins``` to the URL above, we can get additional groupings by ISP. First, here is the modified URL:

```
http://broadbandmap.seattle.gov/stats/q/by_census_block?format=json&stats=AverageRTT,DownloadCount,MedianDownload,AverageDownload,UploadCount,MedianUpload,AverageUpload,DownloadMax,UploadMax&b.spatial_join=key&b.time_slices=month&f.time_slices=1475280000,1477958399&b.isp_bins
```

And the resulting JSON, which includes a new field, _isp_. Note that in the example below, the two entries shown are slightly different. The first shows a recognized consumer ISP: **isp: "comcast"**, and the second, **isp: "AS174 Cogent Communications"**, is perhaps not well recognized. 

The second record shows the ISP name as Piecewise detects it, and the first record shows an "ISP rewrite", which maps a more widely recognized ISP name to those detected by the application.

```
{
geometry: null,
	properties: {
	download_avg: 36.5648511279,
	download_count: 1804,
	download_max: 241,
	download_median: 21.5,
	geoid10: "530330067001",
	isp: "comcast",
	rtt_avg: 36.15312740583771,
	time_slice: 1475280000,
	upload_avg: 2.910283335,
	upload_count: 1552,
	upload_max: 32,
	upload_median: 4
},
...
{
	geometry: null,
	properties: {
	download_avg: 19.3051286655,
	download_count: 1,
	download_max: 19,
	download_median: 19,
	geoid10: "530330024002",
	isp: "AS174 Cogent Communications",
	rtt_avg: 44.5612868917841,
	time_slice: 1475280000,
	upload_avg: 2.4940778877,
	upload_count: 1,
	upload_max: 4,
	upload_median: 4
},
```
See [Piecewise Statistics](piecewise-statistics.md) for more information about the options available in the Piecewise API. 

### How to update the names of ISPs for your Piecewise server

After you've initial development and customiztions Piecewise, and before deploying your Piecewise instance in production, you may wish to update the names of ISPs in the "rewrites" section of the main Piecewise configuration file. In our document [Configuring your instance for your location](CONFIG.md), this file is located in ```baltimore_example/piecewise_config.json```

#### Find the ISP names as Piecewise detects them

Assuming you have successfully deployed your customized Piecewise code to a VM using Vagrant, load the URL below into a web browser:

```
http://localhost:8080/stats/q/by_census_block?format=json&stats=AverageRTT,DownloadCount,MedianDownload,AverageDownload,UploadCount,MedianUpload,AverageUpload,DownloadMax,UploadMax&b.spatial_join=key&b.time_slices=month&b.isp_bins
```

Note that in this URL, we've removed the variable ```&f.time_slices=1475280000,1477958399``` in order to show aggregate data for all records in our database, not just the latest month. This allows you to see the names of ISPs as Maxmind sees them, in order to add the appropriate rewrites for your area. Make a note of the ISP names found by Piecewise.

#### Update the names of ISPs in the "rewrites" section of piecewise_config.json

* Open the main configuration file for your Piecewise deployment: ```baltimore_example/piecewise_config.json```. 
* Look for the sub-section of "bins" called "rewrites"

```
        "name": "by_census_block",
        "statistics_table_name": "block_statistics",
		"bins": [
            { "type" : "spatial_join", "table" : "maryland_blkgrps", "geometry_column" : "wkb_geometry", "key" : "GEOID", "key_type": "string", "join_custom_data" : true },
            { "type" : "time_slices", "resolution" : "month" },
            { "type" : "isp_bins", "maxmind_table" : "maxmind", 
------>         "rewrites" : {
                    "aerioconnect": ["Aerioconnect"],
                    "at&t": ["AT&T Services", "AT&T Mobility LLC", "Wayport"],
                    "cablevision": ["Cablevision Systems", "CSC Holdings", "Cablevision Infrastructure", "Cablevision Corporate", "Optimum Online", "Optimum WiFi", "Optimum Network"],
        ...
```

* Add or edit the rewrites section as desired. Note that you can group multiple "detected" ISPs together, using a list of comma separated values. In the example above, you'll see that in this configuration, **at&t** is the widely recognized ISP name, and three detected ISP names are grouped together as "at&t": ["AT&T Services", "AT&T Mobility LLC", "Wayport"]

* After updating the ISP re-writes section, to see the results in your **development** VM, log into the VM and as root, and run the Piecewise Aggregate script:

```
$ cd /opt/piecewise
$ python -m piecewise.aggregate
```

* Before deploying to **production**, save your work, and commit your changes to your Github fork
* Newly deployments to **development** VMs or **production** servers/VMs will now use the updated ISP rewrites.


## How to add/edit the web-form fields

Piecewise provides a web-form to collect some information about ISP and cost of service from people who want to run a test. Once they complete the form, the test is presented and a person can run it.

You might want to change or edit the existing form field options, which requires a couple of steps:

  * Edit the form's HTML code in ```piecewise_web/index.html```
  * Edit the validation options for the form handler in ```collector/collector/wsgi.py```

### Edit the form HTML code

In ```piecewise_web/index.html```, you'll find the HTML form is fairly standard and begins with the lines below. Edit the form elements as you would any other HTML web form.

```
<form action="/collector/collect" method="get" id="collector">
	<div id="extra-data" class="ndt-related">
		<div class="container">
				<p><span class="required">*</span> Who is your Internet Service Provider?</p>
				<p>
					<select id="isp_user" name="isp_user" class="form-control">
						<option value="default">------</option>
						<option value="airpipe-wireless">AirPipe Wireless</option>
						<option value="att">AT&amp;T</option>
						<option value="century-link">CenturyLink</option>
						<option value="comcast">Comcast</option>
						<option value="charter">Charter</option>
						<option value="cougar-wireless">Cougar Wireless</option>
						<option value="desert-winds-wireless">Desert Winds Wireless</option>
						<option value="dish-net">DishNet</option>
						<option value="ecliptixnet-wireless">Ecliptixnet Wireless</option>
						<option value="excede-wild-blue">Excede/WildBlue</option>
						<option value="hughes-net">HughesNet</option>
						<option value="ptera-wireless">Ptera Wireless</option>
						<option value="startouch">Startouch</option>
						<option value="verizon">Verizon</option>
						<option value="other">Other</option>
					</select>
	...				
```

### Edit the form validation options

Piecewise's web form is handled by an app route defined in ```collector/collector/wsgi.py```. We want to make sure our new form field values are also in the validation for the ```collect``` route. Look for the section of ```collector/collector/wsgi.py``` that begins with the lines below:

```
@app.route("/collect", methods=['GET'])
def append_extra_data():
    isp_types = ['default', 'airpipe-wireless', 'att', 'century-link', 'comcast', 'charter', 'cougar-wireless', 'desert-winds-wireless', 'dish-net', 'ecliptixnet-wireless', 'excede-wild-blue', 'hughes-net', 'ptera-wireless', 'verizon', 'other']
    connection_types = ['default', 'wired', 'wireless-single', 'wireless-multiple']
    cost_of_service_types = ['default', 'less_than_25', '25_50', '50_75', '75_100', '100_150', '150_200', '200_or_above', 'dont_know']
...
``` 

As an example, a common customization of this form is to change the list of ISPs that can be selected by the person viewing the page, or the cost of service options. In this case, you update the HTML form with the options you want, and then ensure the same choices are updated in the collect route's validation.

## How to add new form fields

If you want to add new form fields, it's easiest to do so before deploying your production instance of Piecewise. Adding form fields basically requires a few more edits to ```collector/collector/wsgi.py```, to ensure that the database table holding your form submission records is setup correctly.

```TO DO: finish this section```

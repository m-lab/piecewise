// This is the Piecewise mapping script.

// Functions imported from /js/mlab.js

// purely launch workaround for #114
function getCurrentValues() {
	var currentMetricOption = $('#selectMetric option:selected').text();
	var currentYearOption = $('#selectYear option:selected').text();
	// get index
	var currentMonthOption = $('#sliderMonth').slider("value");
	// apply index to month array
	currentMonthOption = monthNames[currentMonthOption -1];
	console.log(currentMetricOption, currentYearOption, currentMonthOption);
	$('#mobile-only-text').remove();
	$('.metricControls').before('<p id="mobile-only-text">Showing <span class="metric">' + currentMetricOption + '</span> from <span class="mobiledate">' + currentMonthOption + ". " + currentYearOption + '</span></p>');
};


/**
 * Creates the map legend that will appear in the lower right corner of the map.
 *
 * @returns {object} DOM object for map legend
 */
function addLegend() {
	var legend = L.control({position: 'bottomleft'});

	legend.onAdd = function(map) {
	    var div = L.DomUtil.create('div', 'info legend'),
	        grades = [0, 5, 10, 25, 50];

	    var i;
		div.innerHTML = '';
	    for ( i = grades.length - 1; i >= 0; i-- ) {
	        div.innerHTML +=
	            '<i style="background:' + getPolygonColor(grades[i]) +
				'"></i> ' + (i == grades.length ? '0' : grades[i]) + (grades[i - 1] ?
				'&ndash;' + grades[i - 1] + ' Mbps<br/>' : '+ Mbps<br/>');
	    }
		div.innerHTML += '<i style="background: black; opacity: .2">' +
		'</i>Insuff. data';
	    return div;
	};

/*
	    for ( var i = 0; i < grades.length; i++ ) {
	        div.innerHTML +=
	            '<i style="background:' + getPolygonColor(grades[i] + 1) +
				'"></i> ' + (i == 0 ? '0' : grades[i]) + (grades[i + 1] ?
				'&ndash;' + grades[i + 1] + ' Mbps<br/>' : '+ Mbps');
	    }
	    return div;
*/
	legend.addTo(map);
}

/**
 * Add various map controls to the lower left corner of the map.
 *
 * @returns {object} DOM object for the controls box
 */
function addControls() {
	var controls = L.control({position: 'bottomleft'});

	controls.onAdd = function(map) {
		var controls = L.DomUtil.create('div', 'info controls'),
		labelMetric = L.DomUtil.create('span', 'mapControls', controls),
		selectMetric = L.DomUtil.create('select', 'mapControls', controls),
		labelYear = L.DomUtil.create('span', 'mapControls', controls),
		selectYear = L.DomUtil.create('select', 'mapControls', controls);

		if ( polygonType == 'hex' ) {
			var labelRes = L.DomUtil.create('span', 'mapControls', controls),
				selectRes = L.DomUtil.create('select', 'mapControls', controls);
			labelRes.innerHTML = 'Res.';
			selectRes.innerHTML = '<option value="low">Low</option>' +
				'<option value="medium">Medium</option>' +
				'<option value="high">High</option>';
			selectRes.setAttribute('id', 'selectRes');
		}

		var	checkAnimate = L.DomUtil.create('div', 'mapControls', controls),sliderMonth = L.DomUtil.create('div', 'mapControls', controls),dateOptions = '';

		var yearSelected;
		for ( var year in dates ) {
			yearSelected =  year == currentYear ? 'selected="selected"' : '';
			dateOptions += '<option value="' + year + '"' + yearSelected +
				'>' + year + '</option>';
		}

		checkAnimate.innerHTML = '<span id="playAnimation" class="paused"></span>';

		sliderMonth.setAttribute('id', 'sliderMonth');
		// Prevent the entire map from dragging when the slider is dragged.
		L.DomEvent.disableClickPropagation(sliderMonth);


		labelMetric.innerHTML = 'Show me';
		selectMetric.innerHTML = '<option value="download_median">' +
			'Download speeds</option><option value="upload_median">' +
			'Upload speeds</option>';
		selectMetric.setAttribute('id', 'selectMetric');
		selectMetric.setAttribute('class', 'form-control');

		labelYear.innerHTML = 'from';
		selectYear.innerHTML = dateOptions;
		selectYear.setAttribute('id', 'selectYear');
		selectYear.setAttribute('class', 'form-control');

		return controls;
	};

	controls.addTo(map);


	var metricChoices = $(".leaflet-control > span, .leaflet-control > select").slice(0,4);
	$(".leaflet-control > div.mapControls").wrapAll("<div class='sliderElements'></div>");
	metricChoices.wrapAll("<div class='metricControls'></div>");

	var elems;
	if ( polygonType != 'hex' ) {
		elems = [selectYear, selectMetric];
	} else {
		elems = [selectYear, selectMetric, selectRes];
	}
	elems.forEach( function(elem) {
		elem.addEventListener('change',
			function (e) { updateLayers(e, 'update'); });
	});

	var clearId;
	$('#playAnimation').click( function() {
		$('#playAnimation').toggleClass('paused');
		if ( $('#playAnimation').hasClass('paused') ) {
			clearInterval(clearId);
			$('.leaflet-control-layers').addClass(
				"leaflet-control-layers-expanded");
		} else {
			$('.leaflet-control-layers').removeClass(
				"leaflet-control-layers-expanded");
			var i = $('#sliderMonth').slider('value');
			clearId = setInterval( function() {
				$('#sliderMonth').slider('value', i + 1);
				i = (i + 1) % dates[$('#selectYear').val()].length;
			}, animateInterval);
		}
	});

	// Can't instantiate the slider until after "controls" is actually added to
	// the map.
	$('#sliderMonth')
		.slider({
			min: Number(dates[currentYear][0]),
			max: Number(dates[currentYear][dates[currentYear].length - 1]),
			value: currentMonth,
			change: function (e, ui) {
				updateLayers(e, 'update');
			}
		})
		.slider('pips', {
			rest: 'label',
			labels: monthNames.slice(0, dates[currentYear].length)
		});;
}

/**
 * Update the map when some event gets triggered that requires the map to
 * displays something else.
 *
 * @param {object} e Event object
 * @param {string" mode What state are we in? New or update?
 */
function updateLayers(e, mode) {
	var year = $('#selectYear').val(),
		metric = $('#selectMetric').val();

	var resolution = polygonType == 'hex' ? $('#selectRes').val() : '';

	// If the year was changed then we need to update the slider and set its
	// value to the first configured month for that year.
	if ( e.target.id == 'selectYear' ) {
		$('#sliderMonth')
			.slider('option', 'min', Number(dates[year][0]))
			.slider('option', 'max', Number(
				dates[year][dates[year].length - 1]))
			.slider().slider('pips', {
				rest: 'label',
				labels: monthNames.slice(0, dates[year].length)
			});

		// This is a really ugly hack, but we don't want the onchange event to
		// fire when changing the slider value from within the updateLayers()
		// function, else changing the slider value actually triggers the
		// updateLayers() function to run a second time.  There must be a better
		// way to do this, but for now just remove the onchange event function,
		// change the value, then re-add it.
		$('#sliderMonth').slider('option', 'change', function(){return false;});
		$('#sliderMonth').slider('value', dates[year][0]);
		$('#sliderMonth').slider('option', 'change',
			function(e, ui){ updateLayers(e, 'update')});

		if ( seedCache ) {
			seedLayerCache(year);
		}

	}

	var month = $('#sliderMonth').slider('value');

	for (var geoLayer in geoLayers) {
		setPolygonLayer(geoLayer, year, month, metric, mode, resolution);
	}

}

/**
 * Determines the color of a polygon based on a passed metric.
 *
 * @param {number} val Metric to evaluate
 * @returns {string} A string representing the color
 */
function getPolygonColor(val) {
    return val >= 50 ? '#F57F17' :
           val >= 25  ? '#F9A825' :
           val >= 10  ? '#FBC02D' :
           val >= 5  ? '#FFEB3B' :
           val >= 0   ? '#FFEE58' : 'transparent';
}

/**
 * Fetches layer data from the server.
 *
 * @param {string} url URL where resource can be found
 * @param {function} callback Callback to pass server response to
 */
function getLayerData(url, callback) {
	if ( geoJsonCache[url] ) {
		console.log('Using cached version of ' + url);
		callback(geoJsonCache[url]);
	} else {
		console.log('Fetching and caching ' + url);
		$.get(url, function(resp) {
			// If we're dealing with a TopoJSON file, convert it to GeoJSON
			if ('topojson' == url.split('.').pop()) {
				var geojson = {
					'type': 'FeatureCollection',
					'features': null
				};
				geojson.features = omnivore.topojson.parse(resp);
				resp = geojson;
			}
			geoJsonCache[url] = resp;
			callback(resp);
		}, 'json');
	}
	getCurrentValues();
}

/**
 * Applies a layer to the map.
 *
 * @param {string} layer Name of layer to set
 * @param {string} year Year of layer to set
 * @param {string} month Month of layer to set
 * @param {string} metric Metric to be represented in layer
 * @param {string" mode What state are we in? New or update?
 * @param {string} [resolution] For hexbinned map, granularity of hex layer
 */
function setPolygonLayer(layer, year, month, metric, mode, resolution) {
	var polygonUrl;
	var dataUrl;

	// Create the layer from the cache if this is a newly loaded page
	if ( mode == 'new' ) {
		geoLayers[layer]['layer'] = L.geoJson(JSON.parse(
			JSON.stringify(geoLayers[layer]['cache'])));
	}

	// Don't display spinner if animation is happening
	if ( $('#playAnimation').hasClass('paused') === false ) {
		$('#spinner').css('display', 'block');
	}

	month = month < 10 ? '0' + month : month;
	if ( polygonType != 'hex' ) {
		var start = Date.UTC(year, month - 1, 1) / 1000;
		var end = Date.UTC(year, month, 1, 0, 0, -1) / 1000;
		dataUrl = geoLayers[layer]['dataUrl'] + start + ',' + end;
	} else {
		dataUrl = 'json/' + year + '_' + month + '-' + resolution + '.' +
			jsonType;
	}

	getLayerData(dataUrl, function(response) {
		var lookup = {};
		response.features.forEach(function(row) {
			lookup[row.properties[geoLayers[layer]['dbKey']]] = row.properties;
		});
		geoLayers[layer]['layer'].eachLayer(function(l) {
			cell = l.feature;

			var stats = lookup[cell.properties[geoLayers[layer]['geoKey']]];
			for (var k in stats) {
				if (stats.hasOwnProperty(k)) {
					cell.properties[k] = stats[k];
				}
			}

			var value = cell.properties[metric],
				polygonStyle = cell.polygonStyle = {};

			polygonStyle.weight = 1;
			polygonStyle.fillOpacity = 0.5;

			if ( ! value ) {
				polygonStyle.weight = 0.2;
				polygonStyle.fillOpacity = 0.015;
				polygonStyle.color = 'black';
				l.bindPopup(makeBlankPopup());
			} else if ( metric == 'download_median' &&
					cell.properties['download_count'] < minDataPoints ) {
				polygonStyle.weight = 0.5;
				polygonStyle.fillOpacity = 0.05;
				polygonStyle.color = 'black';
			} else if ( metric == 'upload_median' &&
					cell.properties['upload_count'] < minDataPoints ) {
				polygonStyle.weight = 0.5;
				polygonStyle.fillOpacity = 0.05;
				polygonStyle.color = 'black';
			} else {
				polygonStyle.color = getPolygonColor(value);
			}

			if ( metric == "download_median" &&
					cell.properties.download_count > 0 ) {
				l.bindPopup(makePopup(cell.properties));
			}
			if ( metric == "upload_median" &&
					cell.properties.upload_count > 0 ) {
				l.bindPopup(makePopup(cell.properties));
			}
			l.setStyle(cell['polygonStyle']);
		});

		// Add the layer controls if this is on page load, and if this
                // is the default layer we are dealing with then go ahead and add it
		// to the map.
		if ( mode == 'new' ) {
			layerCtrl.addOverlay(geoLayers[layer]['layer'], geoLayers[layer]['name']);
			if ( layer == defaultLayer ) {
				map.addLayer(geoLayers[layer]['layer']);
			}
		}

	});

	$('#spinner').css('display', 'none');
}

/**
 * Applies a scatter plot layer to the map.
 *
 * @param {string} year Year of layer to set
 * @param {string} month Month of layer to set
 * @param {string" mode What state are we in? New or update?
 */
function setPlotLayer(year, month, mode) {
    return;

	// Don't display spinner if animation is happening
	if ( $('#playAnimation').hasClass('paused') === false ) {
		$('#spinner').css('display', 'block');
	}

	month = month < 10 ? '0' + month : month;
	var plotUrl = 'json/' + year + '_' + month + '-plot.' + jsonType;

	if ( mode == 'update' ) {
		layerCtrl.removeLayer(plotLayer);
	}

	getLayerData(plotUrl, function(response) {
		if ( map.hasLayer(plotLayer) ) {
			map.removeLayer(plotLayer);
			var plotLayerVisible = true;
		}

		plotLayer = L.geoJson(response, {
			pointToLayer: function(feature, latlon) {
				return L.circleMarker(latlon, {
					radius: 1,
					fillColor: '#000000',
					fillOpacity: 1,
					stroke: false
				});
			}
		});

		layerCtrl.addOverlay(plotLayer, 'Plot layer');

		if ( plotLayerVisible ||
				(mode == 'new' && overlays['plot']['defaultOn']) ) {
			map.addLayer(plotLayer);
		}
	});

	$('#spinner').css('display', 'none');
}

/**
 * Takes a year and attempts to load the base layer date  into memory in the
 * background to speed switching between months for the current year.
 *
 * @param {string} year Year of layer to seed cache for
 */
function seedLayerCache(year) {
	var months = dates[year].slice(1),
		url;
	for ( i = 0; i < months.length; i++ ) {
		month = months[i] < 10 ? '0' + months[i] : months[i];
		if ( polygonType != 'hex' ) {
			url = 'json/' + year + '_' + month + '-' + polygonType +
				'.' + jsonType;
		} else {
			url = 'json/' + year + '_' + month + '-low.' + jsonType;
		}
		getLayerData(url, function(){ return false; });
	}
}

/**
 * Creates a popup with information about a polygon.
 *
 * @param {object} props Properties for a polygon
 * @returns {string} Textual information for the popup
 */
function makePopup(props) {
	var popup = '<h3 class="league-gothic">Internet Measurements in this Census Block, in '+ $('#sliderMonth').slider('value') +'/'+ $('#selectYear').val() + ' :</h3>'+
		' <p><strong>Download ('+ Math.round(props.download_count * 10) / 10 +' samples)</strong><br />'+
		' Median: ' + Math.round(props.download_median * 10) / 10 + ' Mbps <br />' +
		' Max: ' + props.download_max + ' Mbps<br /><br />' +
		' <strong>Upload ('+ Math.round(props.upload_count * 10) / 10 + ' samples)</strong><br />' +
		' Median: ' + Math.round(props.upload_median * 10) / 10 + ' Mbps <br/>' +
		' Max: ' + props.upload_max + ' Mbps<br /><br />' +
		'<strong>Average Round Trip Time:</strong> ' + Math.round(props.rtt_avg) + ' ms <br/></p>';
	return popup;
}
function makeBlankPopup() {
        var popup = "<h3 class='league-gothic'>This area doesn't have enough data yet!</h3><p>Help make our map more accurate by <a id='testSpeedEmptyPrompt' href='#' onClick='javascript:showTestingPanel()'>running your test</a> from an address in this area</a>!</p>";
	return popup;
}
/**
 * Run on page load to fetch and cache the geo file for a layer
 *
 * @param {string} layer The layer to fetch and cache
 */
function setupLayer(layer) {
	$.get(geoLayers[layer]['polygonFile'], function(resp) {
		var geojson = {
			'type': 'FeatureCollection',
			'features': omnivore.topojson.parse(resp)
		};

		geoLayers[layer]['cache'] = geojson;
		setPolygonLayer(layer, currentYear, currentMonth, 'download_median', 'new', 'low');

		if ( seedCache ) {
			seedLayerCache(currentYear);
		}
	}, 'json');
}

function closeAllTheThings() {
	$('#sidebar').removeClass('extended');
	$('#icons img').removeClass('selected');
	$('#ndt, #ndt-results, #about-ndt').hide();
	$('#ndt, #ndt-results, #extra-data, #about-ndt').hide();
}



function showHideControls() {
	$('.leaflet-bottom.leaflet-left, #sidebar, #approx-loc').toggle();
	if ($('#header').hasClass('initial')) {
		$('.leaflet-bottom.leaflet-right').hide();
	} else if ($(document).width() > 700) {
		$('#layers-box, .leaflet-bottom.leaflet-right').show();
		$('.leaflet-top.leaflet-left').show();
	}
}

function showTestingPanel() {
	// are there results yet?
	var results = document.getElementById('s2cRate');
	var resultsReceived = results.textContent;
	if ($('#test-icon').hasClass('selected')) {
		closeAllTheThings();
	}
	else {
		$('#icons img').removeClass('selected');
		$('#test-icon').addClass('selected');
		$('#sidebar').addClass('extended');
		$('#about-ndt').hide();
		if (resultsReceived !== "?") {
			$('#ndt-div').show();
			$('#ndt-results').show();
			$('#extra-data').show();
		}
		else {
			$('#ndt').show();
		}
	}

	$('#mobile-container').hide();
	if ($(document).width() < 700) {
		$('.metricControls, .sliderElements, .leaflet-control-layers').hide();
	}

}

/* New functions */
function runTest() {
	$('#ndt-div').removeClass('hidden');
	$('#ndt-div').addClass('visible');
	$('#extra-data').removeClass('visible');
	$('#extra-data').addClass('hidden');
	$('#approx-loc').removeClass('hidden');
	$('#approx-loc').addClass('visible');
	$('#ndt-results').removeClass('hidden');
	$('#ndt-results').addClass('visible');
	$('#intro').addClass('hidden');
	$('#icons').addClass('hidden');
	$('#header').removeClass('initial');
	$('#header').addClass('hidden');
	window.scrollTo(0, 0);
}
function showMap() {
	$('#icons img').removeClass('selected');
	$('#header').removeClass('initial');
	$('#welcome-container, #header, #intro, #sidebar, #approx-loc, #ndt-div, #ndt-results, #extra-data, #about-ndt, #thankyou').addClass('hidden');
	$('#mapview-icons, #desktop-legend, .info.legend.leaflet-control, .info.controls.leaflet-control, .leaflet-top.leaflet-left, .leaflet-top.leaflet-right, .leaflet-bottom.leaflet-left').removeClass('hidden');
	$('#mapview-icons, #desktop-legend, .info.legend.leaflet-control,  .info.controls.leaflet-control, .leaflet-top.leaflet-left, .leaflet-top.leaflet-right, .leaflet-bottom.leaflet-left').addClass('visible');
	$('#mobile-container').addClass('hidden');
	if ($(document).width() < 700) {
		$('.leaflet-control-layers').addClass('hidden');
	}
	$('#layers-box').show();
	$('.leaflet-top.leaflet-left, .leaflet-top.leaflet-right').show();
	// for #114
	getCurrentValues();

}
function showSocialShare() {
	$('#socialshare').removeClass('hidden');
	$('#socialshare').addClass('visible');
}

$( window ).resize(function() {
	if ($('#header').hasClass('initial')) {
		return;
	}
	else if (($(document).width() > 501)) {
		$('.metricControls, .sliderElements, .leaflet-top.leaflet-left').show();
	}
	else if (($(document).width() < 500)) {
		$('.metricControls, .sliderElements, .leaflet-top.leaflet-left').hide();
	}

});

$(function() {
/* Sets initial status on load for various divs */
	$('#testSpeed, #approx-loc, #ndt-div, #ndt-results, #desktop-legend, .info.legend.leaflet-control, .leaflet-bottom.leaflet-left, .info.controls.leaflet-control, #mapview-icons, #socialshare, .leaflet-top.leaflet-left, .leaflet-top.leaflet-right, .leaflet-control-layers').addClass('hidden');
	//$('.leaflet-top.leaflet-right').attr('id','layers-box');
	$('#header').addClass('initial');

/* mobile bits */
	var mobileContainer = '<div id="mobile-container"></div>';
	$('#map').append(mobileContainer);
	var mobileMenuExtra = '<div id="mobile-menu">&equiv;</div>';
	$('.info.controls.leaflet-control').append(mobileMenuExtra);
/*mobile bits */

/* copying the mapbox legend into the mobile container to override placement for mobile devices */
	var attribution = $('div.leaflet-control-attribution.leaflet-control');
	$('div.info.legend.leaflet-control').append(attribution);
	$('div.info.legend.leaflet-control').clone().appendTo('#mobile-container');
	$('div.info.legend.leaflet-control').first().attr('id', 'desktop-legend');
/* copying the mapbox legend into the mobile container */

	/* reset the display to initial desired state
	closeAllTheThings();*/

	$('#mobile-menu').click(function() {
		closeAllTheThings();
		$('#mobile-container, .sliderElements, .metricControls, #desktop-legend, .leaflet-control-layers').toggle();
	});
/*
	$('#exploreMap').click(function() {
		showHideControls();
		$('#header').addClass('hidden');
		$('#layers-box').show();
		$('.leaflet-top.leaflet-left, .leaflet-top.leaflet-right').show();
		$('#testSpeed, #exploreMap').toggle();
	});
	$('#testSpeed').click(function() {
		showHideControls();
		showTestingPanel();
		$('#header').addClass('hidden');
		$('#layers-box').show();
		$('.leaflet-top.leaflet-left').show();
		$('#testSpeed, #exploreMap').toggle();
	});
    $('#testSpeedEmptyPrompt').click(function() {
    	$('#header').removeClass('initial');
    	showHideControls();
    	showTestingPanel();
    	$('#testSpeed, #exploreMap').toggle();
 	 });
*/
	$('#isp_user, #connection_type, #cost_of_service, #data_acknowledgement').change(function() {
		var formState = validateExtraDataForm();
		$('#take-test').toggle(formState);
	});
});

// If set to 'hex' then GeoJSON files are assumed to be named like
// 'YYYY_MM-<resolution>.json', where 3 files exist for each of resolutions
// 'low', 'medium', 'high'.  If anything other than 'hex', then this value is
// the MMMM_YY- suffix to look for. For example:
// If set to 'city_council_districts', then the system will look for
// GeoJSON files like 'MMMM_YY-city_council_districts.geojson'.

// polygonType is a variable name defining your aggregation regions. 
// Change the name to reflect the aggregated regions you are using if needed.
var polygonType = 'census_block_groups';

// Either 'topojson' or 'geojson'.  The Node.js script creates both TopoJSON and
// GeoJSON files.  TopoJSON files are significantly smaller in size, but need to
// be converted to GeoJSON by the browser.  There may be some balance between
// loading a smaller file across the network and the processing time on the
// client-side to convert the TopJSON to GeoJSON.  I would conjecture that
// the network is the most limiting factor and that generally TopoJSON will be
// the right choice.  TODO: prove this theory.
var jsonType = "topojson";


// The minimum number of data points in any given polygon for a it to be
// considered statistically relevant.  These cells will either not be displayed
// or will be displayed with a different styling.
var minDataPoints = 5;

// Defines how each overlay is treated on load.  If an overlay is enabled, then
// there will be a checkbox for it in the layers control. 'defaultOn' determines
// whether it will be displayed by default. NOTE: If only a single overlay is
// enabled, then no checkbox will be displayed, since it doesn't make much sense
// to disable the only meaningful layer that exists.
var overlays = {
	'polygon': {
		'enabled': true,
		'defaultOn': true
	},
	'plot': {
		'enabled': false,
		'defaultOn': false
	}
};

// Defines the layers that are going to be added to the map.
var geoLayers = {
	'census_block_groups': {
		'name': 'Census block groups',
		'polygonFile': '/seattle_census10_blockgroups.topojson',
		'dataUrl': '/stats/q/by_census_block?format=json&stats=AverageRTT,DownloadCount,MedianDownload,AverageDownload,UploadCount,MedianUpload,AverageUpload,DownloadMax,UploadMax&b.spatial_join=key&b.time_slices=month&f.time_slices=',
		'dbKey': 'geoid10',
		'geoKey': 'GEOID10',
		'cache': null,
		'layer': null
	},
};

// Which of the geoLayers should be the one added to the map by default
var defaultLayer = 'census_block_groups';

// If set to true, then prefetch the GeoJSON files into a local cache.  WARNING:
// You may not want to enable if you expect mobile, low bandwidth, or otherwise
// bandwidth restricted users, as this can pull in many megabytes of data.
var seedCache = false;

// The inteval (in milliseconds) to use when animating the map.
var animateInterval = 1500;

// Center and zoom level of map.  center may be pulled in via js/center.js, but
// if not then just set it to the center of the USA.
if ( typeof center == 'undefined' ) {
	var center = [38.8961302513129,-99.04025268554688]; //USA
}
var zoom = 11;

// These are the labels that will be used for the month slider in the control
// box in the lower left corner.
var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct',
	'Nov','Dec'];

// An object which will hold cached GeoJSON files so that we don't have to fetch
// them from the server more than once.  This could potentially be problematic
// if there are many files and they are large.
var geoJsonCache = {};
var geometryCache = null;

// The oldest year and month for which we have data.
var startYear = 2014;
var startMonth = 1;

// Get current year/month into variables
var currentYear = new Date().getFullYear();
var currentMonth = new Date().getMonth() + 1;
// Zero pad the front of the month
currentMonth = currentMonth < 10 ? '0' + currentMonth : currentMonth;

// Be sure that we actually have data for the current month.  If not, then fall
// back to the previous month.
var start = Date.UTC(currentYear, currentMonth - 1, 1) / 1000;
var end = Math.floor(Date.now() / 1000);
var dataUrl = geoLayers[defaultLayer]['dataUrl'] + start + ',' + end;
$.ajax({
	url: dataUrl,
	dataType: 'json',
	async: false,
	success: function(resp) {
		if ( ! resp.features.length ) {
			if ( currentMonth == '01' ) {
				currentMonth = 12;
				currentYear = currentYear - 1;
			} else {
				currentMonth = currentMonth - 1;
				currentMonth = currentMonth < 10 ?
					'0' + currentMonth : currentMonth;
			}
			console.log("No data for current year/month, using last" +
				" month instead.");
		}
	}
});

// An object with the years and months we have data for.  This will be used to
// auto-generate various form controls.
var dates = {};
var thisYear = startYear;
while (thisYear <= currentYear) {
	if (thisYear == currentYear) {
		var months = [];
		for (i = 1; i <= currentMonth; i++) { months.push(i) };
		dates[thisYear] = months
	} else {
		dates[thisYear] = ['1','2','3','4','5','6','7','8','9','10','11','12'];
	}
	thisYear++;
}

// Create the map
var map = L.map('map', {zoomControl: false}).setView(center, zoom);
map.scrollWheelZoom.disable();
var control = L.control.zoom({position: 'topright'});
map.addControl(control);

// Use Open Street Maps as a base tile layer
// var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>' +
//		'contributors'
// });

// Use Mapbox as a base tile layer
// var mapboxLayer = L.tileLayer(
//		'https://{s}.tiles.mapbox.com/v3/newamerica.lcl1jan5/{z}/{x}/{y}.png', {
//	attribution: '&copy; <a href="http://mapbox.com/">Mapbox</a>'
// });
 
// Use Mapbox as a base tile layer
var mapboxLayer = L.tileLayer(
		'https://{s}.tiles.mapbox.com/v3/newamerica.lcl1jan5/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://mapbox.com/">Mapbox</a>'
});

// Set the default base tile layer. 
// If using Open Street Maps: map.addLayer(osmLayer);
// If using Mapbox: map.addLayer(mapboxLayer);
map.addLayer(mapboxLayer);

// Add other base tile layer providers as needed
var baseLayers = {
	 'Mapbox': mapboxLayer
};

var layerCtrl = L.control.layers(baseLayers, null, { collapsed: false, position: 'bottomleft' });
addControls();
layerCtrl.addTo(map);
addLegend();

for (var geoLayer in geoLayers) {
	setupLayer(geoLayer);
}
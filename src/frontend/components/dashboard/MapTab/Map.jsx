/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { center, pointsWithinPolygon } from '@turf/turf';

import './MapTab.css';

import mapboxStyle from './mapboxStyle';
import MapTooltip from './MapTooltip.jsx';

// eslint-disable-next-line react/prop-types
export default function Map({
  currentFeature: currentFeatureProp,
  currentGeography,
  currentLayer,
  currentTestAspect,
  fillDomain,
  fillRange,
  mapboxKey,
  radiusDomain,
  radiusRange,
  setCurrentFeature,
  setCurrentFeatureSubmissions,
  submissions,
}) {
  // const [boundingBox, setBoundingBox] = useState([
  //   [-167, 16], // Southwest coordinates
  //   [-46, 72], // Northeast coordinates
  // ]);
  const [geojson, setGeojson] = useState(null);
  const [map, setMap] = useState(null);
  const currentFeature = useRef(currentFeatureProp);
  const [hoveredSubmission, setHoveredSubmission] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState([null, null]);
  const mapContainer = useRef(null);

  const initializeMap = ({ setMap, mapContainer }) => {
    mapboxgl.accessToken = mapboxKey;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxStyle,
    });

    map.on('load', () => {
      if (geojson.features.length > 0) {
        const centerPoint = center(geojson);
        const centerCoordinates = centerPoint.geometry.coordinates;
        map.setCenter(centerCoordinates);
        map.setZoom(4);
      }

      setMap(map);
      map.resize();

      map.addSource('submissions', {
        type: 'geojson',
        data: geojson,
      });

      map.addLayer({
        id: 'submissions',
        type: 'circle',
        source: 'submissions',
        paint: {
          'circle-radius': 4,
          'circle-color': 'rgb(94, 66, 166)',
          'circle-opacity': 0.6,
          'circle-stroke-color': 'rgb(47, 35, 77)',
          'circle-stroke-width': 1,
        },
      });

      map.addLayer({
        id: 'current-submission',
        type: 'circle',
        source: 'submissions',
        paint: {
          'circle-radius': 4,
          'circle-color': 'rgb(94, 66, 166)',
          'circle-opacity': 1,
          'circle-stroke-color': 'rgb(47, 35, 77)',
          'circle-stroke-width': 1,
        },
        filter: ['==', ['get', 'id'], 'nosuchsubmission'],
      });
    });
  };

  const handleMapClick = useCallback(
    e => {
      if (!map) return;
      const { x, y } = e.point;
      const features = map.queryRenderedFeatures([x, y], {
        layers: [`${currentGeography}-data`],
      });
      const clickedFeature = features[0];

      if (!clickedFeature) return;

      console.log('clicked feature props', clickedFeature.properties);

      const { fips: clickedFeatureFips } = clickedFeature.properties;
      const currentFeatureFips =
        currentFeature && currentFeature.properties
          ? currentFeature.properties.fips
          : null;

      if (clickedFeatureFips === currentFeatureFips) {
        setCurrentFeature(null);
        map.setFilter(`${currentGeography}-clicked`, null);
        return;
      }

      const clickedFeatureJSON = clickedFeature.toJSON();

      // it looks like some features don't have coordinates
      // not sure what that's about but it shouldn't blow
      // up the map
      const geojsonWithCoordinates = {
        type: 'FeatureCollection',
        features: geojson.features.filter(
          d => !d.geometry.coordinates.includes(null),
        ),
      };

      const submissionsWithin = pointsWithinPolygon(
        geojsonWithCoordinates,
        clickedFeatureJSON,
      );

      console.log({ clickedFeatureFips });
      map.setFilter(`${currentGeography}-clicked`, [
        '==',
        ['get', 'fips'],
        clickedFeatureFips,
      ]);

      setCurrentFeature(clickedFeatureJSON);
      setCurrentFeatureSubmissions(submissionsWithin);
    },
    [map, currentGeography],
  );

  // convert submission to geojson
  useEffect(
    function convertSubmissionsDataToGeoJSON() {
      if (!submissions) return;

      // eslint-disable-next-line react/prop-types
      const allPoints = submissions.map(point => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.longitude, point.latitude],
        },
        properties: {
          id: point.id,
          isp_user: point.survey_service_type,
          other_isp: point.survey_service_type_other,
          cost_of_service: point.survey_current_cost,
          advertised_download: point.survey_subscribe_download,
          advertised_upload: point.survey_subscribe_upload,
          actual_download: point.actual_download,
          actual_upload: point.actual_upload,
          min_rtt: point.min_rtt,
        },
      }));
      const featureCollection = {
        type: 'FeatureCollection',
        features: allPoints,
      };

      setGeojson(featureCollection);
    },
    [submissions],
  );

  // load up the map, should just happen once in the beginning
  useEffect(() => {
    if (geojson && !map) {
      initializeMap({
        setMap,
        mapContainer,
      });
    }

    // attach a global variable to make it easier to
    // access the map when debugging
    window.PIECEWISE_MAP = map;
  }, [geojson, map]);

  // once the map is set up and loaded, set up the pointer events handlers
  useEffect(() => {
    if (!map) return;

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'points', function() {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'points', function() {
      map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'submissions', function(e) {
      const { features, point } = e;
      const { properties } = features[0];
      const { id } = properties;

      setHoveredSubmission(properties);
      setTooltipPosition([point.x, point.y]);
      map.setFilter('current-submission', ['==', ['get', 'id'], id]);
    });

    map.on('mouseleave', 'submissions', function() {
      setHoveredSubmission(null);
      setTooltipPosition([null, null]);
      map.setFilter('current-submission', [
        '==',
        ['get', 'id'],
        'nosuchsubmission',
      ]);
    });
  }, [map]);

  // add and update the click handler for the map
  useEffect(
    function updateMapClickHandler() {
      console.log('updating map click handler');
      if (!map) return;

      map.on('click', handleMapClick);
      return () => map.off('click', handleMapClick);
    },
    [map, currentGeography],
  );

  // change the outlines between counties and census tracts
  useEffect(
    function updateCurrentGeographyBoundaries() {
      if (!map) return;

      ['counties', 'tracts'].forEach(layerId => {
        const clickedLayer = `${layerId}-clicked`;
        const dataLayer = `${layerId}-data`;
        const strokeLayer = `${layerId}-stroke`;

        if (layerId !== currentGeography) {
          map.setFilter(clickedLayer, ['==', ['get', 'name'], 'nosuchthing']);
          map.setFilter(dataLayer, ['==', ['get', 'name'], 'nosuchthing']);
          map.setFilter(strokeLayer, ['==', ['get', 'name'], 'nosuchthing']);
        } else {
          map.setFilter(dataLayer, null);
          map.setFilter(strokeLayer, null);
        }
      });
    },
    [map, currentGeography],
  );

  // update color of geographic units depending on which info is selected
  useEffect(() => {
    if (!map) return;

    const layer = `${currentGeography}-data`;

    if (!currentLayer) {
      map.setPaintProperty(layer, 'fill-color', '#ECE1CB');
      return;
    }

    map.setPaintProperty(layer, 'fill-opacity', 1);

    map.setPaintProperty(layer, 'fill-color', [
      'case',
      ['has', currentLayer],
      [
        'interpolate',
        ['linear'],
        ['get', currentLayer],
        fillDomain[0],
        fillRange[0],
        fillDomain[1],
        fillRange[1],
      ],
      'white',
    ]);
  }, [currentGeography, currentLayer, fillDomain, fillRange]);

  // update submission circles
  useEffect(() => {
    if (!map) return;

    if (
      [
        'actual_download',
        'actual_upload',
        'advertised_download',
        'advertised_upload',
      ].includes(currentTestAspect)
    ) {
      map.setPaintProperty('submissions', 'circle-radius', [
        'interpolate',
        ['linear'],
        ['get', currentTestAspect],
        radiusDomain[0],
        radiusRange[0],
        radiusDomain[1],
        radiusRange[1] / 2, // this division by two is just because it seems like mapbox doesn't use pixels
      ]);
      // update the layer used for styling the hover circle too
      map.setPaintProperty('current-submission', 'circle-radius', [
        'interpolate',
        ['linear'],
        ['get', currentTestAspect],
        radiusDomain[0],
        radiusRange[0],
        radiusDomain[1],
        radiusRange[1] / 2, // this division by two is just because it seems like mapbox doesn't use pixels
      ]);
    } else {
      map.setPaintProperty('submissions', 'circle-radius', 4);
      map.setPaintProperty('current-submission', 'circle-radius', 4);
    }
  }, [currentTestAspect, radiusDomain, radiusRange]);

  return (
    <div style={{ position: 'relative' }}>
      <div id="map" ref={el => (mapContainer.current = el)} />
      {hoveredSubmission && (
        <MapTooltip
          submission={hoveredSubmission}
          left={tooltipPosition[0] + 20}
          top={tooltipPosition[1] + 10}
          width={300}
        />
      )}
    </div>
  );
}

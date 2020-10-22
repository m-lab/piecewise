/* TODO

* need to set up the scales so they're passed around so that the mapbox style will be reflected on hover
* add the submissions from the selected area to the <InfoPanel />

*/

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import 'mapbox-gl/dist/mapbox-gl.css';

// Bootstrap imports
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';

import InfoPanel from './InfoPanel.jsx';
import Map from './Map.jsx';
import MapControls from './MapControls.jsx';

// custom styles
import './MapTab.css';

// import NC_DATA from './data.json';

export default function MapTab({ mapboxKey }) {
  const [currentFeature, setCurrentFeature] = useState(null);
  const [currentFeatureSubmissions, setCurrentFeatureSubmissions] = useState(
    [],
  );
  const [currentGeography, setCurrentGeography] = useState('counties');
  const [currentLayer, setCurrentLayer] = useState(null);
  const [currentResultId, setCurrentResultId] = useState(null);
  const [currentSubmissionAspect, setCurrentSubmissionAspect] = useState(null);
  const [submissions, setSubmissions] = useState(null);

  const [fillDomain, setFillDomain] = useState([0, 1]);
  const [fillRange, setFillRange] = useState(['#EEDABB', '#A13832']);

  // eslint-disable-next-line no-unused-vars
  const [radiusDomain, setRadiusDomain] = useState([0, 50]);
  const [radiusRange, setRadiusRange] = useState([0.2, 20]);

  // fetcher to get data from api
  const getjson = () => {
    // return Promise.resolve(NC_DATA);
    return fetch('/api/v1/submissions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async response => {
      const json = await response.json();
      return json.data;
      // return NC_DATA;
    });
  };

  // actually get the data
  useEffect(() => {
    if (!submissions) {
      getjson()
        .then(data => {
          setSubmissions(data);
          return;
        })
        .catch(error => {
          throw Error(error.statusText);
        });
    }
  }, [submissions]);

  // update fillScale when layer changes
  useEffect(() => {
    if (!currentLayer) return;

    if (currentLayer.includes('_pct')) {
      setFillDomain([0, 1]);
    } else if (currentLayer === 'median_income') {
      setFillDomain([0, 100000]);
    } else if (
      currentLayer.includes('max_ad') ||
      currentLayer.includes('median_dl') ||
      currentLayer.includes('median_ul')
    ) {
      setFillDomain([0, 1000]);
    } else if (currentLayer.includes('provider_count')) {
      setFillDomain([0, 50]);
    }
  }, [currentLayer]);

  const handleResultHover = rowId => setCurrentResultId(rowId);

  const handleGeographyChange = e => {
    const { value } = e.target;

    if (value === '') setCurrentGeography(null);
    else setCurrentGeography(value);
  };

  const handleDataLayerChange = e => {
    const { value } = e.target;

    if (value === '') setCurrentLayer(null);
    else setCurrentLayer(value);
  };

  const handleSubmissionAspectChange = e => {
    const { value } = e.target;

    if (value === '') setCurrentSubmissionAspect(null);
    else setCurrentSubmissionAspect(value);
  };

  const handleFillScaleInvertClick = () => {
    setFillRange([fillRange[1], fillRange[0]]);
  };
  const handleRadiusScaleInvertClick = () => {
    setRadiusRange([radiusRange[1], radiusRange[0]]);
  };

  return (
    <div id="map-and-survey-results-container" className="mt-4 mb-4">
      <Container>
        <Alert variant="secondary">
          <p className="mb-0">
            <em>
              Compare the survey results to other datasets geographically.
            </em>
          </p>
        </Alert>
      </Container>
      <div id="map-container">
        <Container>
          <MapControls
            currentGeography={currentGeography}
            currentLayer={currentLayer}
            currentSubmissionAspect={currentSubmissionAspect}
            fillDomain={fillDomain}
            fillRange={fillRange}
            radiusDomain={radiusDomain}
            radiusRange={radiusRange}
            onDataLayerChange={handleDataLayerChange}
            onGeographyChange={handleGeographyChange}
            onSubmissionAspectChange={handleSubmissionAspectChange}
            onFillScaleInvertClick={handleFillScaleInvertClick}
            onRadiusScaleInvertClick={handleRadiusScaleInvertClick}
          />
        </Container>
        <Map
          currentFeature={currentFeature}
          currentGeography={currentGeography}
          currentLayer={currentLayer}
          currentResultId={currentResultId}
          currentTestAspect={currentSubmissionAspect}
          fillDomain={fillDomain}
          fillRange={fillRange}
          mapboxKey={mapboxKey}
          radiusDomain={radiusDomain}
          radiusRange={radiusRange}
          onSubmissionHover={handleResultHover}
          setCurrentFeature={setCurrentFeature}
          setCurrentFeatureSubmissions={setCurrentFeatureSubmissions}
          submissions={submissions}
        />
        <div
          id="info-panel-container"
          className={`${currentFeature ? 'open' : 'closed'}`}
        >
          <InfoPanel
            currentFeature={currentFeature}
            currentFeatureSubmissions={currentFeatureSubmissions}
            currentGeography={currentGeography}
          />
        </div>
      </div>
    </div>
  );
}
MapTab.propTypes = {
  mapboxKey: PropTypes.string.isRequired,
};

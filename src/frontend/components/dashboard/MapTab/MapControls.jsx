/* eslint-disable react/prop-types */
import { format, mean, scaleLinear } from 'd3';
import React, { useEffect, useState } from 'react';

import Form from 'react-bootstrap/Form';

import MapSelectControl from './MapSelectControl';
import './MapTab.css';

const formatPercentString = '.0%';

const MapControls = ({
  currentGeography,
  currentLayer,
  currentSubmissionAspect,
  fillDomain,
  fillRange,
  radiusDomain,
  radiusRange,
  onDataLayerChange,
  onGeographyChange,
  onSubmissionAspectChange,
  onFillScaleInvertClick,
  onRadiusScaleInvertClick,
}) => {
  const [fillFormatter, setFillFormatter] = useState(formatPercentString);
  const fillScale = scaleLinear()
    .domain(fillDomain)
    .range(fillRange);
  const radiusScale = scaleLinear()
    .domain(radiusDomain)
    .range(radiusRange);
  const fillDomainMean = mean(fillDomain);
  const radiusDomainMean = mean(radiusDomain);

  const fillLegendSteps = [
    fillDomain[0],
    mean([fillDomain[0], fillDomainMean]),
    fillDomainMean,
    mean([fillDomainMean, fillDomain[1]]),
    fillDomain[1],
  ];

  const radiusLegendSteps = [
    radiusDomain[0],
    mean([radiusDomain[0], radiusDomainMean]),
    radiusDomainMean,
    mean([radiusDomainMean, radiusDomain[1]]),
    radiusDomain[1],
  ];

  useEffect(() => {
    if (currentLayer === 'median_income') {
      setFillFormatter('~s');
    } else if (
      currentLayer &&
      (currentLayer.includes('max_ad') ||
        currentLayer.includes('provider_count') ||
        currentLayer.includes('median_dl') ||
        currentLayer.includes('median_ul'))
    ) {
      setFillFormatter(',');
    } else {
      setFillFormatter(formatPercentString);
    }
  }, [currentLayer]);

  return (
    <div className="map-controls">
      <div>
        <MapSelectControl
          id="map-boundary-control"
          label="Which boundaries do you want to see?"
          onChange={onGeographyChange}
          options={[
            { label: 'County boundaries', value: 'counties' },
            { label: 'Census tracts', value: 'tracts' },
          ]}
          value={currentGeography}
        />
      </div>
      <div>
        <MapSelectControl
          id="map-data-layer-control"
          label="Which data layer do you want to look at?"
          onChange={onDataLayerChange}
          options={[
            {
              group: 'Demographics',
              label: 'Percent American Indian',
              value: 'amerindian_pct',
            },
            {
              group: 'Demographics',
              label: 'Percent Asian',
              value: 'asian_pct',
            },
            {
              group: 'Demographics',
              label: 'Percent Black',
              value: 'black_pct',
            },
            {
              group: 'Demographics',
              label: 'Percent Hispanic',
              value: 'hispanic_pct',
            },
            {
              group: 'Demographics',
              label: 'Percent White',
              value: 'white_pct',
            },
            {
              group: 'Demographics',
              label: 'Median income',
              value: 'median_income',
            },
            {
              group: 'Internet speed',
              label: 'Number of internet providers (FCC)',
              value: 'provider_count',
            },
            {
              group: 'Internet speed',
              label: 'Median advertised download speed (FCC)',
              value: 'mean_max_ad_down',
            },
            {
              group: 'Internet speed',
              label: 'Median advertised max upload speed (FCC)',
              value: 'mean_max_ad_up',
            },
            {
              group: 'Internet speed',
              label: 'Measured median download speed (MLab)',
              value: '2020_july_dec_median_dl',
            },
            {
              group: 'Internet speed',
              label: 'Measured median upload speed (MLab)',
              value: '2020_july_dec_median_ul',
            },
            {
              group: 'Internet speed',
              label: 'Percent of tests sufficient for audio calls (MLab)',
              value: '2020_july_dec_percent_over_audio_threshold',
            },
            {
              group: 'Internet speed',
              label: 'Percent of tests sufficient for video calls (MLab)',
              value: '2020_july_dec_percent_over_video_threshold',
            },
          ]}
          value={currentLayer}
        />
        {currentLayer && (
          <React.Fragment>
            <ul className="legend-rects">
              {fillLegendSteps.map((d, i) => (
                <li key={d}>
                  <div
                    className="legend-rect"
                    style={{ backgroundColor: fillScale(d) }}
                  >
                    <span className="legend-rect-label">
                      {currentLayer === 'median_income' && i === 0 ? '$' : ''}
                      {format(fillFormatter)(d)}
                      {currentLayer &&
                      (currentLayer.includes('max_ad') ||
                        currentLayer.includes('median_dl') ||
                        currentLayer.includes('median_ul')) &&
                      i === fillLegendSteps.length - 1
                        ? 'mbps'
                        : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <Form.Check
              label="Invert scale"
              name="legend-rect-invert-control"
              id="legend-rect-invert-control"
              onClick={onFillScaleInvertClick}
            />
          </React.Fragment>
        )}
      </div>
      <div>
        <MapSelectControl
          id="map-submission-aspect-control"
          label="Which aspect of the survey results do you want to look at?"
          onChange={onSubmissionAspectChange}
          options={[
            {
              label: 'NDT download',
              value: 'actual_download',
            },
            {
              label: 'NDT upload',
              value: 'actual_upload',
            },
            {
              label: 'Advertised download',
              value: 'survey_subscribe_download',
            },
            {
              label: 'Advertised download',
              value: 'survey_subscribe_upload',
            },
          ]}
          value={currentSubmissionAspect}
        />

        {currentSubmissionAspect && (
          <React.Fragment>
            <ul className="legend-circles">
              {radiusLegendSteps.map(d => (
                <li key={d}>
                  <div
                    className="legend-circle"
                    style={{
                      borderRadius: radiusScale(d),
                      height: radiusScale(d),
                      width: radiusScale(d),
                    }}
                  />
                  <span className="legend-circle-label">{d}</span>
                </li>
              ))}
            </ul>
            <Form.Check
              label="Invert scale"
              name="legend-circle-invert-control"
              id="legend-circle-invert-control"
              onClick={onRadiusScaleInvertClick}
            />
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default MapControls;

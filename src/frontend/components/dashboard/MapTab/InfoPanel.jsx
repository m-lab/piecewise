/* eslint-disable react/prop-types */
import { format } from 'd3';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';

import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import acs from './acs-5-yr.json';
// import fcc477 from './fcc-477.json';

import './MapTab.css';

const formatNumber = format(',');
const formatPercent = format('.0%');
const formatDollar = amount => {
  if (isNaN(amount)) return '--';
  return `$${formatNumber(amount)}`;
};
const formatMbps = amount => {
  if (isNaN(amount)) return '--';
  return `${format(',.2')(amount)} mbps`;
};

const usStateFips = {
  '10': 'Delaware',
  '11': 'DC',
  '12': 'Florida',
  '13': 'Georgia',
  '15': 'Hawaii',
  '16': 'Idaho',
  '17': 'Illinois',
  '18': 'Indiana',
  '19': 'Iowa',
  '20': 'Kansas',
  '21': 'Kentucky',
  '22': 'Louisiana',
  '23': 'Maine',
  '24': 'Maryland',
  '25': 'Massachusets',
  '26': 'Michigan',
  '27': 'Minnesota',
  '28': 'Mississippi',
  '29': 'Missouri',
  '30': 'Montana',
  '31': 'Nebraska',
  '32': 'Nevada',
  '33': 'New Hampshire',
  '34': 'New Jersey',
  '35': 'New Mexico',
  '36': 'New York',
  '37': 'North Carolina',
  '38': 'North Dakota',
  '39': 'Ohio',
  '40': 'Oklahoma',
  '41': 'Oregon',
  '42': 'Pennsylvania',
  '44': 'Rhode Island',
  '45': 'South Carolina',
  '46': 'South Dakota',
  '47': 'Tennessee',
  '48': 'Texas',
  '49': 'Utah',
  '50': 'Vermont',
  '51': 'Virginia',
  '53': 'Washington',
  '54': 'West Virginia',
  '55': 'Wisconsin',
  '56': 'Wyoming',
  '78': 'Virgin Islands',
  '01': 'Alabama',
  '02': 'Alaska',
  '04': 'Arizona',
  '05': 'Arkansas',
  '06': 'California',
  '08': 'Colorado',
  '09': 'Connecticut',
  '72': 'Puerto Rico',
};

export default function InfoPanel({
  currentFeature,
  currentFeatureSubmissions,
}) {
  const [demographics, setDemographics] = useState([]);
  const [featureName, setFeatureName] = useState('Feature name');
  const hasCurrentFeatureSubmissions =
    currentFeatureSubmissions.features &&
    currentFeatureSubmissions.features.length > 0;
  const [isOpen, setIsOpen] = useState(false);
  const [isTable, setIsTable] = useState(false);
  const [percentHousesWithBroadband, setPercentHousesWithBroadband] = useState(
    '--%',
  );
  const [
    percentHousesWithoutInternet,
    setPercentHousesWithoutInternet,
  ] = useState('--%');
  const [providerCount, setProviderCount] = useState(null);
  const [meanAdvertisedDown, setMeanAdvertisedDown] = useState('--');
  const [meanAdvertisedUp, setMeanAdvertisedUp] = useState('--');
  const [usStateName, setUSStateName] = useState('');

  useEffect(() => {
    if (!currentFeature) {
      setIsOpen(false);
      return;
    }

    const { properties } = currentFeature;
    const {
      fips,
      name,
      total_pop,
      white_pop,
      black_pop,
      asian_pop,
      hispanic_pop,
      amerindian_pop,
      median_income,
      mean_max_ad_down,
      mean_max_ad_up,
      provider_count,
    } = properties;
    const whitePct = formatPercent(white_pop / total_pop);
    const blackPct = formatPercent(black_pop / total_pop);
    const asianPct = formatPercent(asian_pop / total_pop);
    const hispanicPct = formatPercent(hispanic_pop / total_pop);
    const americanIndianPct = formatPercent(amerindian_pop / total_pop);
    const demographics = `According to the Census, there are approximately <span class="dynamic-value">${formatNumber(
      total_pop,
    )}</span> people live in ${name} County. About <span class="dynamic-value">${whitePct}</span> of them are white, <span class="dynamic-value">${blackPct}</span> are Black, <span class="dynamic-value">${asianPct}</span> are Asian, <span class="dynamic-value">${hispanicPct}</span> are Hispanic, and <span class="dynamic-value">${americanIndianPct}</span> are American Indian. The median income is <span class="dynamic-value">${formatDollar(
      median_income,
    )}</span>.<sup>1</sup>`;

    const stateFips = fips.slice(0, 2);
    const stateName = usStateFips[stateFips];

    const acsMatch = acs.find(d => d.fips === fips);

    setDemographics(demographics);
    setFeatureName(name);
    setUSStateName(stateName);
    if (acsMatch) {
      setPercentHousesWithBroadband(
        `${acsMatch.percent_households_with_broadband}%`,
      );
      setPercentHousesWithoutInternet(
        `${acsMatch.percent_households_without_internet}%`,
      );
    }

    console.log({
      mean_max_ad_down,
      mean_max_ad_up,
      provider_count,
    });

    setIsOpen(true);
    if (mean_max_ad_down)
      setMeanAdvertisedDown(format(',.3s')(mean_max_ad_down));
    if (mean_max_ad_up) setMeanAdvertisedUp(format(',.3s')(mean_max_ad_up));
    if (provider_count) setProviderCount(format(',.0s')(provider_count));
  }, [currentFeature]);

  const geoUnit = usStateName === 'Louisiana' ? 'Parish' : 'County';

  const tabularData = [
    {
      group: 'Census information',
      rows: [
        {
          label: 'Total population',
          data: 'properties.total_pop',
          formatter: formatNumber,
        },
        {
          label: 'Percent American Indian',
          data: 'properties.amerindian_pct',
          formatter: formatPercent,
        },
        {
          label: 'Percent Asian',
          data: 'properties.asian_pct',
          formatter: formatPercent,
        },
        {
          label: 'Percent Black',
          data: 'properties.black_pct',
          formatter: formatPercent,
        },
        {
          label: 'Percent Hispanic',
          data: 'properties.hispanic_pct',
          formatter: formatPercent,
        },
        {
          label: 'Percent white',
          data: 'properties.white_pct',
          formatter: formatPercent,
        },
        {
          label: 'Median income',
          data: 'properties.median_income',
          formatter: formatDollar,
        },
        {
          label: 'Percent of households with broadband',
          data: 'properties.households_with_broadband_pct',
          formatter: formatPercent,
        },
        {
          label: 'Percent of households without internet',
          data: 'properties.households_without_internet_pct',
          formatter: formatPercent,
        },
      ],
    },
    {
      group: 'FCC 477 information',
      rows: [
        {
          label: 'Number of internet providers',
          data: 'properties.provider_count',
          formatter: formatNumber,
        },
        {
          label: 'Mean advertised download speed',
          data: 'properties.mean_max_ad_down',
          formatter: formatMbps,
        },
        {
          label: 'Mean advertised upload speed',
          data: 'properties.mean_max_ad_up',
          formatter: formatMbps,
        },
      ],
    },
  ];

  return (
    <div className={`info-panel ${isOpen ? 'open' : ''}`}>
      <div className="info-panel-header">
        <h3>
          {featureName} {geoUnit}, {usStateName}
        </h3>
        <Button
          className="info-panel-close-control"
          onClick={() => setIsOpen(false)}
          size="sm"
          variant="primary"
        >
          Close
        </Button>
      </div>
      {isTable ? (
        tabularData.map(({ group, rows }) => (
          <React.Fragment key={group}>
            <h4>{group}</h4>
            <Table bordered responsive striped hover>
              {rows.map(row => {
                const { label, data, formatter } = row;
                const f =
                  formatter ||
                  function(d) {
                    return d;
                  };
                return (
                  <tr key={label}>
                    <th>{label}</th>
                    <td>
                      {currentFeature ? f(get(currentFeature, data)) : '--'}
                    </td>
                  </tr>
                );
              })}
            </Table>
          </React.Fragment>
        ))
      ) : (
        <React.Fragment>
          <p dangerouslySetInnerHTML={{ __html: demographics }} />
          <p>
            It is estimated that{' '}
            <span className="dynamic-value">{percentHousesWithBroadband}</span>{' '}
            of the households have a broadband internet subscription, while{' '}
            <span className="dynamic-value">
              {percentHousesWithoutInternet}
            </span>{' '}
            of the households in the county have no internet subscription.
            <sup>2</sup>
          </p>
          <p>
            According to the FCC, there are{' '}
            <span className="dynamic-value">{providerCount || '--'}</span>{' '}
            internet providers in the county and the median advertised download
            speed is{' '}
            <span className="dynamic-value">{meanAdvertisedDown} mbps</span> and
            the median advertised upload speed is{' '}
            <span className="dynamic-value">{meanAdvertisedUp} mbps</span>.
            <sup>3</sup>
          </p>
          <p>
            The Measurement Lab has collected{' '}
            <span className="dynamic-value">--</span> internet speed tests in
            the county, and the median download speed is{' '}
            <span className="dynamic-value">-- mbps</span> while the median
            upload speed is <span className="dynamic-value">-- mbps</span>.
            About <span className="dynamic-value">-- %</span> of the tests did
            not have sufficient bandwidth for audio calls and{' '}
            <span className="dynamic-value">-- %</span> would not have enabled a
            video call.<sup>4</sup>
          </p>
        </React.Fragment>
      )}
      <Button
        className="info-panel-table-toggle-control"
        onClick={() => setIsTable(!isTable)}
        size="sm"
        variant="outline-secondary"
      >
        Show the data above{isTable ? ' as paragraphs' : ' as tables'}
      </Button>
      <div>
        <h4>Survey results in this area</h4>
        {hasCurrentFeatureSubmissions ? (
          <React.Fragment>
            <Table bordered responsive striped hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Download speed</th>
                  <th>Upload speed</th>
                  <th>Latency</th>
                  <th>ISP</th>
                  <th>Advertised download speed</th>
                  <th>Advertised upload speed</th>
                </tr>
              </thead>
              <tbody>
                {currentFeatureSubmissions.features.map(({ properties }) => (
                  <tr key={properties.id}>
                    <td>{properties.id}</td>
                    <td>date</td>
                    <td>{properties.actual_download}</td>
                    <td>{properties.actual_upload}</td>
                    <td>{properties.min_rtt}</td>
                    <td>{properties.isp_user}</td>
                    <td>{properties.advertised_download}</td>
                    <td>{properties.advertised_upload}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <CSVLink
              data={
                hasCurrentFeatureSubmissions
                  ? currentFeatureSubmissions.features.map(f => f.properties)
                  : ''
              }
              headers={
                hasCurrentFeatureSubmissions
                  ? Object.keys(
                      currentFeatureSubmissions.features[0].properties,
                    )
                  : {}
              }
            >
              Export
            </CSVLink>
          </React.Fragment>
        ) : (
          <p>
            <i>There are no survey results in this area</i>
          </p>
        )}
        <h4>Sources</h4>
        <ol>
          <li>2010 Decennial Census</li>
          <li>2018 5-year American Community Survey</li>
          <li>FCC 477 data published June 2019</li>
          <li>Measurement Lab</li>
        </ol>
      </div>
    </div>
  );
}

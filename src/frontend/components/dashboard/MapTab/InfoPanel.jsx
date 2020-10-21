/* eslint-disable react/prop-types */
import { format } from 'd3';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';

import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import './MapTab.css';

const createFormatterThatHandlesNullValues = formatter => {
  return value => {
    if (!value && value !== 0) return '--';
    if (isNaN(value)) return '--';
    return formatter(value);
  };
};

const formatNumber = createFormatterThatHandlesNullValues(format(','));
const formatPercent = createFormatterThatHandlesNullValues(format('.0%'));
const formatDollar = createFormatterThatHandlesNullValues(
  amount => `$${formatNumber(amount)}`,
);
const formatMbps = createFormatterThatHandlesNullValues(
  amount => `${format(',.2r')(amount)} mbps`,
);

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
  currentGeography,
}) {
  const hasCurrentFeatureSubmissions =
    currentFeatureSubmissions.features &&
    currentFeatureSubmissions.features.length > 0;
  const [isOpen, setIsOpen] = useState(false);
  const [isTable, setIsTable] = useState(false);

  const [americanIndianPct, setAmericanIndianPct] = useState(null);
  const [asianPct, setAsianPct] = useState(null);
  const [blackPct, setBlackPct] = useState(null);
  const [geoUnitSingular, setGeoUnitSingular] = useState(null);
  const [hispanicPct, setHispanicPct] = useState(null);
  const [housesWithBroadbandPct, setHousesWithBroadbandPct] = useState(null);
  const [housesWithoutInternetPct, setHousesWithoutInternetPct] = useState(
    null,
  );
  const [featureName, setFeatureName] = useState(null);
  const [meanAdvertisedDown, setMeanAdvertisedDown] = useState(null);
  const [meanAdvertisedUp, setMeanAdvertisedUp] = useState(null);
  const [medianDownload, setMedianDownload] = useState(null);
  const [medianUpload, setMedianUpload] = useState(null);
  const [medianIncome, setMedianIncome] = useState(null);
  const [overAudioPct, setOverAudioPct] = useState(null);
  const [overVideoPct, setOverVideoPct] = useState(null);
  const [providerCount, setProviderCount] = useState(null);
  const [totalDownSamples, setTotalDownSamples] = useState(null);
  const [totalPop, setTotalPop] = useState(null);
  const [usStateName, setUSStateName] = useState('');
  const [whitePct, setWhitePct] = useState(null);

  useEffect(() => {
    if (!currentFeature || !currentFeature.properties) {
      setIsOpen(false);
      return;
    }

    const {
      fips,
      name,
      amerindian_pct,
      asian_pct,
      black_pct,
      hispanic_pct,
      households_with_broadband_pct,
      households_without_internet_pct,
      total_pop,
      white_pct,
      median_income,
      mean_max_ad_down,
      mean_max_ad_up,
      provider_count,
      ['2020_july_dec_median_dl']: mlab_median_download,
      ['2020_july_dec_median_ul']: mlab_median_upload,
      ['2020_july_dec_percent_over_audio_threshold']: mlab_over_audio_pct,
      ['2020_july_dec_percent_over_video_threshold']: mlab_over_video_pct,
      ['2020_july_dec_total_dl_samples']: mlab_total_dl_samples,
    } = currentFeature.properties;

    const stateFips = fips.slice(0, 2);
    const stateName = usStateFips[stateFips];

    let featureName = '';

    if (stateName === 'Louisiana' && currentGeography === 'counties') {
      featureName = `${name} Parish`;
      setGeoUnitSingular('county');
    } else if (currentGeography === 'counties') {
      featureName = `${name} County`;
      setGeoUnitSingular('county');
    } else if (currentGeography === 'tracts') {
      featureName = `Tract ${fips}`;
      setGeoUnitSingular('tract');
    }

    setAmericanIndianPct(amerindian_pct);
    setAsianPct(asian_pct);
    setBlackPct(black_pct);
    setHispanicPct(hispanic_pct);
    setHousesWithBroadbandPct(households_with_broadband_pct);
    setHousesWithoutInternetPct(households_without_internet_pct);
    setFeatureName(featureName);
    setMedianDownload(mlab_median_download);
    setMedianIncome(median_income);
    setMedianUpload(mlab_median_upload);
    setMeanAdvertisedDown(mean_max_ad_down);
    setMeanAdvertisedUp(mean_max_ad_up);
    setOverAudioPct(mlab_over_audio_pct);
    setOverVideoPct(mlab_over_video_pct);
    setProviderCount(provider_count);
    setTotalDownSamples(mlab_total_dl_samples);
    setTotalPop(total_pop);
    setUSStateName(stateName);
    setWhitePct(white_pct);

    setIsOpen(true);
  }, [currentFeature]);

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
          {featureName}, {usStateName}
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
          <p>
            According to the Census, there are approximately{' '}
            <span className="dynamic-value">{formatNumber(totalPop)}</span>{' '}
            people who live in {featureName}. About{' '}
            <span className="dynamic-value">{formatPercent(whitePct)}</span> of
            them are white,{' '}
            <span className="dynamic-value">{formatPercent(blackPct)}</span> are
            Black,{' '}
            <span className="dynamic-value">{formatPercent(asianPct)}</span> are
            Asian,{' '}
            <span className="dynamic-value">{formatPercent(hispanicPct)}</span>{' '}
            are Hispanic, and{' '}
            <span className="dynamic-value">
              {formatPercent(americanIndianPct)}
            </span>{' '}
            are American Indian. The median income is{' '}
            <span className="dynamic-value">{formatDollar(medianIncome)}</span>.
            <sup>1</sup>
          </p>
          <p>
            It is estimated that{' '}
            <span className="dynamic-value">
              {formatPercent(housesWithBroadbandPct)}
            </span>{' '}
            of the households have a broadband internet subscription, while{' '}
            <span className="dynamic-value">
              {formatPercent(housesWithoutInternetPct)}
            </span>{' '}
            of the households in the county have no internet subscription.
            <sup>2</sup>
          </p>
          <p>
            According to the FCC, there are{' '}
            <span className="dynamic-value">{formatNumber(providerCount)}</span>{' '}
            internet providers in the {geoUnitSingular} and the median
            advertised download speed is{' '}
            <span className="dynamic-value">
              {formatMbps(meanAdvertisedDown)}
            </span>{' '}
            and the median advertised upload speed is{' '}
            <span className="dynamic-value">
              {formatMbps(meanAdvertisedUp)}
            </span>
            .<sup>3</sup>
          </p>
          <p>
            The Measurement Lab has collected{' '}
            <span className="dynamic-value">
              {formatNumber(totalDownSamples)}
            </span>{' '}
            internet speed tests in the {geoUnitSingular} since July 2020, and
            the median download speed is{' '}
            <span className="dynamic-value">{formatMbps(medianDownload)}</span>{' '}
            while the median upload speed is{' '}
            <span className="dynamic-value">{formatMbps(medianUpload)}</span>.
            About{' '}
            <span className="dynamic-value">{formatPercent(overAudioPct)}</span>{' '}
            of the tests did not have sufficient bandwidth for audio calls and{' '}
            <span className="dynamic-value">{formatPercent(overVideoPct)}</span>{' '}
            would not have enabled a video call.<sup>4</sup>
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
          <li>Measurement Lab, collected since July 2020</li>
        </ol>
      </div>
    </div>
  );
}

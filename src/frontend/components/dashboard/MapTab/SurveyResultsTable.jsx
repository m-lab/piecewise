/* eslint-disable react/prop-types */
import { timeFormat, timeParse, range } from 'd3';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import './MapTab.css';

const formatDate = timeFormat('%b %d, %Y at %H:%M');
const parseDate = timeParse('%Y-%m-%d %H:%M:%S');

const SurveyResultsTable = ({
  currentResultId,
  pageSize,
  onRowHover,
  results,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const resultsCount = results.length;
  const customFields =
    results[0] && results[0].fields ? results[0].fields.map(d => d.label) : [];
  const pageCount = Math.ceil(resultsCount / pageSize);
  return (
    <div>
      <h3 style={{ marginTop: '0px' }}>{resultsCount} survey results</h3>
      <div className="horizontal-scroll">
        <table className="survey-results-table">
          <thead>
            <tr>
              <th style={{ padding: '0.5rem' }}>ID</th>
              <th style={{ padding: '0.5rem' }}>Date</th>
              <th style={{ padding: '0.5rem' }}>Speed (mbps)</th>
              {customFields.map(field => (
                <th key={field} style={{ padding: '0.5rem' }}>
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody onMouseLeave={() => onRowHover(null)}>
            {results
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((result, i) => {
                const isCurrent = result.id === currentResultId;
                const isEven = i % 2 === 0;
                let backgroundColor = isEven ? '#ebebeb' : 'white';
                if (isCurrent) backgroundColor = 'salmon';

                return (
                  <tr
                    key={result.id}
                    style={{
                      backgroundColor,
                      padding: '.25rem',
                    }}
                    onMouseEnter={() => onRowHover(result.id, i)}
                  >
                    <td style={{ padding: '0.5rem' }}>{result.id}</td>
                    <td style={{ padding: '0.5rem' }}>
                      {formatDate(parseDate(result.date))}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {result.s2cRate} ↓,
                      {result.c2sRate} ↑,
                    </td>
                    {result.fields.map(field => (
                      <td key={field.name} style={{ padding: '0.5rem' }}>
                        {field.value}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="survey-results-table-controls">
        <ul className="survey-results-table-pagination">
          <li>
            <button
              disabled={currentPage === 1}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
              }}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ←
            </button>
          </li>
          {range(1, pageCount + 1).map(page => (
            <li key={page}>
              <button
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontWeight: page === currentPage ? '900' : '100',
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            </li>
          ))}
          <li>
            <button
              disabled={currentPage === pageCount}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
              }}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              →
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

SurveyResultsTable.propTypes = {
  pageSize: PropTypes.number,
  results: PropTypes.array,
};

SurveyResultsTable.defaultProps = {
  pageSize: 15,
  results: [],
};

export default SurveyResultsTable;

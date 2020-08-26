/* eslint-disable react/prop-types */

import { nest } from 'd3';
import React from 'react';

const MapSelectControl = ({ id, label, onChange, options, value }) => {
  const grouped = nest()
    .key(d => d.group)
    .entries(options);
  return (
    <div className="map-select-control">
      <label htmlFor={id} style={{ display: 'block' }}>
        {label}
      </label>
      <select id={id} onChange={onChange} value={value}>
        <option value="">Select an option</option>
        {grouped.map(group => {
          const options = group.values.map(option => (
            <option key={option.value || option} value={option.value}>
              {option.label || option}
            </option>
          ));

          if (group.key === 'undefined') {
            return <>{options}</>;
          }

          return (
            <optgroup key={group.key} label={group.key}>
              {options}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
};

export default MapSelectControl;

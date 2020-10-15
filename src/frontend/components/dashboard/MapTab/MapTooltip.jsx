/* eslint-disable react/prop-types */
import React from 'react';

import './MapTab.css';

const MapTooltip = ({ left, submission, top, width }) => {
  const style = { left, top, width: `${width}px` };

  return (
    <div className="map-tooltip" style={style}>
      <pre>{JSON.stringify(submission, null, 2)}</pre>
    </div>
  );
};

export default MapTooltip;

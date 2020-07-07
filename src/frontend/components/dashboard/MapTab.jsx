// base imports
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Bootstrap imports
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';

const styles = {
  bottom: '0',
  left: '0',
  height: '70vh',
  position: 'absolute',
  right: '0',
  top: '90%',
  width: '100%',
};

export default function MapTab() {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.PIECEWISE_MAPBOX_KEY;
    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6', // stylesheet location
        center: [-77.0364, 38.8951],
        zoom: 5,
      });

      map.on('load', () => {
        setMap(map);
        map.resize();
      });
    };

    if (!map) initializeMap({ setMap, mapContainer });
  }, [map]);

  return (
    <Container className={'mt-4 mb-4'}>
      <Alert variant="secondary">
        <p className="mb-0">
          <em>See mapped out data from completed tests.</em>
        </p>
      </Alert>
      <div ref={el => (mapContainer.current = el)} style={styles} />
    </Container>
  );
}

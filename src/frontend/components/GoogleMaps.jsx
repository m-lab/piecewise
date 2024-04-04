// base imports
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

// Import toastr
import toastr from 'toastr';

// Bootstrap imports
import Container from 'react-bootstrap/Container';

export default function GoogleMaps(props) {
  const { settings, locationConsent } = props.location.state;
  const [latitude, setLatitude] = React.useState('');
  const [longitude, setLongitude] = React.useState('');
  const history = useHistory();

  let map, marker, infowindow, instructions;
  window.goodaddress = false;

  useEffect(() => {
    map = new window.google.maps.Map(document.getElementById('map'), {
      zoom: 8,
      center: { lat: 38.9071923, lng: -77.03687070000001 },
      mapTypeId: 'hybrid',
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });

    //init geocoder
    const geocoder = new window.google.maps.Geocoder();

    //init autocomplete
    const input = document.getElementById('loc');
    const autocomplete = new window.google.maps.places.Autocomplete(input);

    //search on change of selected address
    autocomplete.addListener('place_changed', function() {
      geocodeAddress(geocoder, map);
    });
  }, []);

  const recordMarkerLatLng = () => {
    if (infowindow) {
      infowindow.setContent(
        instructions +
          '<br>&nbsp<br>' +
          'Latitude ' +
          marker.getPosition().lat() +
          '<br>Longitude ' +
          marker.getPosition().lng(),
      );
      infowindow.open(map, marker);
      setLatitude(marker.getPosition().lat());
      document.getElementById('geolatitude').innerHTML = latitude;
      setLongitude(marker.getPosition().lng());
      document.getElementById('geolongitude').innerHTML = longitude;
    }
  };

  const geocodeAddress = (geocoder, resultsMap) => {
    var address = document.getElementById('loc').value;
    geocoder.geocode(
      { address: address },

      function(results, status) {
        if (status == window.google.maps.GeocoderStatus.OK) {
          if (!marker) {
            marker = new window.google.maps.Marker({
              map: resultsMap,
              position: results[0].geometry.location,
              draggable: true,
            });
            //console.log(results[0].address_components);
            window.google.maps.event.addListener(
              marker,
              'dragend',
              recordMarkerLatLng,
            );
          }

          if (marker) {
            marker.setPosition(results[0].geometry.location);
            resultsMap.setCenter(results[0].geometry.location);
            //alert(JSON.stringify(results[0].address_components[0]));
            document.getElementById('geoaddress').innerHTML =
              results[0].formatted_address;

            marker.setTitle(address);
            resultsMap.setZoom(17);
            instructions =
              '<strong>Please drag pin to your exact location.</strong>';
            if (!infowindow) {
              infowindow = new window.google.maps.InfoWindow({
                content: instructions,
              });
              infowindow.setContent(
                instructions +
                  '<br>&nbsp<br>' +
                  'Latitude ' +
                  marker.getPosition().lat() +
                  '<br>Longitude ' +
                  marker.getPosition().lng(),
              );
              window.google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map, marker);
              });
            }
            if (infowindow) {
              infowindow.setContent(
                instructions +
                  '<br>&nbsp<br>' +
                  address +
                  '<br>&nbsp<br>' +
                  'Latitude ' +
                  marker.getPosition().lat() +
                  '<br>Longitude ' +
                  marker.getPosition().lng(),
              );
              infowindow.open(map, marker);
            }
            recordMarkerLatLng(true);
            window.goodaddress = true;
          }
        } else {
          //alert('Could not find this address on the map. Please try again or position the map marker by hand.');
          setTimeout(function() {
            toastr.options = {
              positionClass: 'toast-top-center',
              closeButton: true,
              progressBar: true,
              showEasing: 'swing',
              timeOut: '50000',
            };
            toastr.warning(
              'Could not find this address on the map. Please try again or position the map marker by hand.',
            );
          }, 1);
        }

        //make map visible
        document.getElementById('map').style.display = 'block';
      },
    );
  };

  const handleSubmit = event => {
    event.preventDefault();
    history.push({
      pathname: '/survey',
      state: {
        settings: settings,
        locationConsent: locationConsent,
        latitude: latitude,
        longitude: longitude,
      },
    });
  };

  return (
    <Container className={'mt-4'}>
      <div id="mapcontainer" className="container">
        <div className="row">
          <div className="col">
            <h3>Please enter your address to get started</h3>
            <form onSubmit={handleSubmit}>
              <input
                type=""
                defaultValue=""
                id="loc"
                className="form-control"
                name=""
                autoComplete="false"
                required
              />
              <input type="submit" value="Submit" />
            </form>
          </div>
        </div>
        <div>&nbsp;</div>
        <div
          id="map"
          className="panel-body text-dark"
          style={{
            height: '500px',
            width: '100%',
            textAlign: 'center',
            display: 'none',
          }}
        />
        <div id="geolatitude" style={{ display: 'none' }} />
        <div id="geolongitude" style={{ display: 'none' }} />
        <div id="geoaddress" style={{ display: 'none' }} />
      </div>
    </Container>
  );
}

GoogleMaps.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      settings: PropTypes.object.isRequired,
      locationConsent: PropTypes.bool.isRequired,
    }),
  }),
};

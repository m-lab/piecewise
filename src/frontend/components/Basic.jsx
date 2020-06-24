// base imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// material-ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';

// module imports
import ChromeScreengrab from '../assets/images/chrome-location.jpg';
import FirefoxScreengrab from '../assets/images/firefox-location.jpg';
import NDTjs from '../assets/js/ndt-browser-client.js';
import ThanksDialog from './utils/ThanksDialog.jsx';

const useStyles = makeStyles(theme => ({
  input: {
    display: 'none',
  },
  h1: {
    fontFamily: 'Poppins',
    fontSize: '26px',
    lineHeight: '32px',
    fontWeight: '700',
  },
  h6: {
    fontFamily: 'Poppins',
    fontSize: '16px',
    lineHeight: '20px',
    fontWeight: '700',
    color: '#4A4A4A',
  },
  debug: {
    marginTop: theme.spacing(1),
    fontSize: '12px',
    lineHeight: '16px',
    color: '#4A4A4A',
    fontFamily: 'monospace',
  },
  FormControlLabel: {
    marginBottom: '5px',
  },
  media: {
    minHeight: '200px',
  },
  sub1: {
    marginTop: theme.spacing(1),
    fontSize: '12px',
    lineHeight: '16px',
    color: '#4A4A4A',
  },
  sub1a: {
    marginTop: theme.spacing(1),
    fontSize: '14px',
    lineHeight: '16px',
    color: '#4A4A4A',
  },
  paper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  centerText: {
    textAlign: 'center',
  },
}));

export default function Basic(props) {
  const classes = useStyles();

  // handle geolocation consent
  const [locationValue, setLocationValue] = React.useState('yes');

  const handleLocationChange = event => {
    setLocationValue(event.target.value);
  };

  // handle mlab privacy consent
  const [consentState, setConsentState] = React.useState({ checked: false });

  const handleConsentChange = event => {
    setConsentState({
      ...consentState,
      [event.target.name]: event.target.checked,
    });
  };

  const consentError = consentState.checked !== true;

  // handle form dialog open
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    if (!consentError) {
      setOpen(true);
      //if (locationValue === 'yes') {
      //  if ('geolocation' in navigator) {
      //    navigator.geolocation.getCurrentPosition(success, error);
      //  }
      //} else {
      //  runTests();
      //}
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  // handle NDT test
  const [ndtServer, setNdtServer] = React.useState(null);
  const [ndtServerIp, setNdtServerIp] = React.useState(null);

  let ndtPort = '3010',
    ndtProtocol = 'wss',
    ndtPath = '/ndt_protocol',
    ndtUpdateInterval = 1000,
    c2sRate,
    s2cRate,
    MinRTT;

  function success(position) {
    const NDT_client = new NDTjs(
      ndtServer,
      ndtPort,
      ndtProtocol,
      ndtPath,
      undefined,
      ndtUpdateInterval,
    );

    document.getElementById('latitude-mlab').value = position.coords.latitude;
    document.getElementById('longitude-mlab').value = position.coords.longitude;
    document.getElementById('latitude').value = position.coords.latitude;
    document.getElementById('longitude').value = position.coords.longitude;

    var xhr = new XMLHttpRequest(),
      currentLocationURL =
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
        position.coords.latitude +
        '&lon=' +
        position.coords.longitude +
        '&zoom=18&addressdetails=1';

    var currentLoc;
    xhr.open('GET', currentLocationURL, true);
    xhr.send();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          currentLoc = JSON.parse(xhr.responseText);
          console.log('Location received');
          NDT_client.startTest();
          // currentLocText.text(currentLoc.address.road + currentLoc.address.neighbourhood + currentLoc.address.suburb + currentLoc.address.city + currentLoc.address.state);
          document
            .getElementsByClassName('loader-item')[1]
            .append(
              'Searching from: ' +
                currentLoc.address.road +
                ', ' +
                currentLoc.address.city +
                ', ' +
                currentLoc.address.state,
            );
        } else {
          console.log('Location lookup failed');
        }
      }
    };
  }

  function error(error) {
    window.alert(error.message);
  }

  function getNdtServer() {
    var xhr = new XMLHttpRequest(),
      mlabNsUrl = 'https://mlab-ns.appspot.com/ndt_ssl?format=json';

    xhr.open('GET', mlabNsUrl, true);
    xhr.send();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          setNdtServer(JSON.parse(xhr.responseText).fqdn);
          setNdtServerIp(JSON.parse(xhr.responseText).ip);
          console.log('Using M-Lab Server ' + ndtServer);
        } else {
          console.log('M-Lab NS lookup failed.');
          window.alert('M-Lab NS lookup failed. Please refresh the page.');
        }
      }
    };
  }

  function runTests(event) {
    const NDT_client = new NDTjs(
      ndtServer,
      ndtPort,
      ndtProtocol,
      ndtPath,
      undefined,
      ndtUpdateInterval,
    );

    NDT_client.startTest();
  }

  React.useEffect(() => {
    getNdtServer();
    console.log(ndtServer);
  }, [ndtServer]);

  return (
    <Container maxWidth="lg">
      <Paper className={classes.paper} elevation={0}>
        <Box mb={3}>
          <Typography
            className={classes.h1}
            color="primary"
            variant="h4"
            component="h1"
          >
            Piecewise Broadband Speed Test
          </Typography>
          <Typography
            className={classes.sub1a}
            variant="subtitle1"
            component="p"
            gutterBottom
          >
            Sample subtitle
          </Typography>
          <Typography
            className={classes.h2}
            color="primary"
            variant="h5"
            component="h2"
          >
            Sharing your location
          </Typography>
          <Typography
            className={classes.body1}
            variant="body1"
            component="p"
            gutterBottom
          >
            To get the most accurate location data, we ask you to allow your
            browser to share your location. This is not essential but it is very
            helpful for creating more accurate maps. Depending on your browser,
            you'll see a window similar to the images below, requesting your
            consent to share your location. If you are using Private Browsing
            mode or Incognito mode, you may need to disable that preference for
            this website.
          </Typography>
        </Box>
        <Box mb={3}>
          <Grid container spacing={2} justify="center">
            <Grid item>
              <Card>
                <CardMedia
                  className={classes.media}
                  image={FirefoxScreengrab}
                  title="Screenshot of geography location request in Firefox."
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    Screenshot of geography location request in Firefox.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item>
              <Card>
                <CardMedia
                  className={classes.media}
                  image={ChromeScreengrab}
                  title="Screenshot of geography location request in Chrome."
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    Screenshot of geography location request in Chrome.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        <Box mb={3}>
          <FormControl component="fieldset">
            <Hidden>
              <FormLabel component="legend">
                Do you want to use your browser location?
              </FormLabel>
            </Hidden>
            <RadioGroup
              aria-label="location-choice"
              name="location"
              value={locationValue}
              onChange={handleLocationChange}
            >
              <FormControlLabel
                value="yes"
                control={<Radio />}
                label="Use my browser location"
                className={classes.FormControlLabel}
              />
              <FormControlLabel
                value="no"
                control={<Radio />}
                label="Do not use my location"
                className={classes.FormControlLabel}
                name="useBrowserLocation"
              />
            </RadioGroup>
          </FormControl>
          <div>
            <FormControl required error={consentError}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={consentState.checked}
                    onChange={handleConsentChange}
                    name="checked"
                    color="primary"
                  />
                }
                label="*I agree to the M-Lab privacy policy, which includes retention and publication of IP addresses, in addition to speed test results."
              />
              <FormHelperText>This field is required</FormHelperText>
            </FormControl>
          </div>
          <Box m={2} mx="auto" className={classes.centerText}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClickOpen}
            >
              Take the Test
            </Button>
          </Box>
        </Box>
        <ThanksDialog open={open} onClose={handleClose} />
      </Paper>
      {/*
      <MUICookieConsent
        cookieName="piecewiseCookieConsent"
        componentType="Snackbar" // default value is Snackbar
        message="This site uses cookies.... bla bla..."
      />
      */}
    </Container>
  );
}

Basic.propTypes = {
  history: PropTypes.object,
  location: PropTypes.shape({
    state: PropTypes.shape({
      description: PropTypes.string,
      files: PropTypes.array,
      links: PropTypes.array,
    }),
  }),
};

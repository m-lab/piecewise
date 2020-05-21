import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const drawerWidth = 240;

const defaultTitle = 'Piecewise';
const defaultHeader = 'Welcome to Piecewise!';
const defaultFooter = 'Thank you for taking a survey!';
const defaultColorOne = '#333333';
const defaultColorTwo = '#aaaaaa';

const useStyles = makeStyles(theme => ({
  root: {
    //display: 'flex',
  },
  toolbar: {
    //paddingRight: 24, // keep right padding when drawer closed
    //maxWidth: '100%',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  title: {
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
}));

export default function SettingsTab() {
  const classes = useStyles();
  const [openModal, setOpenModal] = React.useState(false);
  const [modalText, setModalText] = React.useState('');
  const [modalDebug, setModalDebug] = React.useState('');
  const [title, setTitle] = React.useState(defaultTitle);
  const [header, setHeader] = React.useState(defaultHeader);
  const [footer, setFooter] = React.useState(defaultFooter);
  const [colorOne, setColorOne] = React.useState(defaultColorOne);
  const [colorTwo, setColorTwo] = React.useState(defaultColorTwo);

  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  const uploadSettings = formData => {
    console.debug('formData: ', formData);
    let status;
    const json = JSON.stringify(formData);
    fetch('/api/v1/settigns', {
      method: 'POST',
      body: json,
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(data => {
        if (status === 200 || status === 201) {
          return data;
        } else {
          let [text, debug] = processError(data);
          setModalText(text);
          setModalDebug(debug);
          setOpenModal(true);
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  const downloadSettings = () => {
    let status;
    return fetch('/api/v1/forms/latest', {
      method: 'GET',
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(data => {
        if (status === 200 || status === 201) {
          return data;
        } else {
          let [text, debug] = processError(data);
          setModalText(text);
          setModalDebug(debug);
          setOpenModal(true);
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  return (
    <Container className={classes.root}>
      <Container className={classes.container}>
        {/* Chart */}
        <Box mt={2} mb={6}>
          <form className={classes.root} noValidate autoComplete="off">
            <Typography className={classes.h6} variant="h6">
              Title
            </Typography>
            <TextField id="standard-basic" label={title} />
            <Typography className={classes.h6} variant="h6">
              Welcome text
            </Typography>
            <TextField id="standard-basic" label={header} />
            <Typography className={classes.h6} variant="h6">
              Thank You text
            </Typography>
            <TextField id="standard-basic" label={footer} />
            <Typography className={classes.h6} variant="h6">
              Thank You text
            </Typography>
          </form>
        </Box>
      </Container>
      <Dialog open={openModal} aria-describedby="alert-dialog-description">
        <DialogContent>
          <Box p={2}>
            <DialogContentText id="alert-dialog-description">
              {modalText}
            </DialogContentText>
            <Typography className={classes.debug} component="div">
              {modalDebug}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

// base imports
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const drawerWidth = 240;

const defaultTitle = 'Piecewise';
const defaultHeader = 'Welcome to Piecewise!';
const defaultFooter = 'Thank you for taking a survey!';
const defaultColorOne = '#333333';
const defaultColorTwo = '#aaaaaa';

const useStyles = makeStyles(theme => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '-15px',
  },
  formField: {
    marginTop: '15px',
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
    fetch('/api/v1/settings', {
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
    return fetch('/api/v1/settings', {
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
    <Container>
      <Container>
        {/* Chart */}
        <Box mt={2} mb={6}>
          <form className={classes.form} noValidate autoComplete="off">
            <TextField
              id="title"
              className={classes.formField}
              label="Title"
              defaultValue={title}
            />
            <TextField
              id="welcome"
              className={classes.formField}
              label="Welcome Text"
              defaultValue={header}
              multiline={true}
            />
            <TextField
              id="thanks"
              className={classes.formField}
              label="Thank You Text"
              defaultValue={footer}
              multiline={true}
            />
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

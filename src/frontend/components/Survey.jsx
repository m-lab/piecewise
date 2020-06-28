// base imports
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { ReactFormGenerator } from 'react-form-builder2';

// material ui imports
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';

// module imports
//import FormRenderer from './utils/FormRenderer.jsx';
import NdtWidget from './utils/NdtWidget.jsx';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
}));

export default function Survey(props) {
  const classes = useStyles();
  const [openModal, setOpenModal] = React.useState(false);
  const [modalText, setModalText] = React.useState('');
  const [modalDebug, setModalDebug] = React.useState('');
  const [form, setForm] = React.useState(null);

  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  const uploadFormData = formData => {
    //formData.preventDefault();
    let status;
    console.log('***UPLOAD FORM DATA***: ', formData);
    const json = JSON.stringify(formData);
    fetch('/api/v1/submissions', {
      method: 'POST',
      body: json,
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(data => {
        if (status === 200 || status === 201) {
          props.history.push('/thankyou');
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

  const downloadForm = () => {
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
          //props.history.push('/thankyou');
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

  useEffect(() => {
    downloadForm().then(data => {
      console.log('DOWNLOADFORM DATA:', data);
      setForm(data.data);
    });
  }, []);

  if (!form) {
    return <div>Loading...</div>;
  } else {
    return (
      <Container maxWidth="lg">
        <Paper className={classes.paper} elevation={0}>
          {/*<NdtWidget /> */}
          {/* <FormRenderer onSave={uploadFormData} onLoad={downloadForm} /> */}
          <ReactFormGenerator
            answer_data={{}}
            form_method="POST"
            form_action="/api/v1/submissions"
            onSubmit={uploadFormData}
            data={form.task_data}
          />
        </Paper>
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
}

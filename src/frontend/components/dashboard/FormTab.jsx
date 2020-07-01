import React from 'react';
//import { makeStyles } from '@material-ui/core/styles';
//import AppBar from '@material-ui/core/AppBar';
//import Toolbar from '@material-ui/core/Toolbar';
//import Typography from '@material-ui/core/Typography';
//import IconButton from '@material-ui/core/IconButton';
//import Container from '@material-ui/core/Container';
//import Grid from '@material-ui/core/Grid';
//import ExitToAppIcon from '@material-ui/icons/ExitToApp';
//import Box from '@material-ui/core/Box';
//import Dialog from '@material-ui/core/Dialog';
//import DialogContent from '@material-ui/core/DialogContent';
//import DialogContentText from '@material-ui/core/DialogContentText';
//import FormEditor from '../utils/FormEditor.jsx';
import { ReactFormBuilder } from 'react-form-builder2';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

const drawerWidth = 240;

//const useStyles = makeStyles(theme => ({
//  root: {
//    //display: 'flex',
//  },
//  toolbar: {
//    //paddingRight: 24, // keep right padding when drawer closed
//    //maxWidth: '100%',
//  },
//  appBar: {
//    zIndex: theme.zIndex.drawer + 1,
//    transition: theme.transitions.create(['width', 'margin'], {
//      easing: theme.transitions.easing.sharp,
//      duration: theme.transitions.duration.leavingScreen,
//    }),
//  },
//  appBarShift: {
//    marginLeft: drawerWidth,
//    width: `calc(100% - ${drawerWidth}px)`,
//    transition: theme.transitions.create(['width', 'margin'], {
//      easing: theme.transitions.easing.sharp,
//      duration: theme.transitions.duration.enteringScreen,
//    }),
//  },
//  title: {
//    flexGrow: 1,
//  },
//  appBarSpacer: theme.mixins.toolbar,
//  content: {
//    flexGrow: 1,
//    height: '100vh',
//    overflow: 'auto',
//  },
//}));

export default function FormTab() {
  //const classes = useStyles();
  const [openModal, setOpenModal] = React.useState(false);
  const [modalText, setModalText] = React.useState('');
  const [modalDebug, setModalDebug] = React.useState('');

  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  const uploadForm = formData => {
    console.debug('formData: ', formData);
    let status;
    const json = JSON.stringify({ data: formData.task_data });
    fetch('/api/v1/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

  const downloadForm = () => {
    let status;
    return fetch('/api/v1/forms/latest', {
      method: 'GET',
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(result => {
        if (status === 200 || status === 201) {
          console.log('***DOWNLOADFORM***:', result.data.data);
          return result.data.data;
        } else if (status === 404) {
          console.info('No existing forms found.');
          return [];
        } else {
          let [text, debug] = processError(result);
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
      <Row>
        <Col>
          {/* Chart */}
          {/*<FormEditor
              onSave={ev => uploadForm(ev.formData)}
              onLoad={downloadForm}
            />*/}
          <ReactFormBuilder onPost={uploadForm} onLoad={downloadForm} />
        </Col>
      </Row>
    </Container>
  );
}

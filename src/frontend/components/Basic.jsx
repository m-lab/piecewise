import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import LockIcon from '@material-ui/icons/Lock';
import { makeStyles } from '@material-ui/core/styles';
import FolderIcon from '@material-ui/icons/Folder';
import LinkIcon from '@material-ui/icons/Link';
import { Link as RouterLink } from 'react-router-dom';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import AddIcon from '@material-ui/icons/Add';
import ImageIcon from '@material-ui/icons/Image';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import MovieIcon from '@material-ui/icons/Movie';
import MusicVideoIcon from '@material-ui/icons/MusicVideo';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

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

const decorateLink = (text, i) => {
  if (i === 0 || text !== '') {
    return (
      <InputAdornment position="start">
        <LinkIcon />
      </InputAdornment>
    );
  } else {
    return (
      <InputAdornment position="start">
        <AddIcon />
      </InputAdornment>
    );
  }
};

const validateLink = text => {
  var regEx = /^(http|https):\/\/[^ "]+$/;
  return text === '' || regEx.test(text);
};

export default function Basic(props) {
  const classes = useStyles();
  const [links, setLinks] = useState(['']);
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [isFormValid, setIsFormValid] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [modalText, setModalText] = React.useState('');
  const [modalDebug, setModalDebug] = React.useState('');
  let selectedDate, geography, followUp, reason, additionalInfo, medium;

  if (props.location.state) {
    ({
      selectedDate,
      geography,
      followUp,
      reason,
      additionalInfo,
      medium,
    } = props.location.state);
  }

  useEffect(() => {
    if (props.location.state) {
      if (props.location.state.description) {
        setDescription(props.location.state.description);
      }
      if (props.location.state.links) {
        setLinks(props.location.state.links);
      }
      if (props.location.state.files) {
        setFiles(props.location.state.files);
      }
    }
  }, []);

  const handleUploadChange = event => {
    let newArr = [...files];
    newArr = newArr.concat(event.target.files[0]);
    setFiles(newArr);
  };

  const handleLinkChange = (i, event) => {
    let newArr = [...links];
    newArr[i] = event.target.value;
    if (newArr[i + 1] === undefined) {
      newArr[i + 1] = '';
    }
    // test to see if every link is valid, if not, invalidate the form
    const allValid = newArr.every(url => validateLink(url));
    if (!allValid) {
      setIsFormValid(false);
    } else {
      setIsFormValid(true);
    }
    setLinks(newArr);
  };

  const renderLinks = () => {
    return links.map((text, i) => (
      <TextField
        placeholder="Paste link"
        fullWidth
        error={!validateLink(text)}
        data-id={i}
        key={i}
        value={text}
        style={{ display: 'block' }}
        onChange={handleLinkChange.bind(this, i)}
        InputProps={{
          startAdornment: decorateLink(text, i),
        }}
      />
    ));
  };

  const renderFiles = () => {
    let listItems = files.map((file, i) => {
      let icon = <AddIcon />;
      if (file.type.includes('image')) {
        icon = <ImageIcon />;
      } else if (file.type.includes('pdf')) {
        icon = <PictureAsPdfIcon />;
      } else if (file.type.includes('video')) {
        icon = <MovieIcon />;
      } else if (file.type.includes('audio')) {
        icon = <MusicVideoIcon />;
      }
      return (
        <ListItem key={i}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={file.name} secondary={file.type} />
        </ListItem>
      );
    });
    return <List dense={true}>{listItems}</List>;
  };

  const handleDescriptionChange = event => {
    setDescription(event.target.value);
  };

  const processError = errorMessage => {
    let text = '';
    let debug = '';
    if (false) {
      text = '';
    } else {
      text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
      debug = JSON.stringify(errorMessage);
    }
    return [text, debug];
  };

  const uploadForm = () => {
    let formData = new FormData();

    files.map((file, i) => {
      formData.append(`file${i}`, file);
      return file;
    });

    formData.append(
      'disinfo_links',
      JSON.stringify(links.filter(link => link.length > 0)),
    );
    formData.append('description', description);

    let d = new Date();

    formData.append('sighted_on', d.toJSON());
    formData.append('geography', '');
    formData.append('follow_up', '');

    formData.append('medium', JSON.stringify([]));
    formData.append('medium_other', '');
    formData.append('reason', '');
    formData.append('additional_info', '');
    formData.append('follow_up', 'none');

    // TODO: turn the endpoint into an environment variable
    fetch('/api/v1/reports', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          response.json().then(success => {
            props.history.push('/thankyou');
          });
        } else {
          response.json().then(failure => {
            let [text, debug] = processError(failure);
            setModalText(text);
            setModalDebug(debug);
            setOpenModal(true);
            throw new Error(`Error in response from server.`);
          });
        }
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  return (
    <Container maxWidth="sm">
      <Paper className={classes.paper} elevation={0}>
        <Typography
          className={classes.h1}
          color="primary"
          variant="h4"
          component="h1"
        >
          Submit potential disinformation.
        </Typography>
        <Typography className={classes.sub1a} variant="subtitle1" component="p">
          Report suspicious sites, stories, ads, social accounts, posts, and
          other clues.
        </Typography>
        <Typography className={classes.sub1} variant="subtitle1" component="p">
          <LockIcon color="primary" fontSize="inherit" /> All submissions are
          sent to a secure database.
        </Typography>
        <Box mt={2} mb={2}>
          <Divider />
        </Box>
        <Box mt={2} mb={6}>
          <Typography className={classes.h6} variant="h6">
            What did you see or hear?
          </Typography>
          <Typography
            className={classes.sub1}
            variant="subtitle1"
            component="p"
            gutterBottom
          >
            Include social platforms, account names, video descriptions, and/or
            any other descriptive information.
          </Typography>
          <FormControl fullWidth>
            <TextField
              id="standard-multiline-static"
              label="Describe it"
              error={description.length === 0}
              helperText={description.length === 0 ? 'Required field.' : ''}
              multiline
              value={description}
              onChange={handleDescriptionChange}
              rowsMax="4"
              required
            />
          </FormControl>
        </Box>
        <Box mt={2} mb={6}>
          <Typography className={classes.h6} variant="h6" gutterBottom>
            Helpful information
          </Typography>
          <Typography
            className={classes.sub1}
            variant="subtitle1"
            component="p"
            gutterBottom
          >
            We will be able to address concerns much quicker if you provide a
            link or a screenshot. If you don&#39;t have any we may follow up
            with you.
          </Typography>
          {renderLinks()}
          <FormControl>
            {renderFiles()}
            <input
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
              className={classes.input}
              id="upload-file"
              type="file"
              onChange={handleUploadChange}
            />
            <label htmlFor="upload-file">
              <Button
                aria-label="upload file"
                component="span"
                startIcon={<FolderIcon />}
                variant="text"
              >
                {files.length === 0 ? 'Add files' : 'Add another file'}
              </Button>
            </label>
          </FormControl>
        </Box>
        <Box mt={2} mb={6}>
          <Grid container direction="row" alignItems="center" justify="center">
            <Grid className={classes.centerText} item xs={6}>
              <Button
                onClick={uploadForm}
                disabled={!isFormValid || description.length === 0}
              >
                Submit
              </Button>
            </Grid>
            <Grid className={classes.centerText} item xs={6}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                disabled={!isFormValid || description.length === 0}
                to={{
                  pathname: '/share',
                  state: {
                    links,
                    files,
                    description,
                    selectedDate,
                    geography,
                    followUp,
                    reason,
                    additionalInfo,
                    medium,
                  },
                }}
              >
                Add Detail
              </Button>
            </Grid>
          </Grid>
        </Box>
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
      </Paper>
    </Container>
  );
}

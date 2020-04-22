import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import LinkIcon from '@material-ui/icons/Link';
import { Link as RouterLink } from 'react-router-dom';
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
import Container from '@material-ui/core/Container';

const useStyles = makeStyles(theme => ({
  input: {
    display: 'none',
  },
  h1: {
    fontFamily: 'Poppins',
    fontSize: '32px',
    lineHeight: '38px',
    fontWeight: '700',
  },
  h6: {
    fontFamily: 'Poppins',
    fontSize: '16px',
    lineHeight: '20px',
    fontWeight: '700',
    color: '#4A4A4A',
  },
  sub1: {
    marginTop: theme.spacing(1),
    fontSize: '12px',
    lineHeight: '16px',
    color: '#4A4A4A',
  },
  sub1a: {
    marginTop: theme.spacing(1),
    fontSize: '16px',
    lineHeight: '24px',
    color: '#4A4A4A',
  },
  paper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
    minHeight: '600px',
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

export default function Basic() {
  const classes = useStyles();
  const [links, setLinks] = useState(['']);
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    //console.log('files!',files);
  });

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

  const uploadForm = () => {
    console.log(files, links, description);

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

    // TODO: turn the endpoint into an environment variable
    fetch('/api/v1/reports', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(success => {
        console.log('success??', success);
        return;
      })
      .catch(error => {
        console.log('error:', error);
      });
  };

  return (
    <Container maxWidth="sm">
      <Paper className={classes.paper} elevation={0}>
        <Box mt={16}>
          <Grid container direction="row" alignItems="center" justify="center">
            <Grid item xs={6}>
              <Typography
                className={classes.h1}
                color="primary"
                variant="h4"
                component="h1"
              >
                Thank you!
              </Typography>
              <Typography
                className={classes.sub1a}
                variant="subtitle1"
                component="p"
              >
                We address all requests within 24 hours. If your submission
                implies immediate danger, please contact authorities.
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Box mt={4}>
          <Grid container direction="row" alignItems="center" justify="center">
            <Grid className={classes.centerText} item xs={12}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to={{
                  pathname: '/',
                  state: {
                    links,
                    files,
                    description,
                  },
                }}
              >
                New Submission
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

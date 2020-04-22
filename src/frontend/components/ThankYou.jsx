import React from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
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

export default function Basic() {
  const classes = useStyles();

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
                We will respond to your submission as soon as possible!
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
                to={{ pathname: '/' }}
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

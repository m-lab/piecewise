// base imports
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    padding: '20px',
  },
});

export default function ThanksDialog(props) {
  const classes = useStyles();
  const { onClose, open } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      className={classes.root}
    >
      <DialogTitle id="simple-dialog-title">Thank you!</DialogTitle>
      <Typography
        className={classes.body1}
        variant="body1"
        component="p"
        gutterBottom
      >
        Your test is now running in the background. Please{' '}
        <a href="/survey">click here</a> if you would like to take the survey.
      </Typography>
    </Dialog>
  );
}

ThanksDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

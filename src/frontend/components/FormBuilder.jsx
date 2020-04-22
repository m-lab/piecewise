import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ReactDOM from 'react-dom';
//import { FormeoEditor } from 'formeo';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
}));

export default class FormBuilder extends Component {
  componentDidMount() {
    //require('formeo');

    const options = {
      container: ReactDOM.findDOMNode(this.refs.builder),
      svgSprite: '/assets/img/formeo-sprite.svg',
      i18n: {
        langsDir: '/assets/lang/',
        langs: ['en-US'],
      },
    };
    new FormeoEditor(options);
  }

  render() {
    return (
      <div>
        <div ref="builder" />
      </div>
    );
  }
}

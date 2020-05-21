import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const FormEditor = props => {
  useEffect(() => {
    let Editor;
    let options;
    import('formeo')
      .then(({ FormeoEditor }) => {
        const container = document.querySelector('.formeo-editor');
        options = {
          editorContainer: container,
          style: 'https://draggable.github.io/formeo/assets/css/formeo.min.css',
          debug: true,
        };
        if (props.onSave) {
          options.events = { onSave: props.onSave };
        }
        Editor = FormeoEditor;
        return props.onLoad();
      })
      .then(res => {
        if (res && res.data) {
          return new Editor(options, res.data);
        } else {
          return new Editor(options);
        }
      })
      .catch(err => {
        console.error('Error: ', err);
      });
  }, []);

  return (
    <div>
      <form className="formeo-editor" />
    </div>
  );
};

FormEditor.propTypes = {
  onSave: PropTypes.func,
  onLoad: PropTypes.func,
};

export default FormEditor;

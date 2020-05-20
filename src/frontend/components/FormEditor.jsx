import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const FormEditor = props => {
  useEffect(() => {
    import('formeo')
      .then(({ FormeoEditor }) => {
        const container = document.querySelector('.formeo-editor');
        let options = {
          editorContainer: container,
          style: 'https://draggable.github.io/formeo/assets/css/formeo.min.css',
          debug: true,
        };
        if (props.onSave) {
          options.events = { onSave: props.onSave };
        }
        console.debug('options: ', options);
        console.debug('props: ', props);
        return new FormeoEditor(options);
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
};

export default FormEditor;

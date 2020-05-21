import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const FormRenderer = props => {
  useEffect(() => {
    import('formeo')
      .then(({ FormeoRenderer }) => {
        const container = document.querySelector('.formeo-renderer');
        const options = {
          editorContainer: container,
          style: 'https://draggable.github.io/formeo/assets/css/formeo.min.css',
          debug: true,
        };
        if (props.onSave) {
          options.events = { onSave: props.onSave };
        }
        const renderer = new FormeoRenderer(options);
        console.log('props: ', props);
        props.onLoad().then(res => {
          console.log('res.data: ', res.data);
          renderer.render(res.data);
          console.log('rendered!');
          return;
        });
      })
      .catch(err => {
        console.error('Error: ', err);
      });
  }, []);

  return (
    <div>
      <form className="formeo-renderer" />
    </div>
  );
};

FormRenderer.propTypes = {
  onSave: PropTypes.func,
  onLoad: PropTypes.func,
};

export default FormRenderer;

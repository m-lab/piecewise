import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const FormRenderer = props => {
  useEffect(() => {
    let Renderer;
    let options;
    import('formeo')
      .then(({ FormeoRenderer }) => {
        const container = document.querySelector('.formeo-render');
        options = {
          renderContainer: container,
          style: 'https://draggable.github.io/formeo/assets/css/formeo.min.css',
          debug: true,
        };
        if (props.onSave) {
          options.events = { onSave: props.onSave };
        }
        Renderer = FormeoRenderer;
        return props.onLoad();
      })
      .then(res => {
        let renderer;
        if (res && res.data) {
          renderer = new Renderer(options, res.data);
        } else {
          renderer = new Renderer(options);
        }
        return renderer.render();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.error('Error: ', err);
      });
  }, []);

  return (
    <div>
      <form className="formeo-render" />
    </div>
  );
};

FormRenderer.propTypes = {
  onSave: PropTypes.func,
  onLoad: PropTypes.func,
};

export default FormRenderer;

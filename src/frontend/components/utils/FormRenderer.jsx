import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const FormRenderer = props => {
  const [ form, setForm ] = React.useState(null);
  const formContainer = React.useRef(null);

  useEffect(() => {
    const initializeForm = ({ setForm, formContainer }) => {
      import('formeo')
        .then(({ FormeoRenderer }) => {
          const options = {
            renderContainer: formContainer.current,
            style: 'https://draggable.github.io/formeo/assets/css/formeo.min.css',
            debug: true,
          };
          if (props.onSave) {
            options.events = { onSave: props.onSave };
          }
          const renderer = new FormeoRenderer(options);
          console.log('render: ', renderer);
          setForm(renderer);
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
    }

      if (!form) { initializeForm({ setForm, formContainer }) };
  }, []);

  return (
    <div>
      <form className="formeo-renderer" ref={el => (formContainer.current = el)} />
    </div>
  );
};

FormRenderer.propTypes = {
  onSave: PropTypes.func,
  onLoad: PropTypes.func,
};

export default FormRenderer;

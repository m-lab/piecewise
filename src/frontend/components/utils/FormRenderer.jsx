import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const FormRenderer = props => {
  const { onSave, onLoad } = props;
  const [form, setForm] = React.useState(null);
  const formContainer = React.useRef(null);

  useEffect(() => {
    const initializeForm = ({ setForm, formContainer }) => {
      let renderer;
      import('formeo')
        .then(({ FormeoRenderer }) => {
          const options = {
            renderContainer: formContainer.current,
            style:
              'https://draggable.github.io/formeo/assets/css/formeo.min.css',
            debug: true,
          };
          if (onSave) {
            options.events = { onSave: onSave };
          }
          renderer = new FormeoRenderer(options);
          console.log('render: ', renderer);
          setForm(renderer);
          return onLoad();
        })
        .then(res => renderer.render(res.data))
        .catch(err => {
          console.error('Error: ', err);
        });
    };

    if (!form) {
      initializeForm({ setForm, formContainer });
    }
  }, []);

  return (
    <div>
      <form
        className="formeo-renderer"
        ref={el => (formContainer.current = el)}
      >
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

FormRenderer.propTypes = {
  onSave: PropTypes.func,
  onLoad: PropTypes.func,
};

export default FormRenderer;

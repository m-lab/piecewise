import React, { useEffect } from 'react';

const FormRenderer = () => {
  useEffect(() => {
    import('formeo')
      .then(({ FormeoRenderer }) => {
        const container = document.querySelector('.formeo-renderer');
        const options = {
          editorContainer: container,
          style: 'https://draggable.github.io/formeo/assets/css/formeo.min.css',
          debug: true,
        };
        return new FormeoRenderer(options);
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

export default FormRenderer;

import 'babel-polyfill';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { rehydrateMarks } from 'react-imported-component';
import App from './components/App.jsx';
import Loading from './components/Loading.jsx';

export const hydrate = (app, element) => () => {
  ReactDOM.hydrate(app, element);
};

export const start = ({ isProduction, document, module, hydrate }) => {
  const element = document.getElementById('app');
  const serverSideStyles = document.getElementById('server-side-styles');
  // Remove server-side CSS if present, since we're going to re-render it
  if (serverSideStyles) {
    serverSideStyles.parentElement.removeChild(serverSideStyles);
  }

  const app = (
    <Suspense fallback={Loading}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </Suspense>
  );

  // In production, we want to hydrate instead of render
  // because of the server-rendering
  if (isProduction) {
    // rehydrate the bundle marks from imported-components,
    // then rehydrate the react app
    rehydrateMarks()
      .then(hydrate(app, element))
      .catch(err => {
        console.error(`Failed to rehydrate bundle marks: ${err}`);
      });
  } else {
    ReactDOM.render(app, element);
  }

  // Enable Hot Module Reloading
  if (module.hot) {
    module.hot.accept();
  }
};

const options = {
  isProduction: process.env.NODE_ENV === 'production',
  document: document,
  module: module, // eslint-disable-line no-undef
  hydrate,
};

start(options);

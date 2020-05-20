import fs from 'fs';
import { Readable } from 'stream';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom';
import {
  ServerStyleSheets,
  StylesProvider,
  ThemeProvider,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { printDrainHydrateMarks } from 'react-imported-component/server';
import MultiStream from 'multistream';
import App from '../../frontend/components/App.jsx';
import theme from '../../frontend/theme.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:middleware:ssr');

const appString = '<div id="app">';
const stylesString = '<style id="jss-server-side">';
const splitter = '###SPLIT###';

const getHTMLFragments = ({ drainHydrateMarks, rawHTML }) => {
  log.debug('Getting HTML fragments.');
  const [startingRawHTMLFragment, endingRawHTMLFragment] = rawHTML
    .replace(appString, `${appString}${splitter}`)
    .split(splitter);
  const startingHTMLFragment = `${startingRawHTMLFragment}${drainHydrateMarks}`;
  return [startingHTMLFragment, endingRawHTMLFragment];
};

const getApplicationStream = async (originalUrl, context) => {
  log.debug('Getting application stream.');
  const helmetContext = {};
  const app = (
    <HelmetProvider context={helmetContext}>
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <StaticRouter location={originalUrl} context={context}>
            <div>SERVER RENDERED</div>
            <App />
          </StaticRouter>
        </ThemeProvider>
      </StylesProvider>
    </HelmetProvider>
  );

  const sheets = new ServerStyleSheets();
  const collected = sheets.collect(app);
  return [collected, sheets];
};

const injectStyles = (htmlFragment, stylesFragment) => {
  log.debug('Injecting styles.');
  return htmlFragment.replace(stylesString, `${stylesString}${stylesFragment}`);
};

/**
 * Installs server-side rendering middleware into the koa app.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */
const ssr = async (ctx, next) => {
  const context = {};
  const [appStream, stylesFragment] = await getApplicationStream(
    ctx.originalUrl,
    context,
  );
  log.debug('About to server-side render page.');
  let rendered;
  try {
    rendered = renderToString(appStream);
  } catch (err) {
    ctx.throw(500, `Error while rendering page: ${err}`);
  }

  log.debug('Just server-side rendered page.');

  if (context.url) {
    ctx.status = 301;
    return ctx.redirect(context.url);
  }

  if (!ctx.state.htmlEntrypoint)
    ctx.throw(500, 'No HTML entrypoint specified for SSR.');

  let rawHTML;
  try {
    rawHTML = fs.readFileSync(ctx.state.htmlEntrypoint).toString();
  } catch (e) {
    ctx.throw(500, `Invalid HTML entrypoint specified: ${e}`);
  }
  const [startingHTMLFragment, endingHTMLFragment] = getHTMLFragments({
    drainHydrateMarks: printDrainHydrateMarks(),
    rawHTML: rawHTML,
  });

  const injectedStartingFragment = injectStyles(
    startingHTMLFragment,
    stylesFragment.toString(),
  );

  log.debug('Crossing the streams.');
  const htmlStream = new MultiStream([
    Readable.from(injectedStartingFragment),
    Readable.from(rendered),
    Readable.from(endingHTMLFragment),
  ]);
  ctx.body = htmlStream;
  ctx.type = 'html';
  await next();
};

export default ssr;

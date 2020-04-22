import fs from 'fs';
import { Readable } from 'stream';
import React from 'react';
import { renderToNodeStream } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom';
import { ServerStyleSheets, ThemeProvider } from '@material-ui/core/styles';
import { StylesProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { printDrainHydrateMarks } from 'react-imported-component';
import MultiStream from 'multistream';
import App from '../../frontend/components/App.jsx';
import theme from '../../frontend/theme.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:middleware:ssr');

const appString = '<div id="app">';
const stylesString = '<style id="server-side-styles">';
const splitter = '###SPLIT###';

const getHTMLFragments = ({ drainHydrateMarks, rawHTML }) => {
  log.debug('Getting HTML fragments.');
  const [startingRawHTMLFragment, endingRawHTMLFragment] = rawHTML
    .replace(appString, `${appString}${splitter}`)
    .split(splitter);
  const startingHTMLFragment = `${startingRawHTMLFragment}${drainHydrateMarks}`;
  return [startingHTMLFragment, endingRawHTMLFragment];
};

const getApplicationStream = (originalUrl, context) => {
  log.debug('Getting application stream.');
  const helmetContext = {};
  const app = (
    <HelmetProvider context={helmetContext}>
      <CssBaseline />
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <StaticRouter location={originalUrl} context={context}>
            <App />
          </StaticRouter>
        </ThemeProvider>
      </StylesProvider>
    </HelmetProvider>
  );

  const sheets = new ServerStyleSheets();
  const collected = sheets.collect(app);
  return [renderToNodeStream(collected), sheets.toString()];
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
  const [appStream, stylesFragment] = getApplicationStream(
    ctx.originalUrl,
    context,
  );

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
    stylesFragment,
  );

  log.debug('Crossing the streams.');
  const htmlStream = new MultiStream([
    Readable.from(injectedStartingFragment),
    appStream,
    Readable.from(endingHTMLFragment),
  ]);
  ctx.body = htmlStream;
  ctx.type = 'html';
  await next();
};

export default ssr;

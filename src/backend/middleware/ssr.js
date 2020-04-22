import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom';
import { ServerStyleSheets, ThemeProvider } from '@material-ui/core/styles';
import { printDrainHydrateMarks } from 'react-imported-component';
import CombinedStream from 'combined-stream';
import App from '../../frontend/components/App.jsx';
import theme from '../../frontend/theme.js';

const appString = '<div id="root">';
const splitter = '###SPLIT###';

const getHTMLFragments = ({ drainHydrateMarks, rawHTML }) => {
  const [startingRawHTMLFragment, endingRawHTMLFragment] = rawHTML
    .replace(appString, `${appString}${splitter}`)
    .split(splitter);
  const startingHTMLFragment = `${startingRawHTMLFragment}${drainHydrateMarks}`;
  return [startingHTMLFragment, endingRawHTMLFragment];
};

const getApplicationStream = (originalUrl, context) => {
  const helmetContext = {};
  const app = (
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={originalUrl} context={context}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </StaticRouter>
    </HelmetProvider>
  );

  const sheet = new ServerStyleSheets();
  return renderToString(sheet.collect(app));
};

/**
 * Installs server-side rendering middleware into the koa app.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */
const ssr = async (ctx, next) => {
  const context = {};
  const appStream = getApplicationStream(ctx.originalUrl, context);

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

  const htmlStream = new CombinedStream();
  [startingHTMLFragment, appStream, endingHTMLFragment].map(content =>
    htmlStream.append(content),
  );
  ctx.body = htmlStream;
  ctx.type = 'html';
  await next();
};

export default ssr;

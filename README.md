# Piecewise

Piecewise is a tool for digesting and aggregating user-volunteered Internet performance test results data from [Measurement Lab](https://measurementlab.net), and visualizing aggregate data on the web.

## Support and Community

Piecewise is considered beta software and is not officially supported by the Open Technology Institute (OTI), New America or M-Lab. "Supported" in this documentation refers only to known working implementations or configurations, and not a level of product or customer support for installations of piecewise.

Questions, comments, contributions, etc. about Piecewise should be addressed via Github comments or issues, or by emailing M-Lab staff at the Open Technology Institute at [support@opentechinstitute.org](mailto:support@opentechinstitute.org).

## Code

Piecewise code can be found on Github: [https://github.com/opentechinstitute/piecewise](https://github.com/opentechinstitute/piecewise)

## Get Started Documentation

Piecewise can be deployed locally or via a Docker container.

### To deploy via Docker
In a new shell, run:
```
docker-compose build
docker-compose up
```

### To deploy locally

Install poetry if it does not yet exist on your machine:
`pip install poetry`

If you're running the application for the first time, run:
`poetry install`

Then navigate to the backend directory and run Piecewise:
`cd backend && poetry run piecewise
`

In a new tab, navigate to the frontend directory:
`cd ../frontend`

If you're running the application for the first time, run:
`npm install`

To run the front end concurrently with the backend, run:
`npm run start:dev`

Piecewise can be installed and run on any Linux server or virtual machine.
The process of setting up a new Piecewise server involves:

* [Server/VM System Requirements and Accounts Setup](docs/system-requirements.md)
  * Setting up a virtual machine or server
  * Creating required accounts
  * Forking Piecewise code to your Github account and cloning a copy on your local computer
* [Configuring/Customizing Piecewise Code](docs/config.md)
  * Obtaining geographic information and data, and adding it to your local copy of Piecewise
  * Customizing Piecewise config files
* [Deploying Piecewise](docs/deploy.md)
* [Post installation administration and management](post-install-and-administration.md)

You can also learn more about [How Piecewise Works](docs/how-piecewise-works.md) and about the [statistics Piecewise generates](docs/piecewise-statistics.md)

## Project Organization

Piecewise contains the following Python modules:

* `piecewise.aggregate` defines statistics and binning dimensions.
* `piecewise.bigquery` contains setup code for the bigquery client library from Google.
* `piecewise.config` contains code for reading JSON and using it to control the ingest and query operations.
* `piecewise.ingest` issues queries against the M-Lab tables on Google BigQuery and converts the results to rows in a local Postgres database.
* `piecewise.maxmind` defines code for loading and querying the maxmind IP database.
* `piecewise.query` issues queries against Postgres databases populated by the `ingest` module.
  These may resample the data dynamically.
* `piecewise.wsgi` exposes the `query` functionality as a web service for consumption by JavaScript applications.
  The `piecewise_web` directory in this repository contains some sample visualizations using the d3 library.

## Contributions

Contributions from external developers are welcome.

If you are a developer and are interested in contributing upstream to Piecewise, please review our [open issues](https://github.com/opentechinstitute/piecewise/issues) and [milestones](https://github.com/opentechinstitute/piecewise/milestones), and [contact us](mailto:support@opentechinstitute.org) for more information if needed. A more detailed roadmap for Piecewise is forthcoming.

### Guidelines for External Contributors

Because Piecewise instances will all be local in nature, the development team requests that external contributors fork the Piecewise master branch and customize your fork for your needs.

New features you develop for Piecewise should be generalizable to any instance of Piecewise. An example of a generalizable feature would be a function that adds support for additional public data sources that a user could choose to configure and enable on their instance, either during initial setup or deployable onto an existing instance using an update script or other means. A feature that is not generalizable, such as location specific changes, would be rejected.

If you have developed new front-end examples in your fork of Piecewise, we encourage you to add a generalized version to `/piecewise/piecewise_web/examples` and submit a pull requests to add the examples for others to refer to.

### Feature Requests and Bug Reports

If you would like to request a new Piecewise feature or report a bug, please file an issue in the Github repository.

### Pull Requests

Please create pull requests from your fork to our master branch for review. Pull requests for addressing existing issues will be prioritized over new features not already logged as issues.

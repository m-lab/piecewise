# Piecewise

Piecewise is a tool for digesting and aggregating user-volunteered Internet performance test results data from [Measurement Lab](https://measurementlab.net), and visualizing aggregate data on the web.

## Support and Community

Piecewise is considered beta software and is not officially supported by the Open Technology Institute (OTI), New America or M-Lab. "Supported" in this documentation refers only to known working implementations or configurations, and not a level of product or customer support for installations of piecewise.

Questions, comments, contributions, etc. about Piecewise should be addressed via Github comments or issues, or by emailing M-Lab staff at the Open Technology Institute at [support@opentechinstitute.org](mailto:support@opentechinstitute.org).

## Code

Piecewise code can be found on Github: [https://github.com/opentechinstitute/piecewise](https://github.com/opentechinstitute/piecewise)

## Get Started Documentation

To get started with installing and configuring Piecewise, please review the links below to our current documentation. We suggest that you read all the documents in the order below.

* [Installing Piecewise](docs/install.md)
* [Setup external service accounts required to run Piecewise](service-accounts.md)
* [Configuring your instance for your location](docs/config.md)
* [Deploying your Piecewise instance](docs/deploy.md)
* [Post installation tasks and ongoing maintenance/administration](post-install-and-administration.md)


Additionally, [Advanced Piecewise Customization](docs/customizing-piecewise.md) covers how to customize additional components of the Piecewise application in greater detail.

You can also learn more about [How Piecewise Works](docs/how-piecewise-works.md) and about the [statistics Piecewise generates](docs/piecewise-statistics.md)

## Organization

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

### Current Development Status (updated 4/28/2016)

Our current goal is to develop existing and new features for Piecewise so that setting up a new instance is as siimple as cloning or forking the repository, followed by running a setup script. Please see the issues for the [refactor milestone](https://github.com/opentechinstitute/piecewise/issues?q=is%3Aopen+is%3Aissue+milestone%3A%22Refactor+for+generalized+instantiation%22) on Github.

### Guidelines for External Contributors

Because Piecewise instances will all be local in nature, the development team requests that external contributors fork the Piecewise master branch and customize your fork for your needs.

New features you develop for Piecewise should be generalizable to any instance of Piecewise. An example of a generalizable feature would be a function that adds support for additional public data sources that a user could choose to configure and enable on their instance, either during initial setup or deployable onto an existing instance using an update script or other means. A feature that is not generalizable, such as location specific changes, would be rejected.

If you have developed new front-end examples in your fork of Piecewise, we encourage you to add a generalized version to `/piecewise/piecewise_web/examples` and submit a pull requests to add the examples for others to refer to.

### Feature Requests and Bug Reports

If you would like to request a new Piecewise feature or report a bug, please file an issue in the Github repository.

### Pull Requests

Please create pull requests from your fork to our master branch for review. Pull requests for addressing existing issues will be prioritized over new features not already logged as issues.
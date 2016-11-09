## Setup external service accounts required to run Piecewise

Running a Piecewise server requires: 

  * A Google account (Gmail, GApps for Business/Work/Non-profit)
  * Subscribing that Google account to the [M-Lab Discuss Group](https://groups.google.com/a/measurementlab.net/forum/#!forum/discuss) to whitelist the account so you will not be charged for queries to M-Lab's dataset in BigQuery
  * Setup a project in Google Developer Console for that Google account, with billing enabled 
  (**you will not be billed because your account is whitelisted, but BigQuery requires API applications to have billing enabled**)
  * A [MapBox](https://www.mapbox.com/) account if you intend to use MapBox base maps

### Subscribe to M-Lab Discuss to Whitelist a Google Account to use with your Piecewise instance

Piecewise requires a Google Account to be configured for ingesting M-Lab data from BigQuery. We recommend creating a separate account to use specifically for this purpose, rather than a personal account.

1. Create/Identify a Google account to use for your instance of Piecewise.

2. Subscribe that account to the [M-Lab Discuss Group](https://groups.google.com/a/measurementlab.net/forum/#!forum/discuss)

Once subscribed to M-Lab Discuss, **your account will be whitelisted to query the M-Lab dataset at no charge**.

### Configure an API project in the Google Developers console

Go to [Google Developers console](https://console.developers.google.com/project) and log in using the account that was whitelisted by M-Lab.

Create a Google-API project (or choose an already existing project) and turn on permissions for the BigQuery API.

![Create a project](images/dev-console-1.png)

![New project details](images/dev-console-2.png)

If you are using an account maintained by an organization, use of Google Apps APIs may need to be enabled by the organization's Google Apps domain administrator. If this is the case, you may see notification errors to this effect.

![Notification errors](images/dev-console-4.png)

If the project was created successfully, a notification should appear like the one below.

![Successful notification](images/dev-console-5.png)

Turn on billing for the project in Google console (**you will not be billed because your account is whitelisted, but BigQuery requires API applications to have billing enabled**)

![Enable billing image 1](images/dev-console-6.png)
![Enable billing image 2](images/dev-console-7.png)

Lastly, view your Project's Information details and make note the Project ID number. You'll use it later to configure your instance of Piecewise.

![View Project Information image 1](images/dev-console-8.png)
![View Project Information image 2](images/dev-console-9.png)

### Create a [MapBox](https://www.mapbox.com/) account if you intend to use MapBox base maps

Piecewise can currently use Open Street Maps or Mapbox base maps. If you intend to use Mapbox basemaps, you must have a Mapbox account.

## Next move on to [Configuring your instance for your location](config.md)
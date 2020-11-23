# Piecewise

A customizable online survey tool for running NDT tests.

## Requirements

- [Node.js](https://nodejs.org) of version `>=12`
- `npm`

## Structure

Piecewise is composed of 2 different parts:

- A [React](https://reactjs.org/)-based **frontend**.
- A [Koa](https://koajs.com)-based **backend** that renders & serves the
  frontend and exposes an API used by the frontend.

These parts are located here in this repository:

```
src/backend  # The backend components
src/common   # Common code and assets
src/frontend # The React frontend
```

## Configuration

Piecewise is configured via variables either specified in the environment or
defined in a `.env` file (see `env.example` for an example configuration that
may be edited and copied to `.env`).

The backend parses the following configuration variables:

```
PIECEWISE_LOG_LEVEL       # Logging level (default: error)
PIECEWISE_HOST            # The host Piecewise runs on (default: localhost)
PIECEWISE_PORT            # The port to bind to (default: 3000)
PIECEWISE_ADMIN_USERNAME  # The administrative user (default: 'admin')
PIECEWISE_ADMIN_PASSWORD  # The administrative password
PIECEWISE_VIEWER_USERNAME # (Optional) A user for viewing the results (default: viewer)
PIECEWISE_VIEWER_PASSWORD # (Optional) A password for the viewer user
PIECEWISE_DB_HOST         # Postgres database host (default: localhost)
PIECEWISE_DB_PORT         # Postgres port (default: 5432)
PIECEWISE_DB_DATABASE     # Postgres database name (default: piecewise)
PIECEWISE_DB_USERNAME     # Postgres user (default: piecewise)
PIECEWISE_DB_PASSWORD     # Postgres password
PIECEWISE_DB_POOL_MIN     # Postgres minimum connections (default: 0)
PIECEWISE_DB_POOL_MAX     # Postgres max connections (default: 10)
PIECEWISE_DB_TIMEOUT      # Postgres connection timeout (default: 0)
PIECEWISE_MAPBOX_KEY      # Mapbox API key

# OAuth2 (Optional, see below)
PIECEWISE_OAUTH_AUTH_URL  # The OAuth2 authorization endpoint to connect to
PIECEWISE_OAUTH_TOKEN_URL # The OAuth2 token endpoint to connect to
PIECEWISE_OAUTH_CLIENT_ID # Identifier associated w/ this Piecewise instance (generally the domain)
PIECEWISE_OAUTH_CLIENT_SECRET # Secret authenticating this Piecewise instance
PIECEWISE_OAUTH_CALLBACK_URL  # URL at which this PIECEWISE instance can be reached (generally https://<domain>/api/v1/oauth2/callback)
```

Additionally, we use the semi-standard `NODE_ENV` variable for defining test,
staging, and production. In development mode Piecewise uses sqlite3, but uses
Postgres in production.

## Deployment

### Standalone

First, clone this repository and from the root of the resulting directory
install Piecewise's dependencies:

```
npm install
```

Then, build all components:

```
npm run build
```

Create the database:

```
npm run db:migrations
```

and to optionally populate it with test data:

```
npm run db:seeds
```

And start the running processes (with necessary environment variables if not
defined in `.env`):

```
npm run start
```

(use `npm run start:dev` to run in development mode)

Additionally, components can be built or started individually using for example
`npm run build:backend`, etc. See commands in the `package.json` file for more commands.

### Docker

You can deploy this tool using [Docker](https://docker.io). There is an included
`docker-compose.yml` file that will allow you to run it in a production
configuration. First, clone the repo and from this directory run docker-compose:

```
docker-compose up --build -d
```

This will build the docker container from the current repository, download the
official Postgres docker image, and configure them both (the `-d` flag will
detach from the current shell so that you can leave it running, but you can omit
it in order to leave the log output attached).

If this is the first time you've run it on this system, you'll want to run the
database migrations to initialize the database:

```
docker-compose run piecewise npm run db:migrations
```

and then optionally seed the database with a default admin user:

```
docker-compose run piecewise npm run db:seeds
```

By default, it runs on [http://localhost:3000](http://localhost:3000), but you
can place it behind a proxy such as [Nginx](https://nginx.com) in order to
provide TLS support and other features.

## OAuth2 Support

Piecewise has optional support for utilizing OAuth2 for authentication. This has the effect of disabling the admin (and optionally, viewer) users as specified in the environment and utilizing users created in the OAuth2 provider. **This support was made and tested for use with [Piecewise-SaaS](https://github.com/m-lab/piecewise-saas), YMMV when using a different backend.**

Piecewise-SaaS takes care of configuring the OAuth2 parameters for the Piecewise instances it manages, but here is an example configuration for development purposes that can be used with an instance of Piecewise-SaaS running on the same host in a development configuration. In this setup, Piecewise-SaaS is running on port 3000, and Piecewise on port 3001:
```
PIECEWISE_PORT=3001 (both apps default to the same port, so we'll run on port 3001 instead)

PIECEWISE_OAUTH_AUTH_URL=http://localhost:3000/oauth2/authorize
PIECEWISE_OAUTH_TOKEN_URL=http://localhost:3000/oauth2/token
PIECEWISE_OAUTH_CLIENT_ID=piecewise1.localhost (matches a value in the development db seeds in the Piecewise-SaaS repo; would normally be the domain)
PIECEWISE_OAUTH_CLIENT_SECRET=secret (generally some random string generated by Piecewise-SaaS)
PIECEWISE_OAUTH_CALLBACK_URL=http://localhost:3001/api/v1/oauth2/callback
```

## Backups
To backup an instance of Piecewise running in a Docker container, run the following command:

```
docker exec <name of postgres container> pg_dumpall -c -U <database user, default piecewise> dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql
```

To restore:
```
cat <backup file>.sql | docker exec -t <name of postgres container> pg_dumpall -c -U <database user, default piecewise > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql
```

## Administration & Use
A [brief guide](https://github.com/m-lab/piecewise/wiki/Administrator-Guide) to using the Piecewise application's features is provided in the wiki.

## License

Piecewise is an open-source software project licensed under the Apache License
v2.0 by [Measurement Lab](https://measurementlab.net) and
[Throneless Tech](https://throneless.tech).

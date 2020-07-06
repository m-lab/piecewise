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
PIECEWISE_PORT        # The port that the backend is listening on (default: 3000)
PIECEWISE_ADMIN_USERNAME        # The administrative user (default: 'admin')
PIECEWISE_ADMIN_PASSWORD        # The administrative password
```

Additionally, we use the semi-standard `NODE_ENV` variable for defining test,
staging, and production.

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
`npm run build:backend`, `npm run start:worker`, etc.

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

## License

Piecewise is an open-source software project licensed under the Apache License
v2.0 by [Measurement Lab](https://measurementlab.net) and
[Throneless Tech](https://throneless.tech).

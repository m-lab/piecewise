# Koa React Form Template
A form template using Koa and React.

## Requirements
* [Node.js](https://nodejs.org) of version `>=10`
* `npm`
* Uses [Redis](https://redis.org) to store its state.

## Structure
Composed of 3 different parts:
* A [React](https://reactjs.org/)-based **frontend** that provides a standalone webform tool to submit tickets.
* A [Koa](https://koajs.com)-based **backend** that renders & serves the frontend and exposes an API used by the frontend. Form submissions sent to this API get entered into a work-queue in an instance of Redis.
* A standalone Javascript **worker** that consumes the work-queue and submits forms.

These parts are located here in this repository:
```
src/backend  # The backend components
src/common   # Common code and assets
src/frontend # The React frontend
src/worker   # The standalone worker
```

## Configuration
Koa React Form Template is configured via variables either specified in the environment or defined in a `.env` file (see `env.example` for an example configuration that may be edited and copied to `.env`).

The backend parses the following configuration variables:
```
FIXME_PORT        # The port that the backend is listening on (default: 3000)
FIXME_REDIS_HOST  # The host for the Redis instance (default: localhost)
FIXME_REDIS_PORT  # The port for Redis (default: 6379)
```
The worker parses the following configuration variables:
```
FIXME_REDIS_HOST   # The host for the Redis instance (default: localhost)
FIXME_REDIS_PORT   # The port for Redis (default: 6379)
FIXME_WORKER_QUEUE # The ID for the default queue the worker is processing (default: 0)
FIXME_URL   # The URL for the instance's API
FIXME_TOKEN # The authentication token for the instance
```
Additionally, we use the semi-standard `NODE_ENV` variable for defining test, staging, and production environments as well as [llog](https://github.com/mateodelnorte/llog) for setting logging verbosity.

## Deployment
### Standalone
First, clone this repository and from the root of the resulting directory install dependencies:
```
npm install
```
Then, build all three components:
```
npm run build
```
And start the running processes (with necessary environment variables if not defined in `.env`):
```
FIXME_URL="https://example.com/api/v1" FIXME_TOKEN="mytoken" npm run start
```
Additionally, components can be built or started individually using for example `npm run build:backend`, `npm run start:worker`, etc.

### Docker
TODO

## API
The backend exposes the following HTTP API:

| Endpoint          | Method | Returns                                 | Implemented?       |
| :------:          | :----: | :-----:                                 | :----------:       |
| `/api/v1/fixme` | `POST` | `{ item_id: '<UUID of new item>' }` | :heavy_check_mark: |

## License
[<img src="https://www.gnu.org/graphics/agplv3-155x51.png" alt="AGPLv3" >](http://www.gnu.org/licenses/agpl-3.0.html)

Koa React Form Template is a free software project licensed under the GNU Affero General Public License v3.0 (AGPLv3) by [Throneless Tech](https://throneless.tech).

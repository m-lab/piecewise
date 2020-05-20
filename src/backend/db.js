import Knex from 'knex';
import {
  client,
  connection,
  pool,
  acquireConnectionTimeout,
  debug,
  migrations,
  seeds,
  useNullAsDefault,
} from '../../knexfile.js';

export default Knex({
  client,
  connection,
  pool,
  acquireConnectionTimeout,
  debug,
  migrations,
  seeds,
  useNullAsDefault,
});

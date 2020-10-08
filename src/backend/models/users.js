import { validate } from '../../common/schemas/user.js';
import { BadRequestError } from '../../common/errors.js';
import config from '../config.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:users');

/**
 * Initialize the QueueManager data model
 *
 * @class
 */
export default class User {
  constructor(db) {
    this._db = db;
  }

  async create(user) {
    let data;
    try {
      data = await validate(user);
    } catch (err) {
      log.debug('Cannot create user: ', err);
      throw new BadRequestError('User information is not valid: ', err);
    }
    try {
      log.debug(`Creating user: ${user}`);
      const new_user = await this._db.transaction(async trx => {
        const query = {
          username: data.username,
          role_name: data.role_name,
        };

        log.debug('Inserting user');
        await trx('users').insert(query);

        return trx('users')
          .select()
          .where({ username: data.username })
          .first();
      });
      return new_user;
    } catch (err) {
      throw new BadRequestError('Failed to create user: ', err);
    }
  }

  async update(user) {
    let data;
    try {
      data = await validate(user);
    } catch (err) {
      log.debug('Cannot update user: ', err);
      throw new BadRequestError('User information is not valid: ', err);
    }
    try {
      log.debug(`Updating user: ${user}`);
      const updated_user = await this._db.transaction(async trx => {
        const query = {
          username: data.username,
          role_name: data.role_name,
        };

        log.debug('Updating user');
        await trx('users')
          .update(query, ['id', 'username', 'role_name'])
          .where({ username: data.username });

        return trx('users')
          .select()
          .where({ username: data.username })
          .first();
      });
      return updated_user;
    } catch (err) {
      throw new BadRequestError('Failed to create user: ', err);
    }
  }

  /**
   * Find user by Id
   *
   * @param {integer} id - Find user by id
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) {
    if (config.authStrategy === 'oauth2') {
      return this._db
        .select({
          id: 'users.id',
          username: 'users.username',
          role: 'users.role_name',
        })
        .from('users')
        .where({ 'users.id': parseInt(id) })
        .first();
    } else {
      if (id === 1) {
        return {
          id: 1,
          username: config.adminUsername,
          password: config.adminPassword,
          role: 'admins',
        };
      } else if (id === 2) {
        return {
          id: 2,
          username: config.viewerUsername,
          password: config.viewerPassword,
          role: 'viewers',
        };
      }
    }
  }

  /**
   * Find user by username
   *
   * @param {integer} username - Find user by username
   */
  // eslint-disable-next-line no-unused-vars
  async findByUsername(username) {
    if (config.authStrategy === 'oauth2') {
      return this._db
        .select({
          id: 'users.id',
          username: 'users.username',
          role: 'users.role_name',
        })
        .from('users')
        .where({ 'users.username': username })
        .first();
    } else {
      if (username === config.adminUsername) {
        return {
          id: 1,
          username: config.adminUsername,
          password: config.adminPassword,
          role: 'admins',
        };
      } else if (username === config.viewerUsername) {
        return {
          id: 2,
          username: config.viewerUsername,
          password: config.viewerPassword,
          role: 'viewers',
        };
      }
    }
  }

  /**
   * Find all users
   */
  async findAll() {
    if (config.authStrategy === 'oauth2') {
      return this._db
        .select({
          id: 'users.id',
          username: 'users.username',
          role: 'users.role_name',
        })
        .from('users');
    } else {
      return [
        {
          id: 1,
          username: config.adminUsername,
          password: config.adminPassword,
          role: 'admins',
        },
        {
          id: 2,
          username: config.viewerUsername,
          password: config.viewerPassword,
          role: 'viewers',
        },
      ];
    }
  }

  async isMemberOf(role, uid) {
    if (config.authStrategy === 'oauth2') {
      const user = await this._db
        .select({
          id: 'users.id',
          username: 'users.username',
          role: 'users.role_name',
        })
        .from('users')
        .where({ 'users.id': parseInt(uid) })
        .first();

      log.debug('User: ', user);
      log.debug('Role: ', role);
      return user.role ? user.role === role : false;
    } else {
      if ((role === 'admins' || role === 'editors') && uid === 1) return true;
      if (role === 'viewers' && uid === 2) return true;
      return false;
    }
  }

  /**
   * Stub for Oauth2 authentication
   */
  async findOrCreateUser(user) {
    log.debug('findOrCreateUser: ', user);
    try {
      const exists = await this.findByUsername(user.username);
      if (!exists) {
        log.debug('User does not exist, creating');
        const new_user = await this.create(user);
        return new_user;
      } else if (user.role_name !== exists.role) {
        log.debug('User role has changed, updating');
        const updated_user = await this.update(user);
        return updated_user;
      } else {
        log.debug('Returning existing user');
        return exists;
      }
    } catch (err) {
      throw new BadRequestError('Failed to create user: ', err);
    }
  }
}

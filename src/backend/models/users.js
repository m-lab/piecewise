import config from '../config.js';

/**
 * Initialize the QueueManager data model
 *
 * @class
 */
export default class User {
  /**
   * Find user by Id
   *
   * @param {integer} id - Find user by id
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) {
    // Just in case we add other methods, but right now only 2 users
    if (id === 1) {
      return {
        id: 1,
        username: config.admin_username,
        password: config.admin_password,
        role: 'admins',
      };
    } else if (id === 2) {
      return {
        id: 2,
        username: config.viewer_username,
        password: config.viewer_password,
        role: 'viewers',
      };
    }
  }

  /**
   * Find user by username
   *
   * @param {integer} username - Find user by username
   */
  // eslint-disable-next-line no-unused-vars
  async findByUsername(username) {
    // Just in case we add other methods, but right now only 1 user
    if (username === 'admin') {
      return {
        id: 1,
        username: config.admin_username,
        password: config.admin_password,
        role: 'admin',
      };
    } else if (username === 'viewer') {
      return {
        id: 2,
        username: config.viewer_username,
        password: config.viewer_password,
        role: 'viewer',
      };
    }
  }

  /**
   * Find all users
   */
  async findAll() {
    // Just in case we add other methods, but right now only 1 user
    return [
      {
        id: 1,
        username: config.admin_username,
        password: config.admin_password,
        role: 'admin',
      },
      {
        id: 2,
        username: config.viewer_username,
        password: config.viewer_password,
        role: 'viewer',
      },
    ];
  }
}

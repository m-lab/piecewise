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
    // Just in case we add other methods, but right now only 1 user
    return {
      id: 1,
      username: config.username,
      password: config.password,
    };
  }

  /**
   * Find user by username
   *
   * @param {integer} username - Find user by username
   */
  // eslint-disable-next-line no-unused-vars
  async findByUsername(username) {
    // Just in case we add other methods, but right now only 1 user
    return {
      id: 1,
      username: config.username,
      password: config.password,
    };
  }

  /**
   * Find all users
   */
  async findAll() {
    // Just in case we add other methods, but right now only 1 user
    return [
      {
        id: 1,
        username: config.username,
        password: config.password,
      },
    ];
  }
}

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

  /**
   * Find user by username
   *
   * @param {integer} username - Find user by username
   */
  // eslint-disable-next-line no-unused-vars
  async findByUsername(username) {
    // Just in case we add other methods, but right now only 1 user
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

  /**
   * Find all users
   */
  async findAll() {
    // Just in case we add other methods, but right now only 1 user
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

  async isMemberOf(group, uid) {
    if (group === 'admins' && uid === 1) return true;
    if (group === 'viewers' && uid === 2) return true;
    return false;
  }
}

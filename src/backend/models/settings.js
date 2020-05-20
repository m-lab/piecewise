import { validate } from '../../common/schemas/settings.js';
import { UnprocessableError } from '../../common/errors.js';

export default class FormManager {
  constructor(db) {
    this._db = db;
  }

  async create(setting) {
    try {
      await validate(setting);
    } catch (err) {
      throw new UnprocessableError('Failed to create setting: ', err);
    }
    return this._db
      .table('settings')
      .insert(setting)
      .returning('*');
  }

  async update(id, setting) {
    try {
      await validate(setting);
    } catch (err) {
      throw new UnprocessableError('Failed to update setting: ', err);
    }
    return this._db
      .table('settings')
      .update(setting)
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('settings')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find() {
    return this._db
      .table('settings')
      .where({ id: 1 })
      .first();
  }
}

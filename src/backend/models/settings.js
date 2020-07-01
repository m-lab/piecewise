export default class FormManager {
  constructor(db) {
    this._db = db;
  }

  async create(setting) {
    return this._db
      .table('settings')
      .insert(setting)
      .returning('*');
  }

  async update(id, setting) {
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

import { validate } from '../../common/schemas/submission.js';
import { UnprocessableError } from '../../common/errors.js';

export default class SubManager {
  constructor(db) {
    self._db = db('submissions');
  }

  async create(submission) {
    try {
      await validate(submission);
    } catch (err) {
      throw new UnprocessableError('Failed to create submission: ', err);
    }
    return self._db.insert(submission).returning('*');
  }

  async update(id, submission) {
    try {
      await validate(submission);
    } catch (err) {
      throw new UnprocessableError('Failed to update submission: ', err);
    }
    return self._db
      .update(submission)
      .where({ id: parseInt(id) })
      .returning('*');
  }

  delete(id) {
    return self._db
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  getById(id) {
    return self._db.select('*').where({ id: parseInt(id) });
  }
}

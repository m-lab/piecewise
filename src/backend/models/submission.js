import { BadRequestError } from '../../common/errors.js';

export default class SubManager {
  constructor(db) {
    this._db = db;
  }

  async create(submission, fid) {
    submission = submission.map(s => ({
      ...s,
      fields: JSON.stringify(s.fields),
    }));
    try {
      let submissions;
      await this._db.transaction(async trx => {
        let fids = [];
        if (fid) {
          fids = await trx('forms')
            .select('*')
            .where({ id: parseInt(fid) });
          if (fids.length === 0) {
            throw new BadRequestError('Invalid form ID.');
          }
        }
        submissions = await trx('submissions')
          .insert(submission)
          .returning('*');

        // workaround for sqlite
        if (Number.isInteger(submissions[0])) {
          submissions = await trx('submissions')
            .select('*')
            .where({ id: submissions[0] });
        }

        if (fids.length > 0) {
          const inserts = submissions.map(s => ({
            fid: fid[0],
            sid: s.id,
          }));
          await trx('form_submissions').insert(inserts);
        }
      });
      return submissions.map(s => ({ ...s, fields: JSON.parse(s.fields) }));
    } catch (err) {
      throw new BadRequestError('Failed to create submission: ', err);
    }
  }

  async update(id, submission) {
    try {
      let existing = false;
      await this._db.transaction(async trx => {
        existing = await trx('submissions')
          .select('*')
          .where({ id: parseInt(id) });

        submission = { fields: JSON.stringify(submission.fields) };
        if (Array.isArray(existing) && existing.length > 0) {
          await trx('submissions')
            .update(submission)
            .where({ id: parseInt(id) });
          existing = true;
        } else {
          await trx('submissions').insert({ ...submission, id: id });
          existing = false;
        }
      });
      return existing;
    } catch (err) {
      throw new BadRequestError(
        `Failed to update submission with ID ${id}: `,
        err,
      );
    }
  }

  async delete(id) {
    return this._db
      .table('submissions')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'id',
    from: from,
    to: to,
  }) {
    let rows = [];
    rows = await this._db
      .table('submissions')
      .select([
        'submissions.id as id',
        'submissions.created_at as date',
        'submissions.c2sRate as c2sRate',
        'submissions.s2cRate as s2cRate',
        'submissions.MinRTT as MinRTT',
        'submissions.latitude as latitude',
        'submissions.longitude as longitude',
        'submissions.fields as fields',
        'forms.id as form_id',
        'forms.fields as form_fields',
      ])
      .join('form_submissions', 'form_submissions.sid', 'submissions.id')
      .join('forms', 'form_submissions.fid', 'forms.id')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (asc) {
          queryBuilder.orderBy(sort_by, 'asc');
        } else {
          queryBuilder.orderBy(sort_by, 'desc');
        }

        if (start > 0) {
          queryBuilder.offset(start);
        }

        if (end && end > start) {
          queryBuilder.limit(end - start);
        }
      });

    return rows.map(r => {
      let fields = JSON.parse(r.fields);
      let form_fields = JSON.parse(r.form_fields);
      let merged_fields = fields.map(s => {
        for (let f of form_fields) {
          if (f.field_name && s.name === f.field_name) {
            s.label = f.label;
          }
        }
        return s;
      });
      delete r.form_fields;
      return { ...r, fields: merged_fields };
    });
  }

  async findById(id) {
    const submission = await this._db
      .table('submissions')
      .select('*')
      .where({ id: parseInt(id) })
      .first();
    console.log('***SUBMISSION***:', submission);
    return { ...submission, fields: JSON.parse(submission.fields) };
  }

  async findAll() {
    return this._db.table('submissions').select('*');
  }
}

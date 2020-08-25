import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('forms', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table.json('fields');
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(onUpdateTrigger(knex.context.client.config.client, 'forms')),
      ),
    knex.schema.createTable('form_submissions', table => {
      table.integer('fid').index();
      table
        .foreign('fid')
        .references('id')
        .inTable('forms');
      table.integer('sid').index();
      table
        .foreign('sid')
        .references('id')
        .inTable('submissions');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('forms'),
    knex.schema.dropTable('form_submissions'),
  ]);
}

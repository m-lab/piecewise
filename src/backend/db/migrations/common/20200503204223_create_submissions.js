import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return knex.schema
    .createTable('submissions', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table.json('fields');
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw(
        onUpdateTrigger(knex.context.client.config.client, 'submissions'),
      ),
    );
}

export function down(knex) {
  return knex.schema.dropTable('submissions');
}

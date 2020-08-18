import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return knex.schema
    .createTable('session_keys', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table.text('key');
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw(
        onUpdateTrigger(knex.context.client.config.client, 'session_keys'),
      ),
    );
}

export function down(knex) {
  return knex.schema.dropTable('session_keys');
}

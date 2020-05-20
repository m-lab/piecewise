import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return knex.schema
    .createTable('settings', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table.text('title');
      table.text('header');
      table.text('footer');
      table.text('color_one');
      table.text('color_two');
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw(onUpdateTrigger(knex.context.client.config.client, 'settings')),
    );
}

export function down(knex) {
  return knex.schema.dropTable('settings');
}

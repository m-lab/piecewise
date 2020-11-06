export async function up(knex) {
  await knex.schema.renameTable('submissions', 'oldSubmissions');
  await knex.schema.createTable('submissions', table => {
    table
      .increments('id')
      .primary()
      .unsigned();
    table.decimal('c2sRate', null);
    table.decimal('s2cRate', null);
    table.decimal('MinRTT', null);
    table.decimal('latitude', null);
    table.decimal('longitude', null);
    table.json('fields');
    table.timestamps(true, true);
  });
  await knex.insert(knex.select().from('oldSubmissions')).into('submissions');
  return knex.schema.dropTable('oldSubmissions');
}

export async function down(knex) {
  await knex.schema.renameTable('submissions', 'newSubmissions');
  await knex.schema.createTable('submissions', table => {
    table
      .increments('id')
      .primary()
      .unsigned();
    table.decimal('c2sRate');
    table.decimal('s2cRate');
    table.decimal('MinRTT');
    table.decimal('latitude');
    table.decimal('longitude');
    table.json('fields');
    table.timestamps(true, true);
  });
  await knex.insert(knex.select().from('newSubmissions')).into('submissions');
  return knex.schema.dropTable('newSubmissions');
}

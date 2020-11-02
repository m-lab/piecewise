export function up(knex) {
  return knex.schema
    .table('settings', t => t.dropColumn('logo'))
    .then(() => knex.schema.table('settings', t => t.binary('logo')));
}

export function down(knex) {
  return knex.schema
    .table('settings', t => t.dropColumn('logo'))
    .then(() => knex.schema.table('settings', t => t.string('logo')));
}

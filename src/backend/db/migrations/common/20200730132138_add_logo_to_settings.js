export function up(knex) {
  return knex.schema.table('settings', function(t) {
    t.string('logo');
  });
}

export function down(knex) {
  return knex.schema.table('settings', function(t) {
    t.dropColumn('logo');
  });
}

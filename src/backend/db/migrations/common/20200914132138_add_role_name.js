export function up(knex) {
  return knex.schema.table('users', function(t) {
    t.string('role_name');
  });
}

export function down(knex) {
  return knex.schema.table('users', function(t) {
    t.dropColumn('role_name');
  });
}

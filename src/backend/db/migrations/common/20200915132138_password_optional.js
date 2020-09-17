export function up(knex) {
  return knex.schema.table('users', function(t) {
    t.dropColumn('password');
  });
}

export function down(knex) {
  return knex.schema.table('users', function(t) {
    t.string('password').notNullable();
  });
}

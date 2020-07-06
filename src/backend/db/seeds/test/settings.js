export function seed(knex) {
  return knex('settings')
    .del()
    .then(function() {
      return knex('settings').insert([
        {
          id: 1,
          title: 'Piecewise',
          header: 'Welcome to Piecewise!',
          footer: 'Thank you for taking the survey!',
          color_one: '#333333',
          color_two: '#007bff',
        },
      ]);
    });
}

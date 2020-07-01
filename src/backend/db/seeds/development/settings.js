export function seed(knex) {
  return knex('settings')
    .del()
    .then(function() {
      return knex('settings').insert([
        {
          id: 1,
          title: '',
          header: '',
          footer: '',
          color_one: '#333333',
          color_two: '007bff',
        },
      ]);
    });
}

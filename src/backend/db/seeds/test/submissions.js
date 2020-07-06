export function seed(knex) {
  return knex('submissions')
    .del()
    .then(function() {
      // Inserts seed entries
      return Promise.all([
        knex('submissions').insert([
          {
            id: 1,
            c2sRate: 10.12345,
            s2cRate: 20.54321,
            MinRTT: 9,
            latitude: 38.889248,
            longitude: -77.050636,
            fields: JSON.stringify([
              {
                name: 'text_input_A0FD4103-DBEA-405F-BC18-B5B3C2EC93C2',
                value: 'Comcast',
              },
              {
                name: 'number_input_21EE006B-B777-452E-B2F3-94CB1BF66B49',
                value: '10',
              },
              {
                name: 'number_input_62F69300-9C51-423E-9C54-E9A65A7DB5CF',
                value: '10',
              },
            ]),
          },
        ]),
        knex('form_submissions').insert([{ sid: 1, fid: 1 }]),
      ]);
    });
}

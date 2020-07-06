export function seed(knex) {
  return knex('forms')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('forms').insert([
        {
          id: 1,
          fields: JSON.stringify([
            {
              id: '29A1A156-CDBB-47B2-9D53-023496E35B7B',
              element: 'Header',
              text: 'Header Text',
              static: true,
              required: false,
              bold: true,
              italic: false,
              content: 'Submit a survey response! ',
              canHavePageBreakBefore: true,
              canHaveAlternateForm: true,
              canHaveDisplayHorizontal: true,
              canHaveOptionCorrect: true,
              canHaveOptionValue: true,
              canPopulateFromApi: true,
              dirty: false,
            },
            {
              id: 'C0F5C59A-6F1A-4E27-B8FD-97971AFE9CFB',
              element: 'TextInput',
              text: 'Text Input',
              required: false,
              canHaveAnswer: true,
              canHavePageBreakBefore: true,
              canHaveAlternateForm: true,
              canHaveDisplayHorizontal: true,
              canHaveOptionCorrect: true,
              canHaveOptionValue: true,
              canPopulateFromApi: true,
              field_name: 'text_input_A0FD4103-DBEA-405F-BC18-B5B3C2EC93C2',
              label: 'What is your ISP? ',
              dirty: false,
            },
            {
              id: 'E8A8FC57-A969-401B-BA64-FDBB6963090B',
              element: 'NumberInput',
              text: 'Number Input',
              required: false,
              canHaveAnswer: true,
              canHavePageBreakBefore: true,
              canHaveAlternateForm: true,
              canHaveDisplayHorizontal: true,
              canHaveOptionCorrect: true,
              canHaveOptionValue: true,
              canPopulateFromApi: true,
              field_name: 'number_input_21EE006B-B777-452E-B2F3-94CB1BF66B49',
              label: 'What is your advertised download speed? ',
              dirty: false,
            },
            {
              id: '1AE11E83-E129-4C4D-BB93-DD5632C55121',
              element: 'NumberInput',
              text: 'Number Input',
              required: false,
              canHaveAnswer: true,
              canHavePageBreakBefore: true,
              canHaveAlternateForm: true,
              canHaveDisplayHorizontal: true,
              canHaveOptionCorrect: true,
              canHaveOptionValue: true,
              canPopulateFromApi: true,
              field_name: 'number_input_62F69300-9C51-423E-9C54-E9A65A7DB5CF',
              label: 'What is your advertised upload speed? ',
              dirty: false,
            },
          ]),
        },
      ]);
    });
}

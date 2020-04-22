import { FieldsV1 } from 'FIXME/fields';
import { validateData, fieldsToSchema } from 'FIXME/fields/src/validation';
import { UnprocessableError } from '../../common/errors.js';

export function validate(data) {
  const schema = fieldsToSchema(FieldsV1);
  let errors = validateData(schema, data);
  if (Array.isArray(errors) && errors.length) {
    errors = JSON.stringify(errors);
    throw new UnprocessableError(`Item validation error: ${errors}`);
  }
}

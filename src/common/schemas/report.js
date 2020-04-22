import { FieldsV1 } from '@digiresilience/waterbear-fields';
import { getSubmitterFields } from '@digiresilience/waterbear-fields/src/fields';
import {
  validateData,
  fieldsToSchema,
} from '@digiresilience/waterbear-fields/src/validation';
import { UnprocessableError } from '../../common/errors.js';

export function validate(data) {
  const submitterFields = getSubmitterFields(FieldsV1);
  const schema = fieldsToSchema(submitterFields);
  let errors = validateData(schema, data);
  if (Array.isArray(errors) && errors.length) {
    errors = JSON.stringify(errors);
    throw new UnprocessableError(`Report validation error: ${errors}`);
  }
}

import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const updateSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.number(),
      title: Joi.string(),
      header: Joi.string(),
      footer: Joi.string(),
      color_one: Joi.string(),
      color_two: Joi.string(),
      logo: Joi.binary(),
    }),
  )
  .min(1);

export async function validateUpdate(data) {
  try {
    data = Array.isArray(data) ? data : [data];
    const value = await updateSchema.validateAsync(data);
    console.log('+++++++++++++++++++++++++');
    console.log('value: ', value);
    console.log('+++++++++++++++++++++++++');
    return value;
  } catch (err) {
    console.log('+++++++++++++++++++++++++');
    console.log('Error: ', err);
    console.log('+++++++++++++++++++++++++');
    throw new UnprocessableError('Unable to validate JSON: ', err);
  }
}

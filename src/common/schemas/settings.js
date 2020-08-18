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
      logo: Joi.string(),
    }),
  )
  .min(1);

export async function validateUpdate(data) {
  console.log('validating....', data);
  try {
    data = Array.isArray(data) ? data : [data];
    const value = await updateSchema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate JSON: ', err);
  }
}

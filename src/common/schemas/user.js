import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const schema = Joi.object({
  id: Joi.number(),
  username: Joi.string(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  instance: Joi.string().optional(),
  instance_name: Joi.string().optional(),
  instance_domain: Joi.string().optional(),
  role: Joi.number().optional(),
  role_name: Joi.string(),
  email: Joi.string().optional(),
  phone: Joi.string().optional(),
  extension: Joi.string().optional(),
  isActive: Joi.number().optional(),
});

export async function validate(data) {
  try {
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate user JSON: ', err);
  }
}

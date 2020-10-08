import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const schema = Joi.object({
  id: Joi.number(),
  username: Joi.string(),
  firstName: Joi.string()
    .allow(null)
    .optional(),
  lastName: Joi.string()
    .allow(null)
    .optional(),
  instance: Joi.number()
    .allow(null)
    .optional(),
  instance_name: Joi.string()
    .allow(null)
    .optional(),
  instance_domain: Joi.string()
    .allow(null)
    .optional(),
  role: Joi.number()
    .allow(null)
    .optional(),
  role_name: Joi.string(),
  email: Joi.string()
    .allow(null)
    .optional(),
  phone: Joi.string()
    .allow(null)
    .optional(),
  extension: Joi.string()
    .allow(null)
    .optional(),
  isActive: Joi.boolean()
    .allow(null)
    .optional(),
});

export async function validate(data) {
  try {
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate user JSON: ', err);
  }
}

import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const schema = Joi.object({
  username: Joi.string(),
  password: Joi.string(),
  id: Joi.number(),
  role: Joi.number(),
});

// schema for users editing their own account
const userSchema = Joi.object({
  username: Joi.string(),
  password: Joi.string(),
  id: Joi.number(),
  role: Joi.number(),
});

export async function validate(data, user = false) {
  try {
    let value;
    if (user) {
      value = await userSchema.validateAsync(data);
    } else {
      value = await schema.validateAsync(data);
    }
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate user JSON: ', err);
  }
}

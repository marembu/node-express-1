const joi = require('@hapi/joi');

const userIdSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createUserSchema = {
  name: joi.string().max(100).required(),
  email: joi.email().require(),
  password: joi.string().email().require(),
  isAdmin: joi.bool(),
};

module.exports = {
  userIdSchema,
  createUserSchema,
};

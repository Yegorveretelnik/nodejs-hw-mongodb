import Joi from 'joi';

const contactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(5).max(20).required(),
  isFavourite: Joi.boolean(),
});

const contactUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  email: Joi.string().email(),
  phone: Joi.string().min(5).max(20),
  isFavourite: Joi.boolean(),
}).min(1);

export { contactSchema, contactUpdateSchema };

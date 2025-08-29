const Joi = require("joi");

const validateProfileUpdate = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    weight: Joi.number().min(1).optional(),
    height: Joi.number().min(1).optional(),
    gender: Joi.string().valid("male", "female").optional(),
    age: Joi.number().min(1).max(120).optional(),
    email: Joi.forbidden(), // ❌ Prevent email updates
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

module.exports = { validateProfileUpdate };

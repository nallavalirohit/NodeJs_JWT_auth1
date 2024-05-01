const Joi = require('@hapi/joi');

const authSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(4).required()
});

// we are exporting an object with authSchema instead of directly exporting authSchema is because we can export multiple schemas in an object. but, in this case, we only have authSchema.
module.exports = {
    authSchema
}
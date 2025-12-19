const Joi = require('joi');


const motoSchema = Joi.object({
    nomClient: Joi.string().trim().min(1).required(),
    pk_configurationMoto: Joi.number().required(),
    dateLivraison: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
});

module.exports = (req, res, next) => {
    const { error } = motoSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }
    next();
};

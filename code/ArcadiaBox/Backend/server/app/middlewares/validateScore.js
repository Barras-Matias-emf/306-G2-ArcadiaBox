const Joi = require('joi');

// Définir le schéma de validation pour les scores
const scoreSchema = Joi.object({
    playerName: Joi.string().trim().min(1).required(), // Nom du joueur (obligatoire, non vide)
    score: Joi.number().integer().min(0).required(),   // Score (obligatoire, entier >= 0)
    game: Joi.string().trim().min(1).required()        // Nom du jeu (obligatoire, non vide)
});

module.exports = (req, res, next) => {
    const { error } = scoreSchema.validate(req.body); // Valider les données du corps de la requête
    if (error) {
        return res.status(400).json({
            error: error.details[0].message // Retourner un message d'erreur si la validation échoue
        });
    }
    next(); // Passer au middleware suivant si la validation réussit
};
const scoreService = require('../services/scoreService');

/**
 * @swagger
 * components:
 *   schemas:
 *     Score:
 *       type: object
 *       properties:
 *         pseudo:
 *           type: string
 *           description: Nom du joueur.
 *         score:
 *           type: integer
 *           description: Score obtenu.
 *         game:
 *           type: string
 *           description: Nom du jeu.
 */

/**
 * @swagger
 * tags:
 *   name: Scores
 *   description: Gestion des scores.
 */

/**
 * @swagger
 * /score/allscores:
 *   get:
 *     tags: [Scores]
 *     summary: Récupère tous les scores.
 *     responses:
 *       200:
 *         description: Liste des scores.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Score'
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /score/addscore:
 *   post:
 *     tags: [Scores]
 *     summary: Ajoute un nouveau score.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Score'
 *     responses:
 *       201:
 *         description: Score ajouté avec succès.
 *       400:
 *         description: Données invalides.
 *       500:
 *         description: Erreur serveur.
 */

const getAllScores = async (req, res) => {
    try {
        const scores = await scoreService.getAllScores();
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const addScore = async (req, res) => {
    try {
        const { pseudo, score, game } = req.body;
        const newScore = await scoreService.addScore(pseudo, score, game);
        console.log(newScore);
        res.status(201).json(newScore);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = {
    getAllScores,
    addScore,
};
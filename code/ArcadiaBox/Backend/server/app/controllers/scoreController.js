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

/**
 * @swagger
 * /score/top/{game}:
 *   get:
 *     tags: [Scores]
 *     summary: Récupère les 10 meilleurs scores pour un jeu spécifique.
 *     parameters:
 *       - in: path
 *         name: game
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du jeu (Mario, Snake, Tetris).
 *         example: Mario
 *     responses:
 *       200:
 *         description: Liste des 10 meilleurs scores pour le jeu.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Score'
 *       404:
 *         description: Aucun score trouvé pour ce jeu.
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

const getTopScoresByGame = async (req, res) => {
    try {
        // ✅ Décoder le paramètre pour gérer les espaces et caractères spéciaux
        const gameName = decodeURIComponent(req.params.game);
        
        console.log('🎮 [API] Recherche scores pour:', gameName);
        
        const scores = await scoreService.getTopScoresByGame(gameName);
        
        if (scores.length === 0) {
            return res.status(404).json({ 
                message: `Aucun score trouvé pour le jeu "${gameName}".` 
            });
        }
        
        res.json(scores);
    } catch (error) {
        console.error('Erreur lors de la récupération des top scores:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = {
    getAllScores,
    addScore,
    getTopScoresByGame,
};
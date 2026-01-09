const express = require("express");
const router = express.Router();


const scoreController = require("../controllers/scoreController");
const validateScore = require("../middlewares/validateScore");

/**
 * @swagger
 * /score/allscores:
 *   get:
 *     summary: Récupère tous les scores.
 *     responses:
 *       200:
 *         description: Liste des scores.
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /score/addscore:
 *   post:
 *     summary: Ajoute un nouveau score.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo:
 *                 type: string
 *               score:
 *                 type: integer
 *               game:
 *                 type: string
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
 *     summary: Récupère les 10 meilleurs scores pour un jeu spécifique.
 *     parameters:
 *       - in: path
 *         name: game
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du jeu.
 *     responses:
 *       200:
 *         description: Liste des 10 meilleurs scores.
 *       404:
 *         description: Aucun score trouvé.
 *       500:
 *         description: Erreur serveur.
 */

router.get("/allscores", scoreController.getAllScores);
router.get("/top/:game", scoreController.getTopScoresByGame);
router.post("/addscore",validateScore, scoreController.addScore);


module.exports = router;

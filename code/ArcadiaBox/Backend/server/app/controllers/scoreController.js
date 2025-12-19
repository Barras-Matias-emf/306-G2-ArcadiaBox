const scoreService = require('../services/scoreService');


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
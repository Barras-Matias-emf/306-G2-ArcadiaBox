const scoreService = require('../services/scoreService');


const getAllScores = async (req, res) => {
    try {
        const scores = await scoreService.getAllScores();
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};




module.exports = {
    getAllScores
};
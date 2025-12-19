const express = require("express");
const router = express.Router();


const scoreController = require("../controllers/scoreController");
const validateScore = require("../middlewares/validateScore");



router.get("/allscores", scoreController.getAllScores);
router.post("/addscore",validateScore, scoreController.addScore);


module.exports = router;

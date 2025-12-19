const express = require("express");
const router = express.Router();


const scoreController = require("../controllers/scoreController");



router.get("/allscores", scoreController.getAllScores);


module.exports = router;

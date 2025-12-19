const express = require("express");
const router = express.Router();

const scoreRoutes = require("./scoreRoutes");




router.use("/score", scoreRoutes);


module.exports = router;
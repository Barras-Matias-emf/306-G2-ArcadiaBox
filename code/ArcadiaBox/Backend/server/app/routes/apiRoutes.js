const express = require("express");
const router = express.Router();

const scoreRoutes = require("./scoreRoutes");

/**
 * @swagger
 * /score:
 *   get:
 *     summary: Routes liées aux scores.
 *     description: Inclut toutes les routes pour gérer les scores.
 */

router.use("/score", scoreRoutes);

module.exports = router;
const pool = require("../../config/database.js");

/**
 * Récupère tous les scores depuis la base de données.
 * @returns {Promise<Array>} Liste des scores.
 */
const getAllScores = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(`
      SELECT 
        s.pk_score,
        s.score,
        s.pseudo,
        g.name AS game
      FROM t_scores s
      JOIN t_games g ON s.fk_game = g.pk_game
      ORDER BY g.name, s.score DESC
    `);

    return rows;
  } catch (error) {
    console.error("Erreur lors de la récupération des scores :", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Ajoute un nouveau score dans la base de données.
 * @param {string} pseudo - Nom du joueur.
 * @param {number} score - Score obtenu.
 * @param {string} game - Nom du jeu.
 * @returns {Promise<Object>} Résultat de l'insertion.
 */
const addScore = async (pseudo, score, game) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [gameRows] = await connection.query(
      "SELECT pk_game FROM t_games WHERE name = ?",
      [game]
    );
    if (gameRows.length === 0) {
      throw new Error(`Game with name "${game}" not found.`);
    }
    const pk_game = gameRows[0].pk_game;
    // Insérer le score dans la table t_scores
    const [rows] = await connection.query(
      "INSERT INTO t_scores (score, pseudo, fk_game) VALUES (?, ?, ?)",
      [score, pseudo, pk_game]
    );
    await connection.commit();
    return rows;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erreur lors de l'ajout du score :", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getAllScores,
  addScore,
};

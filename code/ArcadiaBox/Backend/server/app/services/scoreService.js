const pool = require("../../config/database.js");

const getAllScores = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(`
      SELECT 
        s.pk_score,
        s.score,
        p.pseudo AS player,
        g.name AS game
      FROM t_scores s
      JOIN t_player p ON s.fk_player = p.pk_player
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

module.exports = {
  getAllScores,
};

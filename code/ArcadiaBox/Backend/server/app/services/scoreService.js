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

const addScore = async (playerName, score, game) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let pk_player;
    //le créer
    const [insertPlayerResult] = await connection.query(
      "INSERT INTO t_player (pseudo) VALUES (?)",
      [playerName]
    );
    pk_player = insertPlayerResult.insertId; // Récupérer l'identifiant du joueur créé
    // Vérifier si le jeu existe
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
      "INSERT INTO t_scores (score, fk_player, fk_game) VALUES (?, ?, ?)",
      [score, pk_player, pk_game]
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

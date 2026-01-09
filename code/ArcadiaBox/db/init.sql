DROP TABLE IF EXISTS t_scores;
DROP TABLE IF EXISTS t_games;


-- =========================
-- Table des jeux
-- =========================
CREATE TABLE t_games (
    pk_game TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (pk_game)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- Table des scores
-- =========================
CREATE TABLE t_scores (
    pk_score INT UNSIGNED NOT NULL AUTO_INCREMENT,
    score INT NOT NULL,
    pseudo VARCHAR(50) NOT NULL,
    fk_game TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (pk_score),
    FOREIGN KEY (fk_game) REFERENCES t_games(pk_game) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Jeux
INSERT INTO t_games (name) VALUES
('Pac-Man'),
('Super Mario Bros'),
('Tetris');


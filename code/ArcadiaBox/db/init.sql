DROP TABLE IF EXISTS t_scores;
DROP TABLE IF EXISTS t_player;
DROP TABLE IF EXISTS t_games;

-- =========================
-- Table des joueurs
-- =========================
CREATE TABLE t_player (
    pk_player TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    pseudo VARCHAR(50) NOT NULL,
    PRIMARY KEY (pk_player)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    fk_player TINYINT UNSIGNED NOT NULL,
    fk_game TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (pk_score),
    FOREIGN KEY (fk_player) REFERENCES t_player(pk_player) ON DELETE CASCADE,
    FOREIGN KEY (fk_game) REFERENCES t_games(pk_game) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- Données fictives
-- =========================

-- Joueurs
INSERT INTO t_player (pseudo) VALUES
('Alice'),
('Bob'),
('Charlie'),
('Diana');

-- Jeux
INSERT INTO t_games (name) VALUES
('Space Invaders'),
('Pac-Man'),
('Tetris');

-- Scores
INSERT INTO t_scores (score, fk_player, fk_game) VALUES
(1200, 1, 1),  -- Alice - Space Invaders
(980,  2, 1),  -- Bob - Space Invaders
(1500, 3, 1),  -- Charlie - Space Invaders

(3000, 1, 2),  -- Alice - Pac-Man
(2750, 4, 2),  -- Diana - Pac-Man

(4200, 2, 3),  -- Bob - Tetris
(5000, 3, 3),  -- Charlie - Tetris
(4600, 4, 3);  -- Diana - Tetris

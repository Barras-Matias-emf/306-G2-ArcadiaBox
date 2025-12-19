-- Supprimer la base si elle existe déjà
DROP DATABASE IF EXISTS db_HyperByke;

-- Créer la base
CREATE DATABASE db_HyperByke;
USE db_HyperByke;

-- Table Employer (avec rôle)
DROP TABLE IF EXISTS Employer;
CREATE TABLE Employer (
    pk_employer INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('garagiste', 'logisticien') NOT NULL
);

-- Insertion de quelques employés
INSERT INTO Employer (username, password, role) VALUES
('jdupont', '$2b$10$sHeGSdtSIT8Ac2aC8LpsX.PdfdomEl6kBcCUCz5YI2NsDi4ZStPlO', 'garagiste'),
('mleblanc', '$2b$10$wYZHcbyPwuw6QoTsBSqJb.vnh/zDhhzR61Ni28ErJ5YkBwf6tb1FK', 'logisticien'),
('afernandez', '$2b$10$bGGrv8OJ0Xq8VU9DF4sMCOLIJw8oB2Ah5tSyY37cfTrAmqbX1eTfq', 'garagiste');

-- Table ConfigurationMoto
DROP TABLE IF EXISTS ConfigurationMoto;
CREATE TABLE ConfigurationMoto (
    pk_configurationMoto INT AUTO_INCREMENT PRIMARY KEY,
    nomModele VARCHAR(100) NOT NULL
);

-- Données de base pour ConfigurationMoto
INSERT INTO ConfigurationMoto (nomModele) VALUES
('yamaha R1'),
('yamaha MT-07'),
('kawasaki ZX-6R');

-- Table Piece
DROP TABLE IF EXISTS Piece;
CREATE TABLE Piece (
    pk_piece INT AUTO_INCREMENT PRIMARY KEY,
    nomPiece VARCHAR(100) NOT NULL,
    quantiteStock INT NOT NULL DEFAULT 0
);

-- Données de base pour Piece
INSERT INTO Piece (nomPiece, quantiteStock) VALUES
('Guidon', 10),
('Selle', 15),
('Rétroviseur', 30),
('Pneu avant', 20),
('Pneu arrière', 20),
('Frein avant', 25),
('Frein arrière', 25),
('Amortisseur', 12),
('Phare avant', 18),
('Batterie', 8);

-- Table Moto
DROP TABLE IF EXISTS Moto;
CREATE TABLE Moto (
    pk_moto INT AUTO_INCREMENT PRIMARY KEY,
    fk_configurationMoto INT,
    nomClient VARCHAR(100) NOT NULL,
    dateLivraison DATE,
    FOREIGN KEY (fk_configurationMoto) REFERENCES ConfigurationMoto(pk_configurationMoto)
);

-- Données de base pour Moto
INSERT INTO Moto (fk_configurationMoto, nomClient, dateLivraison) VALUES
(1, 'Paul Martin', '2025-07-01'),
(2, 'Sophie Dubois', '2025-07-15'),
(3, 'Kevin Leroy', '2025-08-01');

-- Table de relation tr_configurationMoto_piece avec quantité
DROP TABLE IF EXISTS tr_configurationMoto_piece;
CREATE TABLE tr_configurationMoto_piece (
    fk_configurationMoto INT,
    fk_piece INT,
    quantite INT NOT NULL,
    PRIMARY KEY (fk_configurationMoto, fk_piece),
    FOREIGN KEY (fk_configurationMoto) REFERENCES ConfigurationMoto(pk_configurationMoto) ON DELETE CASCADE,
    FOREIGN KEY (fk_piece) REFERENCES Piece(pk_piece) ON DELETE CASCADE
);

-- Données de base pour tr_configurationMoto_piece
INSERT INTO tr_configurationMoto_piece (fk_configurationMoto, fk_piece, quantite) VALUES
(1, 1, 1),  -- yamaha R1 - Guidon
(1, 2, 1),  -- yamaha R1 - Selle
(1, 4, 1),  -- yamaha R1 - Pneu avant
(1, 5, 1),  -- yamaha R1 - Pneu arrière
(2, 1, 1),  -- yamaha MT-07 - Guidon
(2, 3, 2),  -- yamaha MT-07 - Rétroviseur
(2, 6, 1),  -- yamaha MT-07 - Frein avant
(2, 7, 1),  -- yamaha MT-07 - Frein arrière
(3, 1, 1),  -- kawasaki ZX-6R - Guidon
(3, 8, 2),  -- kawasaki ZX-6R - Amortisseur
(3, 9, 1);  -- kawasaki ZX-6R - Phare avant

-- Table de relation tr_moto_piece avec quantité
DROP TABLE IF EXISTS tr_moto_piece;
CREATE TABLE tr_moto_piece (
    fk_moto INT,
    fk_piece INT,
    quantite INT NOT NULL,
    PRIMARY KEY (fk_moto, fk_piece),
    FOREIGN KEY (fk_moto) REFERENCES Moto(pk_moto) ON DELETE CASCADE,
    FOREIGN KEY (fk_piece) REFERENCES Piece(pk_piece) ON DELETE CASCADE
);

-- Données de base pour tr_moto_piece (exemple des pièces effectivement montées)
INSERT INTO tr_moto_piece (fk_moto, fk_piece, quantite) VALUES
(1, 1, 1),
(1, 2, 1),
(1, 4, 1),
(1, 5, 1),
(2, 1, 1),
(2, 3, 2),
(2, 6, 1),
(2, 7, 1),
(3, 1, 1),
(3, 8, 2),
(3, 9, 1);

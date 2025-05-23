CREATE DATABASE IF NOT EXISTS Cryostar;

USE Cryostar;

CREATE TABLE IF NOT EXISTS puntaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    puntuacion INT NOT NULL,
    dificultad VARCHAR(50),
    nivel INT
);
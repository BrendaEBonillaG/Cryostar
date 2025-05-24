<?php
// Configuración de la base de datos
$host = 'localhost';
$usuario = 'root';
$contrasena = '';
$basededatos = 'Cryostar';

// Crear conexión
$conn = new mysqli($host, $usuario, $contrasena, $basededatos);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Leer datos JSON enviados desde el navegador
$data = json_decode(file_get_contents("php://input"), true);

// Obtener datos
$nombre = $conn->real_escape_string($data['nombre']);
$puntuacion = (int)$data['puntuacion'];
$dificultad = $conn->real_escape_string($data['dificultad']);
$nivel = (int)$data['nivel'];

// Insertar en la base de datos
$sql = "INSERT INTO puntaje (nombre, puntuacion, dificultad, nivel) VALUES ('$nombre', $puntuacion, '$dificultad', $nivel)";

if ($conn->query($sql) === TRUE) {
    echo "Puntaje guardado correctamente";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
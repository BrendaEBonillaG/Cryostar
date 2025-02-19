<?php
header('Content-Type: application/json');

// Simulación de una API para obtener puntuaciones
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        ['username' => 'Player1', 'score' => 100],
        ['username' => 'Player2', 'score' => 80],
    ]);
}

// Simulación de una API para guardar puntuaciones
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['username']) && isset($input['score'])) {
        // Aquí podrías guardar los datos en la base de datos
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
}
?>

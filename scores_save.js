// Arreglo para almacenar las puntuaciones
let highScores = [];

// Función para guardar la puntuación del jugador
function saveScore() {
  const playerName = document.getElementById('playerName').value;
  const playerScore = 3200; // Aquí puedes poner el puntaje real del jugador

  if (playerName) {
    // Añadir la puntuación y el nombre al arreglo
    highScores.push({ name: playerName, score: playerScore });
    
    // Ordenar las puntuaciones de mayor a menor
    highScores.sort((a, b) => b.score - a.score);
    
    // Limitar el arreglo a las 5 mejores puntuaciones
    highScores.splice(5);

    // Mostrar las puntuaciones actualizadas
    displayScores();

    alert("¡Puntuación guardada!");

    // Redirigir al menú principal
    window.location.href = "menu.html"; 
  } else {
    alert("Por favor ingresa tu nombre.");
  }
}

// Función para mostrar las puntuaciones en la lista
function displayScores() {
  const scoreList = document.getElementById('scoreList');
  scoreList.innerHTML = ''; // Limpiar la lista actual

  // Recorrer el arreglo de puntuaciones y mostrarlas
  highScores.forEach(score => {
    const scoreElement = document.createElement('li');
    scoreElement.textContent = `${score.name}: ${score.score}`;
    scoreList.appendChild(scoreElement);
  });
}

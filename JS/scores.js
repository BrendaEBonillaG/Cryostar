// Ejemplo de puntuaciones guardadas
const highScores = [
    { name: 'Jugador 1', score: 5000 },
    { name: 'Jugador 2', score: 4500 },
    { name: 'Jugador 3', score: 4000 },
    { name: 'Jugador 4', score: 3500 },
    { name: 'Jugador 5', score: 3000 },
  ];
  
  // Función para mostrar las puntuaciones en la pantalla
  function displayScores() {
    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = ''; // Limpiar la lista antes de agregar las nuevas puntuaciones
  
    highScores.forEach((score, index) => {
      const scoreItem = document.createElement('li');
      scoreItem.textContent = `${index + 1}. ${score.name} - ${score.score} puntos`;
      scoreList.appendChild(scoreItem);
    });
  }
 
  // Función para regresar al menú principal
  function backToMenu() {
    window.location.href = "menu.html"; // Aquí iría la lógica para volver al menú principal
  }
  
  // Inicializar la pantalla con las puntuaciones
  displayScores();
  
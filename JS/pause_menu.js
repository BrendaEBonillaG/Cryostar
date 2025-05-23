// Función para reanudar el juego
function resumeGame() {
  // Reanudar redirigiendo a la partida (puedes cambiar la ruta si es distinta)
  window.location.href = "Nivel1.html";
}

  
  // Función para reiniciar el juego
function restartGame() {
  const confirmRestart = confirm("¿Estás seguro de que deseas reiniciar el juego?");
  if (confirmRestart) {
    window.location.href = "Nivel1.html"; // Reinicia el nivel
  }
}

  
  // Función para abrir configuraciones
  function openSettings() {
    alert("Abriendo configuración...");
    // Aquí iría la lógica para redirigir o mostrar el menú de configuración.
    window.location.href = "Configuracion.html";
  }
  
  // Función para salir al menú principal
  function exitToMainMenu() {
    const confirmExit = confirm("¿Estás seguro de que deseas salir al menú principal?");
    if (confirmExit) {
      alert("Saliendo al menú principal...");
      // Aquí iría la lógica para regresar al menú principal.
      window.location.href = "Menu.html";
    }
  }
  
// Función para reanudar el juego
function resumeGame() {
    alert("Reanudando el juego...");
    // Aquí iría la lógica para cerrar el menú y reanudar el juego.
  }
  
  // Función para reiniciar el juego
  function restartGame() {
    const confirmRestart = confirm("¿Estás seguro de que deseas reiniciar el juego?");
    if (confirmRestart) {
      alert("Reiniciando el juego...");
      // Aquí iría la lógica para reiniciar el juego.
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
  
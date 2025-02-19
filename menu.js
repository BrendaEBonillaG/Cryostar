document.getElementById('startGame').addEventListener('click', () => {
    alert('Iniciando el juego...');
    // Aquí puedes redirigir a la pantalla principal del juego
     window.location.href = "Jugador.html";
  });
  
  document.getElementById('settings').addEventListener('click', () => {
    alert('Abriendo configuración...');
    // Aquí puedes abrir la sección de configuración
    window.location.href = "Configuracion.html";
  });
  
  document.getElementById('credits').addEventListener('click', () => {
    alert('Mostrando créditos...');
    // Aquí puedes mostrar una pantalla o popup con los créditos
  });
  
  document.getElementById('scores').addEventListener('click', () => {
    alert('Abriendo puntuaciones...');
    // Aquí puedes abrir la sección de configuración
    window.location.href = "Puntuacion.html";
  });
  
  document.getElementById('exit').addEventListener('click', () => {
    alert('Saliendo del juego...');
    // Nota: "Salir" es más común en aplicaciones de escritorio.
    // En la web, puedes cerrar la pestaña si es necesario (pero no recomendado por UX).
    window.location.href = "https://www.google.com";
    
  });



  
  
// Actualiza el valor mostrado junto a la barra deslizante
function updateSliderValue(spanId, value) {
    document.getElementById(spanId).textContent = `${value}%`;
  }
  
  // Lógica para guardar la configuración
  function saveSettings() {
    const volume = document.getElementById('volume').value;
    const music = document.getElementById('music').value;
    const brightness = document.getElementById('brightness').value;
    const subtitles = document.getElementById('subtitles').checked;
    const colorMode = document.getElementById('color-mode').checked;
  
    alert(`
      Configuración guardada:
      - Volumen General: ${volume}%
      - Volumen de Música: ${music}%
      - Brillo: ${brightness}%
      - Subtítulos: ${subtitles ? 'Activados' : 'Desactivados'}
      - Modo Daltónico: ${colorMode ? 'Activado' : 'Desactivado'}
    `);
  
    // Aquí puedes implementar la lógica para guardar las configuraciones
  }
  
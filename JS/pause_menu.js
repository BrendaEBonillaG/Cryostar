let animacionID;
let juegoPausado = false;

// Asociar el botón de pausa btnPausa
document.addEventListener('DOMContentLoaded', () => {
  const btnPausa = document.getElementById('btnPausa');
  btnPausa.addEventListener('click', () => {
    juegoPausado = true;
    document.getElementById('pause-menu').style.display = 'flex';
    cancelAnimationFrame(animacionID); // Detener animación
  });
});

// Estas funciones deben estar en el ámbito global:
window.resumeGame = function () {
  juegoPausado = false;
  document.getElementById('pause-menu').style.display = 'none';
  window.animate(); // Reanudar animación
};

window.restartGame = function () {
  const confirmRestart = confirm("¿Estás seguro de que deseas reiniciar?");
  if (confirmRestart) location.reload();
};

window.exitToMainMenu = function () {
  const confirmExit = confirm("¿Salir al menú principal?");
  if (confirmExit) window.location.href = "Menu.html";
};

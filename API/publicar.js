// Inicializar el SDK de Facebook
window.fbAsyncInit = function() {
    FB.init({
        appId      : '1174589454296108', // Reemplaza con tu App ID
        cookie     : true,
        xfbml      : true,
        version    : 'v22.0' // Asegúrate de usar la versión correcta
    });
};

// Función para enviar el mensaje
function publicarMensaje() {
    const mensaje = "Mi puntaje en Cryostar es de: 18999 puntos"; // Mensaje predeterminado

    FB.api(
        "/122103685574006913/feed", // Reemplaza con tu ID de página
        "POST",
        {
            message: mensaje,
            access_token: "EAAQsSGsuJCwBO9yKRWUmW310ThrCNbjXiLULzaYvtBE2ZBo5z7NksqYp9TVaJJlAKZBM0uxeuVhqJXByq3e4lbZC9EO8zVNzWIZA2TlXWbP0ZAhKA2JxGEfZC8ZAbEY6afnOs6jQ8ZBjARiGNrAs9GSI5YdUwGWwN5PjtfOpHJlZCW2ZBtx69MZATJRBYjIkVKypKTVJsGDWCdnJxvFLUThcRMPEZA9NqQZDZD"
        },
        function(response) {
            if (response && !response.error) {
                alert("Publicación creada con éxito!");
            } else {
                alert("Error al crear la publicación: " + response.error.message);
            }
        }
    );
}

// Asignar el evento al botón
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('enviar').addEventListener('click', publicarMensaje);
});
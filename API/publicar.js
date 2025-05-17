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
            access_token: "EAAH2jyiC4pYBOzldiZCVgnetsVcfiFt4fLRKz2HnVQwIWTAcMLRx8ZBtOwqVdSFtloO6NMhan48uh1ZAOL6hOv3gY0LZAtL8cl3uZC1y5M0fjI40fgf14Lpw1nRtkmx6SiOKXoX8mR3tQOlYZBdW5r1qbp68LGQjZCSxIB4wsfiA4oSHMIOSEzn66n7Fn4AUouXX9Wv4Lr30yndTjVMAvrSm4p3csAZCwA8EbwptS4dZBUhsIlCQKhZCDz6u757WUZD"
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
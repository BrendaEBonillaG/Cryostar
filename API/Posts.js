// Inicializar el SDK de Facebook
window.fbAsyncInit = function() {
    FB.init({
        appId      : '552569697133206', // Reemplaza con tu App ID
        cookie     : true,
        xfbml      : true,
        version    : 'v22.0' // Asegúrate de usar la versión correcta
    });
};

// Función para obtener y mostrar las publicaciones
function obtenerPublicaciones() {
    FB.api(
        "/9214317305329274/posts", // Reemplaza con tu ID de página
        {
            access_token: "EAAH2jyiC4pYBOygynq7uq2wBIZCEjMxcvg6w7YOLONheiUZCdOqrRfqnyFIUJA9BSs0Ye4VTeyGMSfvuNmMKcjRAU8JKJOO7RXZBqeCZCoxDVrmTEoQeuM7kZBZAzVBmHtnbHWZAT7ioke6jZAjHGR9Je7jKxKiWZAckmm4PZCaOmLKlSiIX6jrPYtBO2UYgs9ZCKesjt4duQNMDfeSXDjOdgZDZD"
        },
        function(response) {
            if (response && !response.error) {
                mostrarPublicaciones(response.data);
            } else {
                console.error("Error al obtener publicaciones: " + response.error.message);
            }
        }
    );
}

// Función para mostrar la publicación más reciente en el front-end
function mostrarPublicaciones(publicaciones) {
    const listaPublicaciones = document.getElementById('lista-publicaciones');
    listaPublicaciones.innerHTML = ''; // Limpiar la lista antes de agregar nuevas publicaciones

    if (publicaciones.length > 0) {
        const publicacionReciente = publicaciones[0]; // Tomar solo la más reciente
        const li = document.createElement('li');
        li.textContent = publicacionReciente.message || "error en la actualizacion del puntaje"; // Manejar publicaciones sin mensaje
        listaPublicaciones.appendChild(li);
    } else {
        const li = document.createElement('li');
        li.textContent = "No hay puntajes disponibles.";
        listaPublicaciones.appendChild(li);
    }
}

// Asignar el evento al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    obtenerPublicaciones(); // Obtener publicaciones al cargar la página
});
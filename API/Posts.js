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
            access_token: "EAAQsSGsuJCwBO0FZAVMPWREwgMqAI9UZAEJjQUpkdiZAQSHf5NOrhfZANUYowgaKgRYc2W11hIv9tUfZB4OTDUNA5bHdXznTYT17J6oG6UFc6fyv6TCZBqkqtefshQ8YZCmlUqTXYsT4RlhMqjMvOBB1fAEJP6WEBWFKrEKy9x1SP9VD2W6zzGoZCxKz1wEoz4bc2D8Fm6sCZCH6lvXh0TJbgJ7oZD"
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
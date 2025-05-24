    const score = localStorage.getItem("score");
    const nivel = localStorage.getItem("nivel");
    const dificultad = localStorage.getItem("dificultad");
    const nombre = localStorage.getItem("inputNombre");

    document.getElementById("score").textContent = `Puntaje: ${score}`;
    document.getElementById("nivel").textContent = `Nivel: ${nivel}`;
    document.getElementById("dificultad").textContent = `Dificultad: ${dificultad}`;
    // document.getElementById("nombre").textContent = `Nombre: ${nombre}`;

    function guardarTodo() {
      const nombre = document.getElementById("inputNombre").value;
      document.getElementById("nombre").textContent = `Nombre: ${nombre}`;

      const datosFinales = {
        nombre: nombre,
        score: score,
        nivel: nivel,
        dificultad: dificultad
      };

      localStorage.setItem("inputNombre", nombre);

      localStorage.setItem("datosFinales", JSON.stringify(datosFinales));

      console.log("Datos guardados:", datosFinales);
    }


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
    const mensaje = `Hola soy ${nombre} y mi puntaje en Cryostar es de: ${score} puntos y llegué a nivel ${nivel} en ${dificultad}`; // Mensaje predeterminado

    FB.api(
        "/637366269462788/feed", // Reemplaza con tu ID de página
        "POST",
        {
            message: mensaje,
            access_token: "EAAOC7l7vPd8BOZBkQ6UtVHryZA8Be74vdZABbHvrnY9Jt3eAIF9hy0iZBAx0WV7rBiEiRrf2w46whJX2xyh3rszmuoBgGvcCYjGyv3q2u1J5JTDFt6vQli9aK8N7HsnUMB3R5ThD4V7gOkof7c3yWB4ZCuUybeq7eKeoBxozwdP3AqYNwejjaeQVxbiIWdsGFiyzKPNQiZCtsjZA9hubjZCBqMI9ZB3tL"
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
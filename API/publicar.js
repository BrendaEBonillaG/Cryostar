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

fetch("http://localhost/Conexion.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datosFinales)
  })
  .then(response => response.text())
  .then(data => {
    console.log("Respuesta del servidor:", data);
    alert("Puntaje enviado correctamente");
  })
  .catch(error => {
    console.error("Error al enviar los datos:", error);
    alert("Error al enviar los datos");
  });

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
            access_token: "EAAOC7l7vPd8BO3NZCJQHpnJsiAZAjKXG76WQQj7J0OZAndqV7H6xJszZCSGRKr8ym4vknZAkcTf2fXUyBn6OxRgrzkPXXTfkYT24USnw8kgNDn1mG2bsizeDtao5kcGiqwldEaPktFjYxeLhBG3SPwb770ZC50ZBEcZAsyma0wOTS3ZASUYVdQDDEgcZAyCNGR1RCzAngRURXoCAO9ZA8NBGMlHZBUVYKiR3"
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


const canvas = document.getElementById('spaceCanvas');
const gl = canvas.getContext('webgl');

// Ajuste del tamaño del lienzo
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}

window.addEventListener('resize', resizeCanvas);

// Asegurarse de que el fondo sea negro
gl.clearColor(0, 0, 0, 1); // Color de fondo negro
gl.clear(gl.COLOR_BUFFER_BIT); // Limpiar el buffer con el color de fondo

// Vertex shader
const vsSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = 2.0;  // Tamaño de los puntos (estrellas)
    }
`;

// Fragment shader
const fsSource = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);  // Color blanco para las estrellas
    }
`;

// Crear y compilar los shaders
function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);

// Crear el programa de shaders
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Shader program error: " + gl.getProgramInfoLog(shaderProgram));
}

// Usar el programa de shaders
gl.useProgram(shaderProgram);

// Generar estrellas aleatorias
function generateStars(numStars) {
    const stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: (Math.random() * 2 - 1), // Posición X aleatoria
            y: (Math.random() * 2 - 1), // Posición Y aleatoria
            speed: Math.random() * 0.02 + 0.01 // Velocidad aleatoria para el movimiento
        });
    }
    return stars;
}

const stars = generateStars(500);

// Crear el buffer para las estrellas
const starPositions = new Float32Array(stars.length * 2);
for (let i = 0; i < stars.length; i++) {
    starPositions[i * 2] = stars[i].x;  // Posición X
    starPositions[i * 2 + 1] = stars[i].y;  // Posición Y
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, starPositions, gl.STATIC_DRAW);

// Enlazar el atributo de posición con el shader
const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);

// Función para mover las estrellas
function moveStars() {
    for (let i = 0; i < stars.length; i++) {
        stars[i].y -= stars[i].speed;
        if (stars[i].y < -1) {
            stars[i].y = 1;  // Reposicionar la estrella al fondo
        }
        // Actualizar la posición de la estrella en el buffer
        starPositions[i * 2 + 1] = stars[i].y;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, starPositions, gl.STATIC_DRAW);
}

// Función para dibujar las estrellas
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT); // Limpiar el lienzo con el fondo negro
    moveStars(); // Mover las estrellas
    gl.drawArrays(gl.POINTS, 0, stars.length); // Dibujar las estrellas
    requestAnimationFrame(drawScene); // Solicitar el siguiente cuadro
}

resizeCanvas();
drawScene();

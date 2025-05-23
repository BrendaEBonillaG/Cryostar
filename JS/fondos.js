const canvas1 = document.getElementById('spaceCanvas');
const canvas2 = document.getElementById('spaceCanvas2');
const canvas3 = document.getElementById('spaceCanvas3');

let gl1 = canvas1.getContext('webgl');
let gl2 = canvas2.getContext('webgl');
let gl3 = canvas3.getContext('webgl');

function fondoStars(gl) {
    const canvas = gl.canvas;

    // Ajuste del tamaño del lienzo
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Fondo negro
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader
    const vsSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            gl_PointSize = 2.0;
        }
    `;

    // Fragment shader
    const fsSource = `
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;

    // Compilar shaders
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

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Shader program error: " + gl.getProgramInfoLog(shaderProgram));
    }

    gl.useProgram(shaderProgram);

    // Generar estrellas
    const stars = [];
    for (let i = 0; i < 500; i++) {
        stars.push({
            x: (Math.random() * 2 - 1),
            y: (Math.random() * 2 - 1),
            speed: Math.random() * 0.02 + 0.01
        });
    }

    const starPositions = new Float32Array(stars.length * 2);
    for (let i = 0; i < stars.length; i++) {
        starPositions[i * 2] = stars[i].x;
        starPositions[i * 2 + 1] = stars[i].y;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, starPositions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    function moveStars() {
        for (let i = 0; i < stars.length; i++) {
            stars[i].y -= stars[i].speed;
            if (stars[i].y < -1) {
                stars[i].y = 1;
            }
            starPositions[i * 2 + 1] = stars[i].y;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, starPositions, gl.STATIC_DRAW);
    }

    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        moveStars();
        gl.drawArrays(gl.POINTS, 0, stars.length);
        requestAnimationFrame(drawScene);
    }

    drawScene();
}


function fondoGalaxia(gl) {
    const canvas = gl.canvas;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader y fragment shader para estrellas
    const vsSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            gl_PointSize = 2.0;
        }
    `;
    const fsSource = `
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;

    // Vertex y fragment shaders para líneas
    const lineVsSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;
    const lineFsSource = `
        void main() {
            gl_FragColor = vec4(0.2, 0.5, 0.5, 1.0);
        }
    `;

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

    function createProgram(vsSource, fsSource) {
        const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program error: " + gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    const starProgram = createProgram(vsSource, fsSource);
    const lineProgram = createProgram(lineVsSource, lineFsSource);

    // Estrellas
    const stars = [];
    for (let i = 0; i < 500; i++) {
        stars.push({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            speed: Math.random() * 0.02 + 0.01,
        });
    }

    const starPositions = new Float32Array(stars.length * 2);
    function updateStarPositionsArray() {
        for (let i = 0; i < stars.length; i++) {
            starPositions[i * 2] = stars[i].x;
            starPositions[i * 2 + 1] = stars[i].y;
        }
    }
    updateStarPositionsArray();

    const starPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, starPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, starPositions, gl.DYNAMIC_DRAW);

    // Conexiones tipo constelaciones
    const numConnections = 10;
    const connections = [];
    for (let i = 0; i < numConnections; i++) {
        const a = Math.floor(Math.random() * stars.length);
        let b = Math.floor(Math.random() * stars.length);
        while (b === a) b = Math.floor(Math.random() * stars.length);
        connections.push([a, b]);
    }

    const linePositions = new Float32Array(numConnections * 4);
    const lineBuffer = gl.createBuffer();

    function updateLinesArray() {
        for (let i = 0; i < connections.length; i++) {
            const [a, b] = connections[i];
            linePositions[i * 4] = stars[a].x;
            linePositions[i * 4 + 1] = stars[a].y;
            linePositions[i * 4 + 2] = stars[b].x;
            linePositions[i * 4 + 3] = stars[b].y;
        }
    }

    function moveStars() {
        for (let i = 0; i < stars.length; i++) {
            stars[i].y -= stars[i].speed;
            if (stars[i].y < -1) {
                stars[i].y = 1;
            }
        }
        updateStarPositionsArray();
        gl.bindBuffer(gl.ARRAY_BUFFER, starPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, starPositions, gl.DYNAMIC_DRAW);
    }

    function drawStars() {
        gl.useProgram(starProgram);
        const positionLocation = gl.getAttribLocation(starProgram, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, starPositionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, stars.length);
    }

    function drawLines() {
        gl.useProgram(lineProgram);
        const positionLocation = gl.getAttribLocation(lineProgram, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, connections.length * 2);
    }

    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        moveStars();
        drawStars();

        updateLinesArray();
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, linePositions, gl.DYNAMIC_DRAW);
        drawLines();

        requestAnimationFrame(drawScene);
    }

    drawScene();
}


function fondoPlanetas(gl) {
    const canvas = gl.canvas;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vsSource = `
        attribute vec2 a_position;
        attribute float a_pointSize;
        attribute vec3 a_color;
        varying vec3 v_color;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            gl_PointSize = a_pointSize;
            v_color = a_color;
        }
    `;

    const fsSource = `
        precision mediump float;
        varying vec3 v_color;
        void main() {
            gl_FragColor = vec4(v_color, 1.0);
        }
    `;

    function compileShader(source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(vsSource, fsSource) {
        const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program error:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    const program = createProgram(vsSource, fsSource);
    gl.useProgram(program);

    const stars = [];
    for (let i = 0; i < 500; i++) {
        const isSpecial = Math.random() < 0.15;
        stars.push({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            speed: Math.random() * 0.02 + 0.01,
            size: isSpecial ? (Math.random() * 5 + 3) : 2,
            color: isSpecial ? [Math.random(), Math.random(), Math.random()] : [1, 1, 1],
        });
    }

    const starPositions = new Float32Array(stars.length * 2);
    const starSizes = new Float32Array(stars.length);
    const starColors = new Float32Array(stars.length * 3);

    function updateStarAttributes() {
        for (let i = 0; i < stars.length; i++) {
            starPositions[i * 2] = stars[i].x;
            starPositions[i * 2 + 1] = stars[i].y;
            starSizes[i] = stars[i].size;
            starColors[i * 3] = stars[i].color[0];
            starColors[i * 3 + 1] = stars[i].color[1];
            starColors[i * 3 + 2] = stars[i].color[2];
        }
    }

    updateStarAttributes();

    const positionBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    function bindBuffers() {
        const posLoc = gl.getAttribLocation(program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, starPositions, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const sizeLoc = gl.getAttribLocation(program, 'a_pointSize');
        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, starSizes, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(sizeLoc);
        gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);

        const colorLoc = gl.getAttribLocation(program, 'a_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, starColors, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    }

    function moveStars() {
        for (let i = 0; i < stars.length; i++) {
            stars[i].y -= stars[i].speed;
            if (stars[i].y < -1) stars[i].y = 1;
        }
        updateStarAttributes();
    }

    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        moveStars();
        bindBuffers();
        gl.drawArrays(gl.POINTS, 0, stars.length);
        requestAnimationFrame(drawScene);
    }

    drawScene();
}

// Crear la escena, la cámara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Crear el renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Agregar luz a la escena
const ambientLight = new THREE.AmbientLight(0x404040, 2);  // Luz ambiental
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);  // Luz direccional
scene.add(directionalLight);

// Cargar el modelo GLTF
const loader = new THREE.GLTFLoader();
loader.load('models/nave.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Escalar el modelo
    model.scale.set(0.5, 0.5, 0.5);  // Ajusta el tamaño si es necesario

    // Colocar el modelo en la posición deseada
    model.position.set(0, 0, 0);  // Ajusta la posición si es necesario
}, undefined, (error) => {
    console.error(error);
});

// Posicionar la cámara
camera.position.z = 50;

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    // Renderizar la escena
    renderer.render(scene, camera);
}

// Ajustar el tamaño del lienzo cuando la ventana cambie de tamaño
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Iniciar la animación
animate();


// CONFIGURACIÓN DEL NIVEL FÁCIL
const CONFIG = {
    MAX_METEORITOS: 200,
    SPAWN_INTERVAL: 800,
    METEORITO_SPEED: 0.04,
    PROYECTIL_SPEED: 0.7,
    NAVESCALE: 0.5,
    POWERUP_CHANCE: 0.5,
    USE_SIMPLE_GEOMETRY: false,
    POWERUP_SPAWN_AREA: 6,
    MAX_SPAWN_TIME: 60000,
    POWERUP_MAX_ON_SCREEN: 3,
    POWERUP_BOB_HEIGHT: 0.5,
    POWERUP_BOB_SPEED: 1.5
};

// Variables del juego
let scene, camera, renderer;
let nave, meteoritos = [], aliens = [], aliens2 = [], powerUps = [];
let score = 0, lives = 3, gameOver = false;
let meteoritoSpeed = CONFIG.METEORITO_SPEED;
let spawnInterval = CONFIG.SPAWN_INTERVAL;
let lastSpawnTime = 0;
let gameStartTime = 0;
let loader = new THREE.GLTFLoader();
let proyectiles = [];
let keysPressed = {};
const disparoAudio = new Audio('../Audios/disparo.mp3');
let lastShotTime = 0;
let canShoot = true;
const NORMAL_SHOOT_DELAY = 500;
const RAPID_SHOOT_DELAY = 200;
let currentShootDelay = NORMAL_SHOOT_DELAY;

// Pool de objetos
let meteoritoPool = [];
let proyectilPool = [];
let powerUpPool = [];

// Sistema de power-ups
let activePowerUps = {
    rapidFire: { active: false, timer: 0 },
    shield: { active: false, timer: 0 }
};

// Inicialización del juego
function initGame() {
    scene = new THREE.Scene();


    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = 15;
    camera = new THREE.OrthographicCamera(
        -viewSize * aspect / 2,
        viewSize * aspect / 2,
        viewSize / 2,
        -viewSize / 2,
        0.1,
        1000
    );
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);
    camera.rotation.x = -Math.PI / 2;


    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Luces
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 0);
    light.castShadow = true;
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Estrellas de fondo
    createStarfield();

    createPools();
    cargarNave();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 2000;
        positions[i3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i3 + 2] = (Math.random() - 0.5) * 2000;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        opacity: 0.8
    });

    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

function createPools() {
    if (CONFIG.USE_SIMPLE_GEOMETRY) {
        for (let i = 0; i < CONFIG.MAX_METEORITOS; i++) {
            const geometry = new THREE.SphereGeometry(0.5, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.7,
                metalness: 0.3
            });
            const meteorito = new THREE.Mesh(geometry, material);
            meteorito.castShadow = true;
            meteorito.visible = false;
            scene.add(meteorito);
            meteoritoPool.push(meteorito);
        }
    }

    for (let i = 0; i < 30; i++) {
        const geometry = new THREE.CylinderGeometry(0.05, 0.1, 0.5, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff5555 });
        const proyectil = new THREE.Mesh(geometry, material);
        proyectil.rotation.x = Math.PI / 2;
        proyectil.visible = false;
        scene.add(proyectil);
        proyectilPool.push(proyectil);
    }

    for (let i = 0; i < 5; i++) {
        const powerUp = createNewPowerUp();
        powerUpPool.push(powerUp);
    }
}

function createNewPowerUp() {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        shininess: 100,
        emissive: 0x333333,
        emissiveIntensity: 0.5
    });

    const powerUp = new THREE.Mesh(geometry, material);
    powerUp.castShadow = true;
    powerUp.receiveShadow = false;
    powerUp.visible = false;

    scene.add(powerUp);
    return powerUp;
}

function cargarNave() {
    // Intenta cargar modelo 3D, si falla crea una nave básica
    try {
        loader.load(
            '../models/Nave_032.glb',
            function (gltf) {
                nave = gltf.scene;

                nave.rotation.y = 84.85;
                nave.rotation.x = 50;
                nave.position.set(0, 0, 0);
                nave.scale.set(0.2, 0.2, 0.2);

                nave.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = false;
                        child.material.flatShading = true;
                    }
                });

                scene.add(nave);
                document.querySelector('.loading').style.display = 'none';
                gameStartTime = performance.now();
                iniciarJuego();
            },
            undefined,
            function (error) {
                console.error('Error al cargar la nave:', error);
                crearNaveBasica();
            }
        );
    } catch (e) {
        console.error('Error al cargar modelo 3D:', e);

    }
}


// ===== SISTEMA DE METEORITOS =====
function spawnMeteorito(currentTime) {
    if (currentTime - gameStartTime > CONFIG.MAX_SPAWN_TIME) return;
    if (meteoritos.length >= CONFIG.MAX_METEORITOS) return;

    if (CONFIG.USE_SIMPLE_GEOMETRY) {
        crearMeteoritoSimple();
    } else {
        cargarMeteoritoModelo();
    }
}

function crearMeteoritoSimple() {
    let meteorito = meteoritoPool.find(m => !m.visible);
    if (!meteorito) return;

    let x, z;
    if (Math.random() > 0.5) {
        x = (Math.random() - 0.5) * 20;
        z = Math.random() > 0.5 ? 10 : -10;
    } else {
        x = Math.random() > 0.5 ? 10 : -10;
        z = (Math.random() - 0.5) * 20;
    }

    meteorito.position.set(x, 0, z);
    meteorito.visible = true;

    const direction = new THREE.Vector3(-x, 0, -z).normalize();
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * Math.PI / 6);

    meteorito.userData = {
        speed: meteoritoSpeed + Math.random() * 0.02,
        direction: direction,
        active: true
    };

    meteoritos.push(meteorito);

    // Generar power-up con probabilidad
    if (Math.random() < CONFIG.POWERUP_CHANCE &&
        Math.abs(x) < CONFIG.POWERUP_SPAWN_AREA &&
        powerUps.length < CONFIG.POWERUP_MAX_ON_SCREEN) {

        setTimeout(() => {
            crearPowerUp(x, z);
        }, 500);
    }
}
function cargarMeteoritoModelo() {
    if (meteoritos.length >= CONFIG.MAX_METEORITOS) return;

    // Selección del modelo según el nivel
    let modelosDisponibles = [];
    if (nivel >= 1) modelosDisponibles.push('meteorito1.glb');
    if (nivel >= 2) modelosDisponibles.push('meteorito2.glb');
    if (nivel >= 3) modelosDisponibles.push('meteorito3.glb');

    const modeloSeleccionado = modelosDisponibles[Math.floor(Math.random() * modelosDisponibles.length)];

    loader.load(
        `../models/${modeloSeleccionado}`,
        function (gltf) {
            if (meteoritos.length >= CONFIG.MAX_METEORITOS) {
                scene.remove(gltf.scene);
                return;
            }

            const meteorito = gltf.scene;

            let x, z;
            if (Math.random() > 0.5) {
                x = (Math.random() - 0.5) * 20;
                z = Math.random() > 0.5 ? 10 : -10;
            } else {
                x = Math.random() > 0.5 ? 10 : -10;
                z = (Math.random() - 0.5) * 20;
            }

            meteorito.position.set(x, 0, z);
            meteorito.scale.set(0.5, 0.5, 0.5);

            meteorito.traverse(child => {
                if (child.isMesh) {
                    child.material.flatShading = true;
                    child.castShadow = true;
                    child.receiveShadow = false;
                }
            });

            const direction = new THREE.Vector3(-x, 0, -z).normalize();
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * Math.PI / 6);

            meteorito.userData = {
                speed: meteoritoSpeed + Math.random() * 0.02,
                direction: direction,
                active: true
            };

            scene.add(meteorito);
            meteoritos.push(meteorito);

            // Power-up
            if (Math.random() < CONFIG.POWERUP_CHANCE &&
                Math.abs(x) < CONFIG.POWERUP_SPAWN_AREA &&
                powerUps.length < CONFIG.POWERUP_MAX_ON_SCREEN) {

                setTimeout(() => {
                    crearPowerUp(x, z);
                }, 500);
            }
        },
        undefined,
        function (error) {
            console.error('Error al cargar meteorito:', error);
            CONFIG.USE_SIMPLE_GEOMETRY = true;
            crearMeteoritoSimple();
        }
    );
}
function crearAlien1() {
    console.log("Ejecutando crearAlien1...");

    loader.load(
        '../models/alien.glb',
        function (gltf) {
            const alien = gltf.scene;

            alien.rotation.y = Math.PI;
            alien.position.set(0, 5, -6);
            alien.scale.set(0.1, 0.1, 0.1);

            // Establecer vida inicial
            alien.userData.vida = 3;

            scene.add(alien);
            aliens.push(alien);

            console.log("Alien 1 creado y añadido con 3 puntos de vida.");
        },
        undefined,
        function (error) {
            console.error('Error al cargar alien.glb:', error);
        }
    );
}
function dañarAlien(alien) {
    if (alien.userData.vida > 0) {
        alien.userData.vida--;
        console.log(`¡Alien dañado! Vida restante: ${alien.userData.vida}`);

        gsap.to(alien.scale, {
            x: 0.12, y: 0.12, z: 0.12,
            yoyo: true,
            repeat: 1,
            duration: 0.1
        });

        if (alien.userData.vida <= 0) {
            scene.remove(alien);
            const index = aliens.indexOf(alien);
            if (index !== -1) aliens.splice(index, 1);
            console.log("Alien destruido por disparo.");

            // ✅ Aumentar puntuación
            score += 150; // o cualquier valor que desees
            document.getElementById('score').textContent = score;
        }
    }
}



function crearAlien2() {
    console.log("Ejecutando crearAlien2...");

    loader.load(
        '../models/alien2.glb',
        function (gltf) {


            const alien2 = gltf.scene;

            alien2.rotation.y = Math.PI;

            // Posición aleatoria dentro de un área
            alien2.position.set(0, 5, -8);
            alien2.scale.set(0.05, 0.05, 0.05);
            // Establecer vida inicial
            alien2.userData.vida = 5;
            console.log("Alien 2 creado y añadido con 5 puntos de vida.");
            scene.add(alien2);
            aliens2.push(alien2);


        },
        undefined,
        function (error) {
            console.error('Error al cargar alien2.glb:', error);
        }
    );
}

function dañarAlien2(alien2) {
    if (alien2.userData.vida > 0) {
        alien2.userData.vida--;
        console.log(`¡Alien dañado! Vida restante: ${alien2.userData.vida}`);

        gsap.to(alien2.scale, {
            x: 0.12, y: 0.12, z: 0.12,
            yoyo: true,
            repeat: 1,
            duration: 0.1
        });

        if (alien2.userData.vida <= 0) {
            scene.remove(alien2);
            const index = aliens2.indexOf(alien2);
            if (index !== -1) aliens2.splice(index, 1);
            console.log("Alien 2 destruido por disparo.");

            // ✅ Aumentar puntuación
            score += 300; // puedes poner más puntos para este tipo
            document.getElementById('score').textContent = score;
        }
    }
}


// ===== SISTEMA DE POWER-UPS =====
function crearPowerUp(x, z) {
    const types = ['rapid_fire', 'shield', 'clear_screen'];
    const type = types[Math.floor(Math.random() * types.length)];

    const powerUpConfig = {
        'rapid_fire': {
            color: 0xff5252,
            icon: '⚡',
            size: 0.6
        },
        'shield': {
            color: 0x00a8ff,
            icon: '🛡️',
            size: 0.6
        },
        'clear_screen': {
            color: 0x9c27b0,
            icon: '💣',
            size: 0.7
        }
    };

    let powerUp = powerUpPool.find(p => !p.visible);
    if (!powerUp) {
        powerUp = createNewPowerUp();
        if (!powerUp) return;
    }

    // Posición más centrada y cerca del meteorito
    const spawnX = x + (Math.random() - 0.5) * 2;
    const spawnZ = z + (Math.random() - 0.5) * 2;

    // Configurar el power-up
    powerUp.position.set(spawnX, 0, spawnZ);
    powerUp.scale.set(1, 1, 1);

    // Cambiar propiedades según tipo
    const config = powerUpConfig[type];
    powerUp.material.color.setHex(config.color);
    powerUp.userData = {
        type: type,
        active: true,
        icon: config.icon,
        originalY: 0,
        bobHeight: CONFIG.POWERUP_BOB_HEIGHT,
        bobSpeed: CONFIG.POWERUP_BOB_SPEED + Math.random() * 1
    };

    // Crear texto flotante (sprite)
    if (!powerUp.userData.textSprite) {
        createPowerUpText(powerUp, config.icon);
    } else {
        powerUp.userData.textSprite.visible = true;
        powerUp.userData.textSprite.material.color.setHex(config.color);
    }

    powerUp.visible = true;
    powerUps.push(powerUp);

    // Animación de aparición
    gsap.from(powerUp.scale, {
        x: 0.1, y: 0.1, z: 0.1,
        duration: 0.5,
        ease: "back.out"
    });
}

function createPowerUpText(powerUp, icon) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');

    // Fondo transparente
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Texto/icono
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    context.fillText(icon, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        color: 0xffffff
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.8, 0.8, 0.8);
    sprite.position.y = 1.2;
    sprite.userData.isPowerUpText = true;

    powerUp.add(sprite);
    powerUp.userData.textSprite = sprite;
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];

        // Movimiento flotante
        powerUp.position.y = powerUp.userData.originalY +
            Math.sin(Date.now() * 0.001 * powerUp.userData.bobSpeed) *
            powerUp.userData.bobHeight;

        // Rotación
        powerUp.rotation.y += 0.02;

        // Movimiento hacia el jugador
        powerUp.position.z -= 0.05;

        // Actualizar posición del texto
        if (powerUp.userData.textSprite) {
            powerUp.userData.textSprite.position.y = 0.8 - powerUp.position.y;
            powerUp.userData.textSprite.lookAt(camera.position);
        }

        const distance = Math.sqrt(
            Math.pow(powerUp.position.x - nave.position.x, 2) +
            Math.pow(powerUp.position.z - nave.position.z, 2)
        );

        // Colisión con la nave
        if (distance < 1.2) {
            activarPowerUp(powerUp.userData.type, performance.now());

            // Efecto de recogida
            gsap.to(powerUp.scale, {
                x: 1.5, y: 1.5, z: 1.5,
                duration: 0.3,
                onComplete: () => {
                    powerUp.visible = false;
                    if (powerUp.userData.textSprite) {
                        powerUp.userData.textSprite.visible = false;
                    }
                }
            });

            powerUps.splice(i, 1);
        }
        // Eliminar si sale de pantalla
        else if (powerUp.position.z < -15) {
            powerUp.visible = false;
            if (powerUp.userData.textSprite) {
                powerUp.userData.textSprite.visible = false;
            }
            powerUps.splice(i, 1);
        }
    }
}

// ===== SISTEMA DE DISPARO =====
function dispararProyectil(currentTime = performance.now()) {
    if (!canShoot || currentTime - lastShotTime < currentShootDelay) return;

    lastShotTime = currentTime;

    if (activePowerUps.rapidFire.active) {
        disparoRapido();
    } else {
        disparoNormal();
    }

    canShoot = false;
    setTimeout(() => {
        canShoot = true;
    }, 100);
}

function disparoNormal() {
    const proyectil = getProyectilFromPool();
    if (!proyectil) return;

    proyectil.position.set(nave.position.x, 0.1, nave.position.z - 0.5);
    proyectil.userData = {
        speed: CONFIG.PROYECTIL_SPEED,
        direction: new THREE.Vector3(0, 0, -1),
        active: true
    };
    proyectil.visible = true;
    proyectiles.push(proyectil);

    disparoAudio.currentTime = 0; // Reinicia el audio para que se pueda reproducir rápidamente en sucesión
    disparoAudio.play();
}

function disparoRapido() {
    for (let i = -1; i <= 1; i++) {
        const proyectil = getProyectilFromPool();
        if (!proyectil) continue;

        proyectil.position.set(
            nave.position.x + (i * 0.3),
            0.1,
            nave.position.z - 0.5
        );
        proyectil.userData = {
            speed: CONFIG.PROYECTIL_SPEED * 1.2,
            direction: new THREE.Vector3(i * 0.1, 0, -1).normalize(),
            active: true
        };
        proyectil.visible = true;
        proyectiles.push(proyectil);
    }

    disparoAudio.currentTime = 0; // Reinicia el audio para que se pueda reproducir rápidamente en sucesión
    disparoAudio.play();
}

function getProyectilFromPool() {
    return proyectilPool.find(p => !p.visible) || crearNuevoProyectil();
}

function crearNuevoProyectil() {
    if (proyectilPool.length >= 50) return null;

    const geometry = new THREE.CylinderGeometry(0.05, 0.1, 0.5, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xff5555 });
    const newProyectil = new THREE.Mesh(geometry, material);
    newProyectil.rotation.x = Math.PI / 2;
    newProyectil.visible = false;
    scene.add(newProyectil);
    proyectilPool.push(newProyectil);
    return newProyectil;
}

function playSoundEffect(type) {
    // Simulación de efectos de sonido (en un juego real usarías Web Audio API)
    console.log(`Play sound: ${type}`);
}

// ===== BUCLE PRINCIPAL =====
function updateGame(currentTime) {
    if (gameOver) return;

    moverNave();
    updateAliensMovimiento();

    // Generación controlada de meteoritos
    if (currentTime - lastSpawnTime > spawnInterval &&
        meteoritos.length < CONFIG.MAX_METEORITOS &&
        currentTime - gameStartTime <= CONFIG.MAX_SPAWN_TIME) {

        spawnMeteorito(currentTime);
        lastSpawnTime = currentTime;

        // Aumentar dificultad muy gradualmente
        if (spawnInterval > 800) spawnInterval -= 10;
        if (meteoritoSpeed < 0.1) meteoritoSpeed += 0.0005;
    }

    updateActivePowerUps(currentTime);
    updateMeteoritos();
    updatePowerUps();
    updateProyectiles();
}

function updateMeteoritos() {
    for (let i = meteoritos.length - 1; i >= 0; i--) {
        const meteorito = meteoritos[i];

        meteorito.position.x += meteorito.userData.direction.x * meteorito.userData.speed;
        meteorito.position.z += meteorito.userData.direction.z * meteorito.userData.speed;

        if (!CONFIG.USE_SIMPLE_GEOMETRY) {
            meteorito.rotation.x += 0.01;
            meteorito.rotation.z += 0.01;
        }

        const distanceToNave = Math.sqrt(
            Math.pow(meteorito.position.x - nave.position.x, 2) +
            Math.pow(meteorito.position.z - nave.position.z, 2)
        );

        if (distanceToNave < 1.0) {
            handleMeteoritoCollision(i);
            continue;
        }

        if (Math.sqrt(meteorito.position.x ** 2 + meteorito.position.z ** 2) < 0.5) {
            removeMeteorito(i);
        }
    }
}

function updateAliensMovimiento() {
    // Movimiento en X entre -8 y +8
    const velocidad = 0.1;

    aliens.forEach(alien => {
        if (!alien.userData.direccion) alien.userData.direccion = -1;

        alien.position.x += velocidad * alien.userData.direccion;

        if (alien.position.x <= -11) alien.userData.direccion = 1;
        if (alien.position.x >= 11) alien.userData.direccion = -1;
    });

    aliens2.forEach(alien => {
        if (!alien.userData.direccion) alien.userData.direccion = -1;

        alien.position.x += velocidad * alien.userData.direccion;

        if (alien.position.x <= -8) alien.userData.direccion = 1;
        if (alien.position.x >= 8) alien.userData.direccion = -1;
    });
}


function handleMeteoritoCollision(index) {
    createExplosion(meteoritos[index].position.clone(), 0xff0000, 1.5);
    removeMeteorito(index);

    if (!activePowerUps.shield.active) {
        lives--;
        document.getElementById('lives').textContent = lives;

        // Efecto de daño a la nave
        gsap.to(nave.scale, {
            x: .3, y: .3, z: .3,
            duration: 0.1,
            yoyo: true,
            repeat: 3
        });

        if (lives <= 0) {
            gameOver = true;
            showGameOver();
        }
        // if
    }
}

function createExplosion(position, color = 0xff6600, size = 1.0) {
    const particles = new THREE.Group();
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });

        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);

        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * size,
                (Math.random() - 0.5) * size,
                (Math.random() - 0.5) * size
            ),
            lifetime: 0
        };

        particles.add(particle);
    }

    scene.add(particles);

    // Animación de partículas
    const explosionDuration = 1000;
    const startTime = performance.now();

    function animateExplosion() {
        const now = performance.now();
        const elapsed = now - startTime;
        const progress = elapsed / explosionDuration;

        if (progress >= 1) {
            scene.remove(particles);
            return;
        }

        particles.children.forEach(particle => {
            particle.position.add(particle.userData.velocity);
            particle.material.opacity = 0.8 * (1 - progress);
            particle.userData.velocity.multiplyScalar(0.95);
        });

        requestAnimationFrame(animateExplosion);
    }

    animateExplosion();
}

function removeMeteorito(index) {
    const meteorito = meteoritos[index];

    if (CONFIG.USE_SIMPLE_GEOMETRY) {
        meteorito.visible = false;
    } else {
        scene.remove(meteorito);
    }

    meteoritos.splice(index, 1);
}

function updateProyectiles() {
    for (let i = proyectiles.length - 1; i >= 0; i--) {
        const proyectil = proyectiles[i];

        proyectil.position.add(proyectil.userData.direction.clone().multiplyScalar(proyectil.userData.speed));

        if (proyectil.position.z < -15) {
            proyectil.visible = false;
            proyectiles.splice(i, 1);
            continue;
        }

        checkProyectilCollisions(i);
    }
}

function checkProyectilCollisions(proyectilIndex) {
    const proyectil = proyectiles[proyectilIndex];

    // Colisión con meteoritos
    for (let j = meteoritos.length - 1; j >= 0; j--) {
        const meteorito = meteoritos[j];
        const distance = proyectil.position.distanceTo(meteorito.position);

        if (distance < 0.8) {
            createExplosion(meteorito.position.clone(), 0xff9900, 1.2);
            removeMeteorito(j);
            proyectil.visible = false;
            proyectiles.splice(proyectilIndex, 1);
            score+=10;
            document.getElementById('score').textContent = score;
            return;
        }
    }

    // Colisión con Alien 1
    for (let i = aliens.length - 1; i >= 0; i--) {
        const alien = aliens[i];
        const dx = proyectil.position.x - alien.position.x;
        const dz = proyectil.position.z - alien.position.z;
        const distanceXZ = Math.sqrt(dx * dx + dz * dz);

        if (distanceXZ < 1.0) {
            dañarAlien(alien);
            proyectil.visible = false;
            proyectiles.splice(proyectilIndex, 1);
            return;
        }
    }



    // Colisión con Alien 2 (si quieres que también puedan ser dañados)
    for (let i = aliens2.length - 1; i >= 0; i--) {
        const alien2 = aliens2[i];
        const dx = proyectil.position.x - alien2.position.x;
        const dz = proyectil.position.z - alien2.position.z;
        const distanceXZ = Math.sqrt(dx * dx + dz * dz);

        if (distanceXZ < 1.0) {
            dañarAlien2(alien2);
            proyectil.visible = false;
            proyectiles.splice(proyectilIndex, 1);
            return;
        }
    }
}


// ===== POWER-UPS ACTIVOS =====
function activarPowerUp(type, currentTime) {
    const duration = 10000;

    // Efecto visual común
    const flashEffect = () => {
        const flash = new THREE.Mesh(
            new THREE.SphereGeometry(3, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7
            })
        );
        flash.position.copy(nave.position);
        scene.add(flash);

        gsap.to(flash.material, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => scene.remove(flash)
        });
    };

    switch (type) {
        case 'rapid_fire':
            flashEffect();
            activePowerUps.rapidFire.active = true;
            activePowerUps.rapidFire.timer = currentTime + duration;
            currentShootDelay = RAPID_SHOOT_DELAY;
            // Cambiar el indicador con animación
            const rapidFireElement = document.getElementById('rapid-fire-indicator');
            rapidFireElement.textContent = "⚡ DISPARO RÁPIDO ACTIVO ";
            rapidFireElement.style.backgroundColor = 'rgba(255, 82, 82, 0.7)';
            rapidFireElement.classList.add('powerup-active');

            gsap.to(rapidFireElement, {
                backgroundColor: 'rgba(255, 82, 82, 0.3)',
                duration: 0.5,
                yoyo: true,
                repeat: 5
            });

            playSoundEffect('powerup');
            break;

        case 'shield':
            flashEffect();
            activePowerUps.shield.active = true;
            activePowerUps.shield.timer = currentTime + duration;

            // Crear escudo visual
            const shieldGeometry = new THREE.SphereGeometry(7, 16, 16);
            const shieldMaterial = new THREE.MeshBasicMaterial({
                color: 0x0066FF,
                transparent: true,
                opacity: 0.5,
                wireframe: true
            });
            const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
            shield.userData = { isShield: true };
            nave.add(shield);

            // Animación del escudo
            gsap.from(shield.scale, {
                x: 0.1, y: 0.1, z: 0.1,
                duration: 0.7,
                ease: "elastic.out(1, 0.5)"
            });

            // Indicador UI
            const shieldElement = document.getElementById('shield-indicator');
            shieldElement.textContent = "🛡️ ESCUDO ACTIVO (10s)";
            shieldElement.style.backgroundColor = 'rgba(0, 168, 255, 0.7)';
            shieldElement.classList.add('powerup-active');

            playSoundEffect('powerup');
            break;

        case 'clear_screen':
            // Efecto de explosión
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const explosion = createExplosion(
                        new THREE.Vector3(
                            (Math.random() - 0.5) * 20,
                            0,
                            (Math.random() - 0.5) * 20
                        ),
                        0xff00ff,
                        2.0
                    );
                    scene.add(explosion);
                }, i * 100);
            }

            // Eliminar meteoritos
            for (let i = meteoritos.length - 1; i >= 0; i--) {
                removeMeteorito(i);
                score += 2;
            }

            document.getElementById('score').textContent = score;
            const clearElement = document.getElementById('clear-screen-indicator');
            clearElement.textContent = "💣 METEORITOS ELIMINADOS!";
            clearElement.style.backgroundColor = 'rgba(156, 39, 176, 0.7)';
            clearElement.classList.add('powerup-active');

            setTimeout(() => {
                clearElement.textContent = "💣 ELIMINAR METEORITOS: LISTO";
                clearElement.style.backgroundColor = 'rgba(156, 39, 176, 0.3)';
                clearElement.classList.remove('powerup-active');
            }, 2000);

            playSoundEffect('explosion');
            break;
    }
}

function updateActivePowerUps(currentTime) {
    for (const type in activePowerUps) {
        if (activePowerUps[type].active && currentTime >= activePowerUps[type].timer) {
            desactivarPowerUp(type);
        } else if (activePowerUps[type].active) {
            // Actualizar contador UI
            const remaining = Math.ceil((activePowerUps[type].timer - currentTime) / 1000);
            if (type === 'rapid_fire') {
                document.getElementById('rapid-fire-indicator').textContent =
                    `⚡ DISPARO RÁPIDO ACTIVO (${remaining}s)`;
            } else if (type === 'shield') {
                document.getElementById('shield-indicator').textContent =
                    `🛡️ ESCUDO ACTIVO (${remaining}s)`;
            }
        }
    }
}

function desactivarPowerUp(type) {
    switch (type) {
        case 'rapid_fire':
            activePowerUps.rapidFire.active = false;
            currentShootDelay = NORMAL_SHOOT_DELAY;

            const rapidFireElement = document.getElementById('rapid-fire-indicator');
            rapidFireElement.textContent = "⚡ Disparo rápido: Inactivo";
            rapidFireElement.style.backgroundColor = 'rgba(255, 82, 82, 0.3)';
            rapidFireElement.classList.remove('powerup-active');
            break;

        case 'shield':
            activePowerUps.shield.active = false;
            for (let i = nave.children.length - 1; i >= 0; i--) {
                if (nave.children[i].userData.isShield) {
                    gsap.to(nave.children[i].scale, {
                        x: 0.1, y: 0.1, z: 0.1,
                        duration: 0.5,
                        onComplete: () => nave.remove(nave.children[i])
                    });
                }
            }

            const shieldElement = document.getElementById('shield-indicator');
            shieldElement.textContent = "🛡️ Escudo: Inactivo";
            shieldElement.style.backgroundColor = 'rgba(0, 168, 255, 0.3)';
            shieldElement.classList.remove('powerup-active');
            break;
    }
}

// ===== CONTROLES =====
function onKeyDown(event) {
    keysPressed[event.code] = true;
    if (event.code === 'Space') dispararProyectil();
}

function onKeyUp(event) {
    keysPressed[event.code] = false;
}

function moverNave() {
    if (!nave) return;

    const speed = 0.15;
    const bounds = 9;

    if (keysPressed.ArrowLeft) nave.position.x = Math.max(-bounds, nave.position.x - speed);
    if (keysPressed.ArrowRight) nave.position.x = Math.min(bounds, nave.position.x + speed);
    if (keysPressed.ArrowUp) nave.position.z = Math.max(-bounds, nave.position.z - speed);
    if (keysPressed.ArrowDown) nave.position.z = Math.min(bounds, nave.position.z + speed);
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = 15;

    camera.left = -viewSize * aspect / 2;
    camera.right = viewSize * aspect / 2;
    camera.top = viewSize / 2;
    camera.bottom = -viewSize / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function showGameOver() {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
                <h2>¡Juego terminado!</h2>
                <p>Puntuación final: ${score}</p>
                <button id="restart-btn">Reiniciar Juego</button>
                <button id="TablaP-btn">Puntuacion</button>
            `;
    document.body.appendChild(gameOverDiv);

    document.getElementById('restart-btn').addEventListener('click', restartGame);
}

function restartGame() {
    location.reload();
}

function iniciarJuego() {
    animate();

}

function animate(currentTime = 0) {
    requestAnimationFrame(animate);
    updateGame(currentTime);


    console.log("Meteoritos activos:", meteoritos.length);

    renderer.render(scene, camera);
}

window.onload = initGame;



let fondoActual = null;



iniciarFondoNivel(1);
fondoStars(gl1);


function iniciarFondoNivel(nivel) {
    // Oculta todos
    canvas1.style.display = 'none';
    canvas2.style.display = 'none';
    canvas3.style.display = 'none';

    switch (nivel) {
        case 1:
            canvas1.style.display = 'block';
            fondoStars(gl1); // tu función render del nivel 1
            break;
        case 2:
            canvas2.style.display = 'block';
            fondoGalaxia(gl2); // tu función render del nivel 2
            break;
        case 3:
            canvas3.style.display = 'block';
            fondoPlanetas(gl3); // tu función render del nivel 3
            break;
    }
}

let tiempo = 0;
const nivelTitulo = document.getElementById('nivel-titulo');
let nivel = 1;

const contador = setInterval(() => {
    tiempo++;

    // Cada 10 segundos sube un nivel
    if (tiempo % 10 === 0) {
        nivel++;
        if (nivel <= 3) {
            nivelTitulo.innerText = `Nivel ${nivel} Fácil`;
        }

        if (nivel === 2) {
            iniciarFondoNivel(2);
            fondoGalaxia(gl2);
            crearAlien1();
        }

        // Detener el contador cuando llega al Nivel 3
        if (nivel === 3) {
            iniciarFondoNivel(3);
            fondoPlanetas(gl3);
            crearAlien2();
            clearInterval(contador);

        }
    }
}, 1000); // cada segundo


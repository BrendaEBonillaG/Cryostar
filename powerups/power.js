// POWERUPS SYSTEM
class PowerUpSystem {
  constructor(config) {
    this.CONFIG = {
      DURATION: {
        RAPID_FIRE: 10000,
        SHIELD: 10000
      },
      COLORS: {
        RAPID_FIRE: 0xff5252,
        SHIELD: 0x00a8ff,
        CLEAR_SCREEN: 0x9c27b0
      }
    };
    Object.assign(this.CONFIG, config);
    
    this.activePowerUps = {
      rapidFire: { active: false, timer: 0 },
      shield: { active: false, timer: 0 }
    };
    
    this.powerUpPool = [];
    this.powerUps = [];
    this.onClearScreen = null;
  }

  init(scene, player) {
    this.scene = scene;
    this.player = player;
    this.createPowerUpPool(5);
  }

  createPowerUpPool(count) {
    for (let i = 0; i < count; i++) {
      const powerUp = this.createPowerUpMesh();
      this.powerUpPool.push(powerUp);
      this.scene.add(powerUp);
    }
  }

  createPowerUpMesh() {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });

    const powerUp = new THREE.Mesh(geometry, material);
    powerUp.visible = false;
    return powerUp;
  }

  spawnPowerUp(position, type) {
    if (this.powerUps.length >= 3) return;

    const powerUp = this.getAvailablePowerUp();
    if (!powerUp) return;

    const config = this.getPowerUpConfig(type);
    powerUp.position.copy(position);
    powerUp.material.color.setHex(config.color);
    powerUp.userData = { type, ...config };
    powerUp.visible = true;

    gsap.from(powerUp.scale, {
      x: 0.1, y: 0.1, z: 0.1,
      duration: 0.5,
      ease: "back.out"
    });

    this.powerUps.push(powerUp);
  }

  getPowerUpConfig(type) {
    const types = {
      rapid_fire: {
        color: this.CONFIG.COLORS.RAPID_FIRE,
        icon: '⚡',
        uiText: 'DISPARO RÁPIDO',
        uiId: 'rapid-fire-indicator'
      },
      shield: {
        color: this.CONFIG.COLORS.SHIELD,
        icon: '🛡️',
        uiText: 'ESCUDO',
        uiId: 'shield-indicator'
      },
      clear_screen: {
        color: this.CONFIG.COLORS.CLEAR_SCREEN,
        icon: '💣',
        uiText: 'ELIMINAR ENEMIGOS',
        uiId: 'clear-screen-indicator'
      }
    };

    return types[type] || types.rapid_fire;
  }

  update(currentTime) {
    this.updateActivePowerUps(currentTime);
    this.updatePowerUpsMovement();
  }

  updatePowerUpsMovement() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      powerUp.position.y = Math.sin(Date.now() * 0.001 * 2) * 0.3;
      powerUp.rotation.y += 0.02;
      
      if (this.checkPlayerCollision(powerUp)) {
        this.activatePowerUp(powerUp.userData.type, performance.now());
        this.removePowerUp(i);
      }
    }
  }

  checkPlayerCollision(powerUp) {
    return powerUp.position.distanceTo(this.player.position) < 1.2;
  }

  activatePowerUp(type, currentTime) {
    switch(type) {
      case 'rapid_fire':
        this.activePowerUps.rapidFire.active = true;
        this.activePowerUps.rapidFire.timer = currentTime + this.CONFIG.DURATION.RAPID_FIRE;
        this.updatePowerUpUI(type, true);
        break;
        
      case 'shield':
        this.activePowerUps.shield.active = true;
        this.activePowerUps.shield.timer = currentTime + this.CONFIG.DURATION.SHIELD;
        this.createShield();
        this.updatePowerUpUI(type, true);
        break;
        
      case 'clear_screen':
        if (this.onClearScreen) this.onClearScreen();
        this.updatePowerUpUI(type, false);
        break;
    }
    powerUpAudio.play(); // Reproducir sonido de power-up
  }

  createShield() {
    const shieldGeometry = new THREE.IcosahedronGeometry(2, 1);
    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: this.CONFIG.COLORS.SHIELD,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.userData = { isShield: true };
    this.player.add(shield);
    
    gsap.from(shield.scale, {
      x: 0.1, y: 0.1, z: 0.1,
      duration: 0.7,
      ease: "elastic.out(1, 0.5)"
    });
  }

  updatePowerUpUI(type, isTimed) {
    const config = this.getPowerUpConfig(type);
    const element = document.getElementById(config.uiId);
    
    if (isTimed) {
      element.textContent = `${config.icon} ${config.uiText} ACTIVO (10s)`;
      element.style.backgroundColor = `rgba(${this.hexToRgb(config.color)}, 0.7)`;
      
      gsap.to(element, {
        backgroundColor: `rgba(${this.hexToRgb(config.color)}, 0.3)`,
        duration: 0.5,
        yoyo: true,
        repeat: 5
      });
    } else {
      element.textContent = `${config.icon} ${config.uiText} ACTIVADO!`;
      element.style.backgroundColor = `rgba(${this.hexToRgb(config.color)}, 0.7)`;
      
      setTimeout(() => {
        element.textContent = `${config.icon} ${config.uiText}: LISTO`;
        element.style.backgroundColor = `rgba(${this.hexToRgb(config.color)}, 0.3)`;
      }, 2000);
    }
  }

  hexToRgb(hex) {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return `${r}, ${g}, ${b}`;
  }

  updateActivePowerUps(currentTime) {
    for (const type in this.activePowerUps) {
      const powerUp = this.activePowerUps[type];
      
      if (powerUp.active && currentTime >= powerUp.timer) {
        this.deactivatePowerUp(type);
      }
    }
  }

  deactivatePowerUp(type) {
    const config = this.getPowerUpConfig(type === 'rapidFire' ? 'rapid_fire' : 'shield');
    
    this.activePowerUps[type].active = false;
    this.updatePowerUpUI(type === 'rapidFire' ? 'rapid_fire' : 'shield', false);
    
    if (type === 'shield') {
      const shield = this.player.children.find(c => c.userData.isShield);
      if (shield) {
        this.player.remove(shield);
      }
    }
  }

  getAvailablePowerUp() {
    return this.powerUpPool.find(p => !p.visible) || this.createPowerUpMesh();
  }

  removePowerUp(index) {
    const powerUp = this.powerUps[index];
    powerUp.visible = false;
    this.powerUps.splice(index, 1);
  }

  isPowerUpActive(type) {
    return this.activePowerUps[type]?.active || false;
  }
}
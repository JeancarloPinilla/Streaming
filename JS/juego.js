const derechos = [
    "Conocer todos los trámites administrativos",
    "Ser informado de todo lo relacionado con su atención",
    "Recibir atención que salvaguarde su dignidad personal y respete sus valores",
    "Respetar su privacidad y confidencialidad",
    "Recibir un trato amable y humano",
    "Conocer toda la información sobre su enfermedad",
    "Ser atendido por personal capacitado",
    "Recibir prescripción de medicamentos",
    "Aceptar o rechazar procedimientos con constancia escrita",
    "Recibir atención requerida según necesidades"
];

const deberes = [
    "Mantener el buen orden y aseo en la institución",
    "Cumplir las normas y actuar de buena fe",
    "Exponer claramente su estado de salud",
    "Seguir las recomendaciones médicas",
    "No solicitar servicios con información engañosa",
    "Expresar información veraz para un buen servicio",
    "Informar sobre actos que afecten la clínica",
    "Cumplir citas y requerimientos del personal",
    "Respetar al personal y a otros usuarios",
    "Brindar un trato amable y digno"
];

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ====================================================
// FUNCIÓN PARA OBTENER TAMAÑOS RESPONSIVE
// ====================================================
function getResponsiveSizes() {
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    if (isSmallMobile) {
        return {
            player: 15,        // Jugador más pequeño en móviles pequeños
            enemy: 12,         // Enemigos más pequeños
            coin: 10,          // Monedas más pequeñas
            freeze: 8,         // Power-ups más pequeños
            playerSpeed: 4,    // Velocidad del jugador
            enemySpeed: 1.8    // Enemigos más lentos
        };
    } else if (isMobile) {
        return {
            player: 18,
            enemy: 14,
            coin: 12,
            freeze: 10,
            playerSpeed: 4.5,
            enemySpeed: 2
        };
    } else {
        return {
            player: 25,        // Tamaño original en desktop
            enemy: 20,
            coin: 15,
            freeze: 12,
            playerSpeed: 5,
            enemySpeed: 2.5
        };
    }
}

// Variable global para tamaños
let sizes = getResponsiveSizes();

// Ajustar canvas para dispositivos móviles
function adjustCanvasSize() {
    const maxWidth = Math.min(800, window.innerWidth - 40);
    
    if (maxWidth < 800) {
        canvas.width = maxWidth;
        canvas.height = (maxWidth / 800) * 500;
    } else {
        canvas.width = 800;
        canvas.height = 500;
    }
    
    // Actualizar tamaños responsive
    sizes = getResponsiveSizes();
    
    // Actualizar tamaños del jugador si existe
    if (gameState.player) {
        gameState.player.size = sizes.player;
        gameState.player.speed = sizes.playerSpeed;
        gameState.player.x = Math.min(gameState.player.x, canvas.width - gameState.player.size);
        gameState.player.y = Math.min(gameState.player.y, canvas.height - gameState.player.size);
    }
    
    // Actualizar tamaños de enemigos
    if (gameState.enemies) {
        gameState.enemies.forEach(enemy => {
            enemy.size = sizes.enemy;
            enemy.speed = sizes.enemySpeed;
        });
    }
    
    // Actualizar tamaños de monedas
    if (gameState.coins) {
        gameState.coins.forEach(coin => {
            coin.size = sizes.coin;
        });
    }
    
    // Actualizar tamaños de power-ups
    if (gameState.freezePowerUps) {
        gameState.freezePowerUps.forEach(powerUp => {
            powerUp.size = sizes.freeze;
        });
    }
}

// Sistema de audio
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isSupported = false;
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isSupported = true;
        } catch (e) {
            console.log('Web Audio API no soportada');
            this.isSupported = false;
        }
    }
    
    playCoinSound() {
        if (!this.isSupported) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.2);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    playFreezeSound() {
        if (!this.isSupported) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(200, this.audioContext.currentTime + 0.2);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }
    
    playDeathSound() {
        if (!this.isSupported) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.8);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.8);
    }
    
    playVictorySound() {
        if (!this.isSupported) return;
        
        const notes = [523, 659, 784, 1047];
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.3);
            }, index * 150);
        });
    }
}

const audioManager = new AudioManager();

let gameState = {
    player: { x: 400, y: 250, size: sizes.player, speed: sizes.playerSpeed },
    coins: [],
    enemies: [],
    freezePowerUps: [],
    score: 0,
    derechosCount: 0,
    deberesCount: 0,
    keys: {},
    gameOver: false,
    gameWon: false,
    enemiesFrozen: false,
    freezeTimeLeft: 0,
    gameStarted: false,
    gamePaused: true
};

class Coin {
    constructor() {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = Math.random() * (canvas.height - 40) + 20;
        this.size = sizes.coin;
        this.type = Math.random() < 0.5 ? 'derecho' : 'deber';
        this.collected = false;
        this.pulse = 0;
    }

    draw() {
        if (this.collected) return;
        
        this.pulse += 0.1;
        const pulseSize = this.size + Math.sin(this.pulse) * 2;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(2, 2, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
        if (this.type === 'derecho') {
            gradient.addColorStop(0, '#ffed4e');
            gradient.addColorStop(0.7, '#ffd700');
            gradient.addColorStop(1, '#b8860b');
        } else {
            gradient.addColorStop(0, '#f0f0f0');
            gradient.addColorStop(0.7, '#c0c0c0');
            gradient.addColorStop(1, '#808080');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-pulseSize/3, -pulseSize/3, pulseSize/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.type === 'derecho' ? '#8b4513' : '#404040';
        const fontSize = Math.max(10, this.size * 1.2);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.type === 'derecho' ? '⭐' : '📋', 0, fontSize/3);
        
        ctx.restore();
    }

    checkCollision(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size + player.size) && !this.collected;
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = sizes.enemy;
        this.speed = sizes.enemySpeed;
        this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
        if (gameState.enemiesFrozen) return;

        const player = gameState.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        
        this.pulse += 0.15;
    }

    draw() {
        this.pulse += 0.1;
        const pulseSize = this.size + Math.sin(this.pulse) * 3;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(3, 3, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
        if (gameState.enemiesFrozen) {
            gradient.addColorStop(0, '#87ceeb');
            gradient.addColorStop(0.7, '#4682b4');
            gradient.addColorStop(1, '#2f4f4f');
        } else {
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(0.7, '#ee5a52');
            gradient.addColorStop(1, '#8b0000');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-pulseSize/3, -pulseSize/3, pulseSize/4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        const fontSize = Math.max(12, this.size * 0.9);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(gameState.enemiesFrozen ? '🥶' : '😈', 0, fontSize/3);
        
        ctx.restore();
    }

    checkCollision(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size + player.size);
    }
}

class FreezePowerUp {
    constructor() {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = Math.random() * (canvas.height - 40) + 20;
        this.size = sizes.freeze;
        this.collected = false;
        this.pulse = 0;
    }

    draw() {
        if (this.collected) return;
        
        this.pulse += 0.12;
        const pulseSize = this.size + Math.sin(this.pulse) * 2;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(2, 2, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(0.7, '#00bfff');
        gradient.addColorStop(1, '#0080ff');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(-pulseSize/3, -pulseSize/3, pulseSize/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        const fontSize = Math.max(10, this.size * 1.2);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('❄️', 0, fontSize/3);
        
        ctx.restore();
    }

    checkCollision(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size + player.size) && !this.collected;
    }
}

function drawPlayer() {
    const player = gameState.player;
    
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(3, 3, player.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Cuerpo del jugador
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, player.size);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.7, '#4682b4');
    gradient.addColorStop(1, '#2f4f4f');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, player.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Cara
    ctx.fillStyle = 'white';
    const fontSize = Math.max(16, player.size * 0.95);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('😊', 0, fontSize/3);
    
    ctx.restore();
}

function spawnCoin() {
    gameState.coins.push(new Coin());
}

function spawnEnemy() {
    // Asegurar que los enemigos no aparezcan muy cerca del jugador
    let x, y;
    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
    } while (Math.sqrt((x - gameState.player.x) ** 2 + (y - gameState.player.y) ** 2) < 150);
    
    gameState.enemies.push(new Enemy(x, y));
}

function spawnFreezePowerUp() {
    gameState.freezePowerUps.push(new FreezePowerUp());
}

function updateGame() {
    if (gameState.gameOver || gameState.gameWon || gameState.gamePaused || !gameState.gameStarted) return;
    
    // Actualizar timer de congelamiento
    if (gameState.enemiesFrozen) {
        gameState.freezeTimeLeft -= 1/60; // Asumiendo 60 FPS
        if (gameState.freezeTimeLeft <= 0) {
            gameState.enemiesFrozen = false;
            document.getElementById('freezeIndicator').style.display = 'none';
        } else {
            document.getElementById('freezeTimer').textContent = Math.ceil(gameState.freezeTimeLeft);
        }
    }
    
    // Movimiento del jugador
    const player = gameState.player;
    
    if (gameState.keys['ArrowUp'] || gameState.keys['w'] || gameState.keys['W']) {
        player.y = Math.max(player.size, player.y - player.speed);
    }
    if (gameState.keys['ArrowDown'] || gameState.keys['s'] || gameState.keys['S']) {
        player.y = Math.min(canvas.height - player.size, player.y + player.speed);
    }
    if (gameState.keys['ArrowLeft'] || gameState.keys['a'] || gameState.keys['A']) {
        player.x = Math.max(player.size, player.x - player.speed);
    }
    if (gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) {
        player.x = Math.min(canvas.width - player.size, player.x + player.speed);
    }

    // Actualizar enemigos
    gameState.enemies.forEach(enemy => {
        enemy.update();
        if (enemy.checkCollision(player)) {
            gameState.gameOver = true;
            audioManager.playDeathSound();
            showGameOver();
        }
    });

    // Colisiones con monedas
    gameState.coins.forEach(coin => {
        if (coin.checkCollision(player)) {
            coin.collected = true;
            gameState.score += 10;
            audioManager.playCoinSound();
            
            if (coin.type === 'derecho') {
                gameState.derechosCount++;
                showMessage('derecho', derechos[Math.floor(Math.random() * derechos.length)]);
            } else {
                gameState.deberesCount++;
                showMessage('deber', deberes[Math.floor(Math.random() * deberes.length)]);
            }
            
            // Verificar victoria
            if (gameState.derechosCount + gameState.deberesCount >= 20) {
                gameState.gameWon = true;
                showGameWon();
            }
        }
    });

    // Colisiones con power-ups de congelamiento
    gameState.freezePowerUps.forEach(powerUp => {
        if (powerUp.checkCollision(player)) {
            powerUp.collected = true;
            gameState.enemiesFrozen = true;
            gameState.freezeTimeLeft = 5;
            document.getElementById('freezeIndicator').style.display = 'block';
            audioManager.playFreezeSound();
            showMessage('powerup', '❄️ ¡Enemigos congelados por 5 segundos!');
        }
    });

    // Remover elementos recolectados
    gameState.coins = gameState.coins.filter(coin => !coin.collected);
    gameState.freezePowerUps = gameState.freezePowerUps.filter(powerUp => !powerUp.collected);

    // Generar nuevos elementos
    if (Math.random() < 0.02 && gameState.coins.length < 6) {
        spawnCoin();
    }
    
    if (Math.random() < 0.008 && gameState.freezePowerUps.length < 1) {
        spawnFreezePowerUp();
    }

    updateUI();
}

function render() {
    // Limpiar canvas
    ctx.fillStyle = 'rgba(30, 60, 90, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar patrón de fondo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Solo dibujar elementos del juego si ha comenzado
    if (gameState.gameStarted) {
        gameState.coins.forEach(coin => coin.draw());
        gameState.freezePowerUps.forEach(powerUp => powerUp.draw());
        gameState.enemies.forEach(enemy => enemy.draw());
        drawPlayer();
    }
    
    // Mostrar mensaje de pausa si está pausado
    if (gameState.gamePaused && gameState.gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        const pauseFontSize = Math.min(48, canvas.width / 10);
        ctx.font = `bold ${pauseFontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('⏸️ PAUSADO', canvas.width/2, canvas.height/2 - 20);
        
        const subtitleSize = Math.min(20, canvas.width / 25);
        ctx.font = `${subtitleSize}px Arial`;
        ctx.fillText('Presiona el botón "Reanudar" para continuar', canvas.width/2, canvas.height/2 + 30);
    }
}

function gameLoop() {
    updateGame();
    render();
    requestAnimationFrame(gameLoop);
}

function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('derechos').textContent = gameState.derechosCount;
    document.getElementById('deberes').textContent = gameState.deberesCount;
}

function showMessage(type, content) {
    const panel = document.getElementById('messagePanel');
    let title, className;
    
    if (type === 'derecho') {
        title = '⭐ DERECHO DEL USUARIO';
        className = 'message-panel derecho';
    } else if (type === 'deber') {
        title = '📋 DEBER DEL USUARIO';
        className = 'message-panel deber';
    } else if (type === 'powerup') {
        title = '❄️ POWER-UP ACTIVADO';
        className = 'message-panel';
    }
    
    panel.className = className;
    panel.innerHTML = `
        <div class="message-title">${title}</div>
        <div class="message-content">${content}</div>
    `;
}

function closeStartPanel() {
    const panel = document.getElementById("startPanel");
    if (panel) panel.style.display = "none";
}


function closeModal(button) {
    const modal = button.closest('.game-over-panel, .start-panel');
    if (modal) modal.remove();
}


function showGameOver() {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over-panel';
    gameOverDiv.innerHTML = `
        <div class="game-over-title">💀 ¡PERDISTE!</div>
        <button class="close-modal" onclick="closeModal(this)">✕</button>
        <div class="game-over-message">Los enemigos te atraparon. ¡Inténtalo de nuevo!</div>
        <div class="game-over-message">Puntuación final: ${gameState.score} puntos</div>
        <div class="game-over-message">Derechos: ${gameState.derechosCount} | Deberes: ${gameState.deberesCount}</div>
        <button class="start-btn" onclick="restartGame(); this.parentElement.remove();">🔄 Reiniciar Juego</button>
    `;
    document.body.appendChild(gameOverDiv);
}

function showGameWon() {
    audioManager.playVictorySound();
    
    const gameWonDiv = document.createElement('div');
    gameWonDiv.className = 'game-over-panel';
    gameWonDiv.innerHTML = `
        <div class="game-over-title">🏆 ¡GANASTE!</div>
        <button class="close-modal" onclick="closeModal(this)">✕</button>
        <div class="game-over-message">¡Felicidades! Has capturado 20 monedas y completado el juego.</div>
        <div class="game-over-message">Puntuación final: ${gameState.score} puntos</div>
        <div class="game-over-message">Derechos: ${gameState.derechosCount} | Deberes: ${gameState.deberesCount}</div>
        <button class="start-btn" onclick="restartGame(); this.parentElement.remove();">🔄 Jugar de nuevo</button>
    `;
    document.body.appendChild(gameWonDiv);
}

function startGame() {
    gameState.gameStarted = true;
    gameState.gamePaused = false;
    
    // Ocultar panel de inicio
    document.getElementById('startPanel').style.display = 'none';
    
    // Cambiar el texto del botón de pausa
    document.getElementById('pauseBtn').textContent = '⏸️ Pausar';
    
    // Mostrar mensaje de juego iniciado
    const panel = document.getElementById('messagePanel');
    panel.className = 'message-panel';
    panel.innerHTML = `
        <button class="close-modal" onclick="closeGameOverPanel()">✕</button>
        <div class="message-title">¡Juego Iniciado!</div>
        <div class="message-content">
            ¡El juego ha comenzado! Usa las teclas de flecha o WASD para moverte. Captura 20 monedas para ganar,
            pero cuidado con los enemigos. ¡Buena suerte!
        </div>
    `;
}

function togglePause() {
    if (!gameState.gameStarted) return;
    
    gameState.gamePaused = !gameState.gamePaused;
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (gameState.gamePaused) {
        pauseBtn.textContent = '▶️ Reanudar';
    } else {
        pauseBtn.textContent = '⏸️ Pausar';
    }
}

function restartGame() {
    // Remover paneles existentes
    document.querySelectorAll('.game-over-panel').forEach(panel => panel.remove());
    
    gameState = {
        player: { 
            x: Math.min(400, canvas.width/2), 
            y: Math.min(250, canvas.height/2), 
            size: sizes.player, 
            speed: sizes.playerSpeed 
        },
        coins: [],
        enemies: [],
        freezePowerUps: [],
        score: 0,
        derechosCount: 0,
        deberesCount: 0,
        keys: {},
        gameOver: false,
        gameWon: false,
        enemiesFrozen: false,
        freezeTimeLeft: 0,
        gameStarted: true,
        gamePaused: false
    };
    
    // Ocultar indicador de congelamiento
    document.getElementById('freezeIndicator').style.display = 'none';
    
    // Generar elementos iniciales
    for (let i = 0; i < 4; i++) {
        spawnCoin();
    }
    
    // Generar enemigos
    spawnEnemy();
    spawnEnemy();
    
    // Cambiar botón de pausa
    document.getElementById('pauseBtn').textContent = '⏸️ Pausar';
    
    const panel = document.getElementById('messagePanel');
    panel.className = 'message-panel';
    panel.innerHTML = `
        <div class="message-title">¡Juego Reiniciado!</div>
        <div class="message-content">
            Captura 20 monedas para ganar, pero cuidado con los enemigos rojos. Las bolitas azules ❄️ congelan a los enemigos por 5 segundos. ¡Buena suerte!
        </div>
    `;
    
    updateUI();
}

// Inicializar juego 
function initializeGame() {
    adjustCanvasSize();
    
    // Configurar elementos iniciales pero no empezar
    gameState.coins = [];
    gameState.enemies = [];
    gameState.freezePowerUps = [];
    
    // Centrar jugador en el canvas con tamaños responsive
    gameState.player.x = canvas.width / 2;
    gameState.player.y = canvas.height / 2;
    gameState.player.size = sizes.player;
    gameState.player.speed = sizes.playerSpeed;
    
    // Generar elementos iniciales
    for (let i = 0; i < 4; i++) {
        spawnCoin();
    }
    
    // Generar enemigos
    spawnEnemy();
    spawnEnemy();
    
    updateUI();
}

// Controles móviles
function setupMobileControls() {
    const mobileButtons = document.querySelectorAll('.mobile-btn');
    
    mobileButtons.forEach(btn => {
        const key = btn.dataset.key;
        
        // Touch events
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            gameState.keys[key] = true;
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            gameState.keys[key] = false;
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        // Mouse events para testing
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            gameState.keys[key] = true;
        });
        
        btn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            gameState.keys[key] = false;
        });
        
        btn.addEventListener('mouseleave', (e) => {
            gameState.keys[key] = false;
        });
    });
}

// Event listeners
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

// Prevenir scroll en dispositivos móviles cuando se usan controles
document.addEventListener('touchmove', (e) => {
    if (e.target.classList.contains('mobile-btn')) {
        e.preventDefault();
    }
}, { passive: false });

// Llamar al ajuste al cargar y al cambiar el tamaño de ventana
window.addEventListener('load', () => {
    adjustCanvasSize();
    setupMobileControls();
    initializeGame();
    gameLoop();
});

window.addEventListener('resize', () => {
    adjustCanvasSize();
});

// Inicializar inmediatamente si el DOM ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        adjustCanvasSize();
        setupMobileControls();
        initializeGame();
        gameLoop();
    });
} else {
    adjustCanvasSize();
    setupMobileControls();
    initializeGame();
    gameLoop();
}
const tesorosOro = [
    "¡Moneda de oro antigua! Vale una fortuna",
    "¡Doblón español del siglo XVII!",
    "¡Oro puro de las minas perdidas!",
    "¡Moneda del tesoro del Capitán Barbanegra!",
    "¡Pieza de ocho reluciente!",
    "¡Oro del galeón hundido!",
    "¡Moneda real de la corona!",
    "¡Tesoro de la isla misteriosa!",
    "¡Oro del cofre legendario!",
    "¡Riqueza de los siete mares!"
];

const tesorosGemas = [
    "¡Rubí brillante del tamaño de un huevo!",
    "¡Esmeralda de la selva perdida!",
    "¡Diamante azul rarísimo!",
    "¡Zafiro del océano profundo!",
    "¡Perla negra legendaria!",
    "¡Amatista de la cueva secreta!",
    "¡Topacio dorado resplandeciente!",
    "¡Ópalo místico cambiante!",
    "¡Jade imperial precioso!",
    "¡Cristal de poder antiguo!"
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
            player: 15,
            enemy: 12,
            coin: 10,
            freeze: 8,
            playerSpeed: 4,
            enemySpeed: 1.8
        };
    } else if (isMobile) {
        return {
            player: 18,
            enemy: 14,
            coin: 12,
            freeze: 10,
            playerSpeed: 4.5,
            enemySpeed: 3
        };
    } else {
        return {
            player: 25,
            enemy: 20,
            coin: 15,
            freeze: 12,
            playerSpeed: 6,
            enemySpeed: 5
        };
    }
}

let sizes = getResponsiveSizes();

function adjustCanvasSize() {
    const maxWidth = Math.min(800, window.innerWidth - 40);
    
    if (maxWidth < 800) {
        canvas.width = maxWidth;
        canvas.height = (maxWidth / 800) * 500;
    } else {
        canvas.width = 800;
        canvas.height = 500;
    }
    
    sizes = getResponsiveSizes();
    
    if (gameState.player) {
        gameState.player.size = sizes.player;
        gameState.player.speed = sizes.playerSpeed;
        gameState.player.x = Math.min(gameState.player.x, canvas.width - gameState.player.size);
        gameState.player.y = Math.min(gameState.player.y, canvas.height - gameState.player.size);
    }
    
    if (gameState.enemies) {
        gameState.enemies.forEach(enemy => {
            enemy.size = sizes.enemy;
            enemy.speed = sizes.enemySpeed;
        });
    }
    
    if (gameState.coins) {
        gameState.coins.forEach(coin => {
            coin.size = sizes.coin;
        });
    }
    
    if (gameState.freezePowerUps) {
        gameState.freezePowerUps.forEach(powerUp => {
            powerUp.size = sizes.freeze;
        });
    }
}

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

// ===============================
// INTERVALOS CONTROLADOS
// ===============================
let enemySpawnInterval = null;
let greenCoinInterval = null;


let gameState = {
    player: { x: 400, y: 250, size: sizes.player, speed: sizes.playerSpeed },
    coins: [],
    enemies: [],
    freezePowerUps: [],
    killCoins: [],
    score: 0,
    oroCount: 0,
    gemasCount: 0,
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
        this.type = Math.random() < 0.5 ? 'oro' : 'gema';
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
        if (this.type === 'oro') {
            gradient.addColorStop(0, '#ffed4e');
            gradient.addColorStop(0.7, '#ffd700');
            gradient.addColorStop(1, '#b8860b');
        } else {
            gradient.addColorStop(0, '#ff69b4');
            gradient.addColorStop(0.7, '#da70d6');
            gradient.addColorStop(1, '#9370db');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-pulseSize/3, -pulseSize/3, pulseSize/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.type === 'oro' ? '#8b4513' : '#4b0082';
        const fontSize = Math.max(10, this.size * 1.2);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.type === 'oro' ? '💰' : '💎', 0, fontSize/3);
        
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

class KillEnemyCoin {
    constructor() {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = Math.random() * (canvas.height - 40) + 20;
        this.size = sizes.coin;
        this.collected = false;
        this.pulse = 0;
    }

    draw() {
        if (this.collected) return;

        this.pulse += 0.1;
        const pulseSize = this.size + Math.sin(this.pulse) * 2;

        ctx.save();
        ctx.translate(this.x, this.y);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(0.7, '#00cc66');
        gradient.addColorStop(1, '#006633');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `bold ${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('☠️', 0, this.size / 3);

        ctx.restore();
    }

    checkCollision(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        return Math.sqrt(dx * dx + dy * dy) < (this.size + player.size);
    }
}



function drawPlayer() {
    const player = gameState.player;
    
    ctx.save();
    ctx.translate(player.x, player.y);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(3, 3, player.size, 0, Math.PI * 2);
    ctx.fill();
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, player.size);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.7, '#4682b4');
    gradient.addColorStop(1, '#2f4f4f');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, player.size, 0, Math.PI * 2);
    ctx.fill();
    
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
    let x, y;
    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
    } while (Math.sqrt((x - gameState.player.x) ** 2 + (y - gameState.player.y) ** 2) < 150);
    
    gameState.enemies.push(new Enemy(x, y));
}

function spawnEnemyInCorner() {
    const corners = [
        { x: 0, y: 0 },
        { x: canvas.width, y: 0 },
        { x: 0, y: canvas.height },
        { x: canvas.width, y: canvas.height }
    ];

    const corner = corners[Math.floor(Math.random() * corners.length)];

    gameState.enemies.push(
        new Enemy(
            corner.x === 0 ? sizes.enemy : corner.x - sizes.enemy,
            corner.y === 0 ? sizes.enemy : corner.y - sizes.enemy
        )
    );
}



function spawnFreezePowerUp() {
    gameState.freezePowerUps.push(new FreezePowerUp());
}

function updateGame() {
    if (gameState.gameOver || gameState.gameWon || gameState.gamePaused || !gameState.gameStarted) return;
    
    if (gameState.enemiesFrozen) {
        gameState.freezeTimeLeft -= 1/60;
        if (gameState.freezeTimeLeft <= 0) {
            gameState.enemiesFrozen = false;
            document.getElementById('freezeIndicator').style.display = 'none';
        } else {
            document.getElementById('freezeTimer').textContent = Math.ceil(gameState.freezeTimeLeft);
        }
    }
    
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

    gameState.enemies.forEach(enemy => {
        enemy.update();
        if (enemy.checkCollision(player)) {
            gameState.gameOver = true;
            audioManager.playDeathSound();
            showGameOver();
        }
    });

    gameState.coins.forEach(coin => {
        if (coin.checkCollision(player)) {
            coin.collected = true;
            gameState.score += 10;
            audioManager.playCoinSound();
            
            if (coin.type === 'oro') {
                gameState.oroCount++;
                showMessage('oro', tesorosOro[Math.floor(Math.random() * tesorosOro.length)]);
            } else {
                gameState.gemasCount++;
                showMessage('gema', tesorosGemas[Math.floor(Math.random() * tesorosGemas.length)]);
            }
            
            if (gameState.oroCount + gameState.gemasCount >= 20) {
                gameState.gameWon = true;
                showGameWon();
            }
        }
    });

    gameState.freezePowerUps.forEach(powerUp => {
        gameState.killCoins.forEach(coin => {
            if (coin.checkCollision(player)) {
                coin.collected = true;

                if (gameState.enemies.length > 0) {
                    gameState.enemies.shift();
                    showMessage('powerup', '☠️ ¡Un enemigo ha sido eliminado!');
                }
            }
        });
        if (powerUp.checkCollision(player)) {
            powerUp.collected = true;
            gameState.enemiesFrozen = true;
            gameState.freezeTimeLeft = 5;
            document.getElementById('freezeIndicator').style.display = 'block';
            audioManager.playFreezeSound();
            showMessage('powerup', '❄️ ¡Guardianes congelados por 5 segundos!');
        }
    });

    gameState.killCoins = gameState.killCoins.filter(c => !c.collected);
    gameState.coins = gameState.coins.filter(coin => !coin.collected);
    gameState.freezePowerUps = gameState.freezePowerUps.filter(powerUp => !powerUp.collected);

    if (Math.random() < 0.02 && gameState.coins.length < 6) {
        spawnCoin();
    }
    
    if (Math.random() < 0.008 && gameState.freezePowerUps.length < 1) {
        spawnFreezePowerUp();
    }

    updateUI();
}

function render() {
    ctx.fillStyle = 'rgba(30, 60, 90, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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

    if (gameState.gameStarted) {
        gameState.coins.forEach(coin => coin.draw());
        gameState.freezePowerUps.forEach(powerUp => powerUp.draw());
        gameState.killCoins.forEach(coin => coin.draw());
        gameState.enemies.forEach(enemy => enemy.draw());
        drawPlayer();
    }
    
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
    document.getElementById('derechos').textContent = gameState.oroCount;
    document.getElementById('deberes').textContent = gameState.gemasCount;
}

function showMessage(type, content) {
    const panel = document.getElementById('messagePanel');
    let title, className;
    
    if (type === 'oro') {
        title = '💰 ¡MONEDA DE ORO!';
        className = 'message-panel derecho';
    } else if (type === 'gema') {
        title = '💎 ¡GEMA PRECIOSA!';
        className = 'message-panel deber';
    } else if (type === 'powerup') {
        title = '❄️ PODER ACTIVADO';
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
    const mobileControls = document.getElementById("mobileControls");
    if (mobileControls) mobileControls.style.display = "none";

    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over-panel';
    gameOverDiv.innerHTML = `
        <div class="game-over-title">💀 ¡CAPTURADO!</div>
        <button class="close-modal" onclick="closeModal(this)">✕</button>
        <div class="game-over-message">Los guardianes del tesoro te atraparon. ¡Inténtalo de nuevo!</div>
        <div class="game-over-message">Puntuación final: ${gameState.score} puntos</div>
        <div class="game-over-message">Oro: ${gameState.oroCount} | Gemas: ${gameState.gemasCount}</div>
        <button class="start-btn" onclick="restartGame(); this.parentElement.remove();">🔄 Reiniciar Aventura</button>
    `;
    document.body.appendChild(gameOverDiv);
}

function showGameWon() {
    audioManager.playVictorySound();

    const mobileControls = document.getElementById("mobileControls");
    if (mobileControls) mobileControls.style.display = "none";
    
    const gameWonDiv = document.createElement('div');
    gameWonDiv.className = 'game-over-panel';
    gameWonDiv.innerHTML = `
        <div class="game-over-title">🏆 ¡VICTORIA!</div>
        <button class="close-modal" onclick="closeModal(this)">✕</button>
        <div class="game-over-message">¡Felicidades! Has recolectado 20 tesoros y completado la aventura.</div>
        <div class="game-over-message">Puntuación final: ${gameState.score} puntos</div>
        <div class="game-over-message">Oro: ${gameState.oroCount} | Gemas: ${gameState.gemasCount}</div>
        <button class="start-btn" onclick="restartGame(); this.parentElement.remove();">🔄 Nueva Aventura</button>
    `;
    document.body.appendChild(gameWonDiv);
}

function startGame() {
    gameState.gameStarted = true;
    gameState.gamePaused = false;
    
    document.getElementById('startPanel').style.display = 'none';
    document.getElementById('pauseBtn').textContent = '⏸️ Pausar';
    
    const panel = document.getElementById('messagePanel');
    panel.className = 'message-panel';
    panel.innerHTML = `
        <div class="message-title">¡Aventura Iniciada!</div>
        <div class="message-content">
            ¡La búsqueda del tesoro ha comenzado! Usa las teclas de flecha o WASD para moverte. Recolecta 20 tesoros para ganar,
            pero cuidado con los guardianes. ¡Buena suerte, aventurero!
        </div>
    `;

    const mobileControls = document.getElementById("mobileControls");
    if (mobileControls && window.innerWidth <= 768) {
        mobileControls.style.display = "block";
    }

    startEnemySpawner();
    startGreenCoinSpawner();
}


function togglePause() {
    if (!gameState.gameStarted || gameState.gameOver) return;

    gameState.gamePaused = !gameState.gamePaused;

    const pauseBtn = document.getElementById('pauseBtn');
    const mobileControls = document.getElementById("mobileControls");

    if (gameState.gamePaused) {
        pauseBtn.textContent = '▶️ Reanudar';
        if (mobileControls) mobileControls.style.display = "none";
    } else {
        pauseBtn.textContent = '⏸️ Pausar';
        if (mobileControls && window.innerWidth <= 768) {
            mobileControls.style.display = "block";
        }
    }
}


function restartGame() {
    clearInterval(enemySpawnInterval);
    clearInterval(greenCoinInterval);
    enemySpawnInterval = null;
    greenCoinInterval = null;

    document.querySelectorAll('.game-over-panel').forEach(p => p.remove());

    gameState.gameOver = false;
    gameState.gameWon = false;
    gameState.gamePaused = false;
    gameState.gameStarted = true;

    gameState.score = 0;
    gameState.oroCount = 0;
    gameState.gemasCount = 0;
    gameState.keys = {};

    gameState.coins = [];
    gameState.enemies = [];
    gameState.freezePowerUps = [];
    gameState.killCoins = [];

    gameState.player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: sizes.player,
        speed: sizes.playerSpeed
    };

    for (let i = 0; i < 4; i++) spawnCoin();
    spawnEnemy();
    spawnEnemy();

    updateUI();

    startEnemySpawner();
    startGreenCoinSpawner();
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


const joystickBase = document.getElementById("joystickBase");
const joystickStick = document.getElementById("joystickStick");

let joystickActive = false;
let joystickCenter = { x: 0, y: 0 };
const maxDistance = 50;

function setDirection(dx, dy) {
    gameState.keys['ArrowUp'] = dy < -10;
    gameState.keys['ArrowDown'] = dy > 10;
    gameState.keys['ArrowLeft'] = dx < -10;
    gameState.keys['ArrowRight'] = dx > 10;
}


joystickBase.addEventListener("touchstart", (e) => {
    joystickActive = true;
    const rect = joystickBase.getBoundingClientRect();
    joystickCenter.x = rect.left + rect.width / 2;
    joystickCenter.y = rect.top + rect.height / 2;
});

joystickBase.addEventListener("touchmove", (e) => {
    if (!joystickActive) return;

    const touch = e.touches[0];
    let dx = touch.clientX - joystickCenter.x;
    let dy = touch.clientY - joystickCenter.y;

    const distance = Math.min(Math.sqrt(dx*dx + dy*dy), maxDistance);
    const angle = Math.atan2(dy, dx);

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    joystickStick.style.transform =
        `translate(${x - 30}px, ${y - 30}px)`;

    setDirection(x, y);
});


joystickBase.addEventListener("touchend", () => {
    joystickActive = false;
    joystickStick.style.transform = "translate(-50%, -50%)";

    gameState.keys.up = false;
    gameState.keys.down = false;
    gameState.keys.left = false;
    gameState.keys.right = false;
});


// Inicializar inmediatamente si el DOM ya está cargado
window.addEventListener('load', () => {
    adjustCanvasSize();
    setupMobileControls();
    initializeGame();
    gameLoop();
});



// FUNCIONES EXPERIMENTALES

function startEnemySpawner() {
    if (enemySpawnInterval) return;

    enemySpawnInterval = setInterval(() => {
        if (gameState.gameOver || gameState.gamePaused) return;
        spawnEnemyInCorner();
    }, 7000);
}

function startGreenCoinSpawner() {
    if (greenCoinInterval) return;

    greenCoinInterval = setInterval(() => {
        if (gameState.gameOver || gameState.gamePaused) return;
        if (gameState.killCoins.length < 1) {
            gameState.killCoins.push(new KillEnemyCoin());
        }
    }, 10000);
}

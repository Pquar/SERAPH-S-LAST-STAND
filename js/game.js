// game.js - Core game loop e sistema principal

class Game extends EventEmitter {
    constructor() {
        super();
        
        // Canvas e contexto
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Estado do jogo
        this.state = 'menu'; // menu, playing, paused, gameOver
        this.lastTime = 0;
        this.gameStartTime = 0;
        this.gameTime = 0;
        
        // Entidades do jogo
        this.player = null;
        this.waveSystem = null;
        this.soulOrbs = [];
        
        // Sistemas
        this.inputManager = new InputManager();
        this.ui = new UI();
        this.audioSystem = new AudioSystem();
        
        // Configurações
        this.targetFPS = 60;
        this.deltaTime = 1000 / this.targetFPS;
        
        // Pool de objetos para performance
        this.soulOrbPool = new ObjectPool(
            () => ({ x: 0, y: 0, value: 1, size: 8, collected: false, alpha: 1.0 }),
            (orb) => { orb.collected = false; orb.alpha = 1.0; }
        );
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupUI();
        
        // Começar com o menu
        this.showMainMenu();
        
        // Iniciar loop principal
        this.gameLoop();
    }
    
    setupCanvas() {
        // Configurar tamanho do canvas
        this.resizeCanvas();
        
        // Configurações do contexto
        this.ctx.imageSmoothingEnabled = false; // Pixel art style
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Listener para redimensionamento
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const containerRect = container.getBoundingClientRect();
        
        // Definir tamanho base
        let width = 1024;
        let height = 768;
        
        // Ajustar para dispositivos móveis
        if (DeviceUtils.isMobile()) {
            const viewport = DeviceUtils.getViewportSize();
            if (viewport.width < viewport.height) {
                // Portrait
                width = Math.min(viewport.width, 480);
                height = Math.min(viewport.height - 200, 640); // Espaço para controles
            } else {
                // Landscape
                width = Math.min(viewport.width - 240, 800); // Espaço para controles
                height = Math.min(viewport.height, 600);
            }
        } else {
            // Desktop: ajustar ao container
            const maxWidth = containerRect.width * 0.9;
            const maxHeight = containerRect.height * 0.9;
            
            const aspectRatio = width / height;
            if (maxWidth / maxHeight > aspectRatio) {
                height = maxHeight;
                width = height * aspectRatio;
            } else {
                width = maxWidth;
                height = width / aspectRatio;
            }
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }
    
    setupEventListeners() {
        // Input events
        this.inputManager.on('keyDown', (key) => {
            this.handleKeyDown(key);
        });
        
        this.inputManager.on('keyUp', (key) => {
            this.handleKeyUp(key);
        });
        
        this.inputManager.on('joystickMove', (x, y) => {
            if (this.player) {
                this.player.setJoystick(x, y, true);
            }
        });
        
        this.inputManager.on('joystickStop', () => {
            if (this.player) {
                this.player.setJoystick(0, 0, false);
            }
        });
        
        // UI events
        document.getElementById('playBtn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Verificar se há save game
        const saveData = Storage.load('seraphsLastStand_save');
        if (saveData) {
            document.getElementById('continueBtn').style.display = 'block';
            document.getElementById('continueBtn').addEventListener('click', () => {
                this.loadGame(saveData);
            });
        } else {
            document.getElementById('continueBtn').style.display = 'none';
        }
    }
    
    setupUI() {
        this.ui.on('hpUpdate', (hp, maxHp) => {
            this.updateHPBar(hp, maxHp);
        });
        
        this.ui.on('soulOrbsUpdate', (count) => {
            this.updateSoulOrbsDisplay(count);
        });
        
        this.ui.on('waveUpdate', (wave) => {
            this.updateWaveDisplay(wave);
        });
        
        this.ui.on('timeUpdate', (time) => {
            this.updateTimeDisplay(time);
        });
    }
    
    gameLoop(currentTime = 0) {
        // Calcular delta time
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
        }
        
        const deltaTime = Math.min(currentTime - this.lastTime, 1000 / 30); // Cap at 30fps minimum
        this.lastTime = currentTime;
        
        // Atualizar apenas se o jogo estiver rodando
        if (this.state === 'playing') {
            this.update(deltaTime);
        }
        
        // Sempre renderizar
        this.render();
        
        // Continuar loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Atualizar entidades
        if (this.player) {
            this.player.update(deltaTime, this.waveSystem.enemies, this.canvas);
        }
        
        if (this.waveSystem) {
            this.waveSystem.update(deltaTime, this.player, this.canvas);
        }
        
        // Atualizar soul orbs
        this.updateSoulOrbs(deltaTime);
        
        // Atualizar UI
        this.updateUI();
        
        // Verificar condições de game over
        if (this.player && this.player.hp <= 0) {
            this.gameOver();
        }
        
        // Auto-save a cada 30 segundos
        if (this.gameTime % 30000 < deltaTime) {
            this.autoSave();
        }
    }
    
    render() {
        // Limpar canvas
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar baseado no estado
        switch (this.state) {
            case 'playing':
            case 'paused':
                this.renderGame();
                break;
            case 'menu':
                this.renderMenu();
                break;
            case 'gameOver':
                this.renderGameOver();
                break;
        }
    }
    
    renderGame() {
        // Background pattern
        this.renderBackground();
        
        // Renderizar entidades
        if (this.waveSystem) {
            this.waveSystem.render(this.ctx);
        }
        
        // Renderizar soul orbs
        this.renderSoulOrbs();
        
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Efeitos visuais
        this.renderEffects();
        
        // Debug info (removível)
        if (window.DEBUG) {
            this.renderDebugInfo();
        }
    }
    
    renderBackground() {
        // Grid pattern sutil
        this.ctx.strokeStyle = 'rgba(74, 74, 138, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    renderSoulOrbs() {
        this.soulOrbs.forEach(orb => {
            if (!orb.collected) {
                this.ctx.globalAlpha = orb.alpha;
                CanvasUtils.drawCircle(this.ctx, orb.x, orb.y, orb.size, '#66ffff');
                
                // Efeito de brilho
                const time = Date.now() * 0.005;
                const pulseSize = orb.size + Math.sin(time) * 2;
                CanvasUtils.drawCircle(this.ctx, orb.x, orb.y, pulseSize, 'rgba(102, 255, 255, 0.3)', false);
                
                this.ctx.globalAlpha = 1.0;
            }
        });
    }
    
    renderEffects() {
        // Efeitos de partículas podem ser adicionados aqui
    }
    
    renderDebugInfo() {
        const info = [
            `FPS: ${Math.round(1000 / this.deltaTime)}`,
            `Enemies: ${this.waveSystem ? this.waveSystem.enemies.length : 0}`,
            `Projectiles: ${this.player ? this.player.projectiles.length : 0}`,
            `Soul Orbs: ${this.soulOrbs.length}`,
            `Game Time: ${TimeUtils.formatTime(this.gameTime)}`
        ];
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, info.length * 20 + 10);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        info.forEach((line, index) => {
            this.ctx.fillText(line, 15, 25 + index * 20);
        });
    }
    
    renderMenu() {
        // Menu é renderizado via HTML/CSS
    }
    
    renderGameOver() {
        // Overlay escuro
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Texto de game over
        this.ctx.fillStyle = '#ff6666';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Estatísticas
        if (this.waveSystem) {
            const stats = [
                `Onda alcançada: ${this.waveSystem.currentWave}`,
                `Inimigos derrotados: ${this.waveSystem.enemiesKilled}`,
                `Tempo sobrevivido: ${TimeUtils.formatTime(this.gameTime)}`,
                `Soul Orbs coletados: ${this.player ? this.player.soulOrbs : 0}`
            ];
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px Arial';
            
            stats.forEach((stat, index) => {
                this.ctx.fillText(stat, this.canvas.width / 2, this.canvas.height / 2 + 20 + index * 30);
            });
        }
        
        // Instruções
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Pressione R para reiniciar ou ESC para o menu', 
                         this.canvas.width / 2, this.canvas.height - 50);
    }
    
    updateSoulOrbs(deltaTime) {
        this.soulOrbs = this.soulOrbs.filter(orb => {
            if (orb.collected) return false;
            
            // Verificar coleta pelo jogador
            if (this.player && Collision.circleCircle(
                orb.x, orb.y, orb.size,
                this.player.x, this.player.y, this.player.size + 10
            )) {
                this.player.collectSoulOrb(orb.value);
                orb.collected = true;
                this.audioSystem.playSound('soulOrb');
                return false;
            }
            
            // Fade out após 30 segundos
            orb.lifetime = (orb.lifetime || 30000) - deltaTime;
            if (orb.lifetime <= 0) {
                orb.alpha = Math.max(0, orb.alpha - deltaTime / 1000);
                if (orb.alpha <= 0) return false;
            }
            
            return true;
        });
    }
    
    updateUI() {
        if (this.player) {
            this.ui.emit('hpUpdate', this.player.hp, this.player.maxHp);
            this.ui.emit('soulOrbsUpdate', this.player.soulOrbs);
        }
        
        if (this.waveSystem) {
            this.ui.emit('waveUpdate', this.waveSystem.currentWave);
        }
        
        this.ui.emit('timeUpdate', this.gameTime);
    }
    
    updateHPBar(hp, maxHp) {
        const hpFill = document.getElementById('hpFill');
        const hpText = document.getElementById('hpText');
        
        const percentage = (hp / maxHp) * 100;
        hpFill.style.width = percentage + '%';
        hpText.textContent = `${Math.ceil(hp)}/${maxHp}`;
        
        // Cor baseada na porcentagem
        if (percentage > 60) {
            hpFill.style.background = 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 50%, #4CAF50 100%)';
        } else if (percentage > 30) {
            hpFill.style.background = 'linear-gradient(90deg, #FF9800 0%, #FFB74D 50%, #FF9800 100%)';
        } else {
            hpFill.style.background = 'linear-gradient(90deg, #F44336 0%, #EF5350 50%, #F44336 100%)';
        }
    }
    
    updateSoulOrbsDisplay(count) {
        document.getElementById('soulOrbsText').textContent = `Orbes: ${count}`;
    }
    
    updateWaveDisplay(wave) {
        document.getElementById('waveText').textContent = `Onda: ${wave}`;
    }
    
    updateTimeDisplay(time) {
        document.getElementById('timerText').textContent = TimeUtils.formatTime(time);
    }
    
    // Controles do jogo
    startNewGame() {
        this.state = 'playing';
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        
        // Criar jogador
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        
        // Criar sistema de ondas
        this.waveSystem = new WaveSystem();
        
        // Event listeners
        this.setupGameEventListeners();
        
        // Limpar arrays
        this.soulOrbs = [];
        
        // Esconder menu
        this.hideAllMenus();
        
        // Mostrar controles móveis se necessário
        if (DeviceUtils.isMobile()) {
            document.getElementById('mobileControls').style.display = 'block';
        }
    }
    
    setupGameEventListeners() {
        // Player events
        this.player.on('death', () => {
            this.gameOver();
        });
        
        // Wave system events
        this.waveSystem.on('waveStart', (wave) => {
            this.audioSystem.playSound('waveStart');
        });
        
        this.waveSystem.on('waveComplete', (wave) => {
            this.audioSystem.playSound('waveComplete');
        });
        
        this.waveSystem.on('enemyKilled', (enemy) => {
            this.audioSystem.playSound('enemyDeath');
        });
        
        this.waveSystem.on('soulOrbDrop', (orbData) => {
            const orb = this.soulOrbPool.get();
            Object.assign(orb, orbData);
            orb.lifetime = 30000;
            this.soulOrbs.push(orb);
        });
    }
    
    togglePause() {
        if (this.state === 'playing') {
            this.pauseGame();
        } else if (this.state === 'paused') {
            this.resumeGame();
        }
    }
    
    pauseGame() {
        this.state = 'paused';
        document.getElementById('pauseMenu').classList.remove('hidden');
    }
    
    resumeGame() {
        this.state = 'playing';
        document.getElementById('pauseMenu').classList.add('hidden');
    }
    
    gameOver() {
        this.state = 'gameOver';
        
        // Salvar high score
        this.saveHighScore();
        
        // Limpar save game
        Storage.remove('seraphsLastStand_save');
        
        setTimeout(() => {
            this.showMainMenu();
        }, 5000);
    }
    
    showMainMenu() {
        this.state = 'menu';
        this.hideAllMenus();
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('mobileControls').style.display = 'none';
    }
    
    hideAllMenus() {
        document.querySelectorAll('.menu').forEach(menu => {
            menu.classList.add('hidden');
        });
    }
    
    // Input handling
    handleKeyDown(key) {
        if (this.state === 'playing' && this.player) {
            switch (key) {
                case 'KeyW':
                case 'ArrowUp':
                    this.player.setInput('up', true);
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.player.setInput('down', true);
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.player.setInput('left', true);
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.player.setInput('right', true);
                    break;
                case 'Space':
                    this.player.setInput('special', true);
                    break;
            }
        }
        
        // Controles globais
        switch (key) {
            case 'Escape':
                if (this.state === 'playing') {
                    this.pauseGame();
                } else if (this.state === 'paused') {
                    this.resumeGame();
                }
                break;
            case 'KeyR':
                if (this.state === 'gameOver') {
                    this.startNewGame();
                }
                break;
        }
    }
    
    handleKeyUp(key) {
        if (this.state === 'playing' && this.player) {
            switch (key) {
                case 'KeyW':
                case 'ArrowUp':
                    this.player.setInput('up', false);
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.player.setInput('down', false);
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.player.setInput('left', false);
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.player.setInput('right', false);
                    break;
                case 'Space':
                    this.player.setInput('special', false);
                    break;
            }
        }
    }
    
    // Save/Load
    autoSave() {
        if (this.state !== 'playing') return;
        
        const saveData = {
            gameTime: this.gameTime,
            wave: this.waveSystem.currentWave,
            playerData: {
                hp: this.player.hp,
                soulOrbs: this.player.soulOrbs,
                x: this.player.x,
                y: this.player.y
            },
            timestamp: Date.now()
        };
        
        Storage.save('seraphsLastStand_save', saveData);
    }
    
    loadGame(saveData) {
        // Implementar carregamento de save
        this.startNewGame();
        
        // Restaurar dados
        this.gameTime = saveData.gameTime;
        this.waveSystem.currentWave = saveData.wave;
        
        if (saveData.playerData) {
            this.player.hp = saveData.playerData.hp;
            this.player.soulOrbs = saveData.playerData.soulOrbs;
            this.player.x = saveData.playerData.x;
            this.player.y = saveData.playerData.y;
        }
    }
    
    saveHighScore() {
        const scores = Storage.load('seraphsLastStand_scores', []);
        const newScore = {
            wave: this.waveSystem.currentWave,
            time: this.gameTime,
            enemies: this.waveSystem.enemiesKilled,
            soulOrbs: this.player.soulOrbs,
            date: new Date().toISOString()
        };
        
        scores.push(newScore);
        scores.sort((a, b) => b.wave - a.wave);
        scores.splice(10); // Manter apenas top 10
        
        Storage.save('seraphsLastStand_scores', scores);
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

// Debug mode
window.DEBUG = false;
window.toggleDebug = () => {
    window.DEBUG = !window.DEBUG;
    console.log('Debug mode:', window.DEBUG);
};

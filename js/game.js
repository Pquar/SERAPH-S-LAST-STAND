// game.js - Core game loop e sistema principal
// Última atualização: 2025-06-23 - Fix upgrade system

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
        this.soulOrbs = []; // Array para soul orbs coletáveis
        
        // Sistemas
        this.inputManager = new InputManager();
        this.ui = new UI();
        this.audioSystem = new AudioSystem();
        this.rankingSystem = new RankingSystem();
        this.playerNamePrompt = new PlayerNamePrompt();
        this.equipmentManager = new EquipmentManager();
        
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
        console.log('Inicializando jogo...');
        this.setupCanvas();
        console.log('Canvas configurado');
        this.setupEventListeners();
        console.log('Event listeners configurados');
        this.setupUI();
        console.log('UI configurada');
        this.initializeShop();
        console.log('Loja inicializada');
        
        // Começar com o menu
        this.showMainMenu();
        console.log('Menu principal mostrado');
        
        // Iniciar loop principal
        this.gameLoop();
        console.log('Game loop iniciado');
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
        // Input events para controles de sidescroller
        this.inputManager.on('keyDown', (key) => {
            this.handleKeyDown(key);
        });
        
        this.inputManager.on('keyUp', (key) => {
            this.handleKeyUp(key);
        });
        
        // Mouse events para mira e tiro
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.player && this.state === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                this.player.setMousePosition(mouseX, mouseY);
            }
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (this.player && this.state === 'playing') {
                e.preventDefault();
                this.player.startShooting();
            } else if (this.state === 'paused' && this.upgradeSystem && this.upgradeSystem.isUpgradeMenuOpen) {
                // Verificar clique em carta de upgrade
                e.preventDefault();
                this.handleUpgradeCardClick(mouseX, mouseY);
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.player && this.state === 'playing') {
                e.preventDefault();
                this.player.stopShooting();
            }
        });
        
        // Mobile controls - DESABILITADOS para evitar conflitos
        // Os controles mobile agora são gerenciados pelos eventos joystickMove/Stop e botões específicos
        /*
        this.inputManager.on('mobileMove', (direction) => {
            if (this.player) {
                const controls = { left: false, right: false };
                if (direction === 'left') controls.left = true;
                if (direction === 'right') controls.right = true;
                this.player.setMobileControls(controls);
            }
        });
        
        this.inputManager.on('mobileJump', () => {
            if (this.player) {
                this.player.setMobileControls({ jump: true });
            }
        });
        
        this.inputManager.on('mobileShoot', (aimX, aimY, shooting) => {
            if (this.player) {
                this.player.setMobileControls({ 
                    shooting: shooting,
                    aimX: aimX,
                    aimY: aimY 
                });
            }
        });
        */
        
        // Novos controles mobile - DESABILITADOS COMPLETAMENTE em desktop
        this.ui.on('joystickMove', (normalizedX, normalizedY) => {
            // IGNORAR COMPLETAMENTE se não for dispositivo móvel
            if (!DeviceUtils.isMobile()) {
                console.log('Joystick event BLOCKED - not a mobile device'); // Debug
                return; // Sair imediatamente
            }
            
            // Verificar se o jogo está rodando
            if (this.player && this.state === 'playing') {
                console.log('Joystick move (mobile only):', { normalizedX, normalizedY }); // Debug
                
                // Zona morta para evitar movimento fantasma
                const threshold = 0.3; 
                
                // Aplicar movimento apenas se estiver fora da zona morta
                if (Math.abs(normalizedX) > threshold) {
                    if (normalizedX < -threshold) {
                        this.player.setInput('left', true);
                        this.player.setInput('right', false);
                        console.log('Mobile: Setting left input to true');
                    } else if (normalizedX > threshold) {
                        this.player.setInput('left', false);
                        this.player.setInput('right', true);
                        console.log('Mobile: Setting right input to true');
                    }
                } else {
                    // Na zona morta - parar movimento
                    this.player.setInput('left', false);
                    this.player.setInput('right', false);
                    console.log('Mobile: In dead zone - stopping movement');
                }
                
                // Mira (apenas se houver movimento significativo)
                if (Math.abs(normalizedX) > 0.2 || Math.abs(normalizedY) > 0.2) {
                    const centerX = this.canvas.width / 2;
                    const centerY = this.canvas.height / 2;
                    const aimX = centerX + normalizedX * 100;
                    const aimY = centerY + normalizedY * 100;
                    this.player.setMousePosition(aimX, aimY);
                }
            }
        });
        
        this.ui.on('joystickStop', () => {
            // IGNORAR COMPLETAMENTE se não for dispositivo móvel
            if (!DeviceUtils.isMobile()) {
                console.log('Joystick stop BLOCKED - not a mobile device'); // Debug
                return; // Sair imediatamente
            }
            
            if (this.player) {
                console.log('Joystick stop - clearing movement (mobile only)'); // Debug
                // Parar movimento completamente quando joystick for solto
                this.player.setInput('left', false);
                this.player.setInput('right', false);
                // Garantir que a velocidade horizontal seja zerada
                this.player.vx = 0;
            }
        });
        
        this.ui.on('mobileShootStart', () => {
            console.log('Mobile shoot start event received');
            if (this.player) {
                this.player.startShooting();
            }
        });
        
        this.ui.on('mobileShootStop', () => {
            console.log('Mobile shoot stop event received');
            if (this.player) {
                this.player.stopShooting();
            }
        });
        
        this.ui.on('mobileJump', () => {
            console.log('Mobile jump event received');
            if (this.player) {
                this.player.setInput('jump', true);
                // Soltar o pulo após um tempo para simular tap
                setTimeout(() => {
                    if (this.player) {
                        this.player.setInput('jump', false);
                    }
                }, 100);
            }
        });
        
        this.ui.on('pausePress', () => {
            this.togglePause();
        });
        
        // UI events - estes elementos são criados dinamicamente
        // Os event listeners do menu principal são configurados no showMainMenu()
        
        // Event listeners para elementos que sempre existem
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
        
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.resumeGame();
            });
        }
        
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                this.showMainMenu();
            });
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
        
        // Event listeners para ranking
        this.ui.on('clearRanking', () => {
            this.rankingSystem.clearRankings();
        });
        
        this.rankingSystem.on('newRecord', (entry, position) => {
            this.ui.showNewRecordPopup(position, entry);
        });
        
        // Event listeners para loja
        this.ui.on('buyItem', (category, itemId) => {
            this.buyItem(category, itemId);
        });
        
        this.ui.on('equipItem', (category, itemId) => {
            this.equipItem(category, itemId);
        });
        
        // Event listeners para configurações
        this.ui.on('audioToggled', (enabled) => {
            if (enabled) {
                this.audioSystem.unmute();
            } else {
                this.audioSystem.mute();
            }
            // Salvar configurações imediatamente
            this.audioSystem.saveSettings();
        });
        
        this.ui.on('masterVolumeChanged', (volume) => {
            this.audioSystem.setMasterVolume(volume);
            // Salvar configurações imediatamente
            this.audioSystem.saveSettings();
        });
        
        this.ui.on('sfxVolumeChanged', (volume) => {
            this.audioSystem.setSfxVolume(volume);
            // Salvar configurações imediatamente
            this.audioSystem.saveSettings();
        });
        
        this.ui.on('settingsSaved', (settings) => {
            // Salvar nome do jogador no PlayerNamePrompt
            this.playerNamePrompt.savePlayerName(settings.playerName);
            
            // Atualizar nome no player atual se existir
            if (this.player) {
                this.player.setPlayerName(settings.playerName);
            }
            
            // Salvar multiplicador de XP
            this.setXpMultiplier(settings.xpMultiplier);
            
            // Salvar configurações de áudio
            this.audioSystem.saveSettings();
            
            // Salvar jogo para persistir as mudanças
            this.saveGame();
            
            alert('Configurações salvas com sucesso!');
        });
        
        this.ui.on('resetSettings', () => {
            // Restaurar configurações padrão
            this.audioSystem.setMasterVolume(0.7);
            this.audioSystem.setSfxVolume(0.8);
            this.audioSystem.unmute();
            this.setXpMultiplier(1.0);
            this.playerNamePrompt.savePlayerName('Player');
            
            // Atualizar nome no player atual se existir
            if (this.player) {
                this.player.setPlayerName('Player');
            }
            
            // Salvar jogo para persistir as mudanças
            this.saveGame();
            
            alert('Configurações restauradas para o padrão!');
        });
        
        // Event listeners para ranking e configurações
        this.ui.on('showRanking', () => {
            this.showRanking();
        });
        
        this.ui.on('showSettings', () => {
            this.showSettings();
        });
    }
    
    // Sistema de Loja de Equipamentos
    initializeShop() {
        console.log('Inicializando sistema de loja');
        
        // Event listeners para ações da loja
        this.ui.on('buyEquipment', (data) => this.buyEquipment(data));
        this.ui.on('equipItem', (data) => this.equipItem(data));
        
        // Inicializar player com equipamentos básicos se não existir
        if (!this.player) {
            this.player = new Player(400, 300);
        }
        
        // Garantir que o player tenha as estruturas de equipamentos
        if (!this.player.ownedEquipment) {
            this.player.ownedEquipment = {
                hats: [],
                staffs: []
            };
        }
        
        if (!this.player.equippedEquipment) {
            this.player.equippedEquipment = {
                hats: null,
                staffs: null
            };
        }
    }
    
    showShop() {
        console.log('Mostrando loja');
        
        // Garantir que o player existe
        if (!this.player) {
            this.player = new Player(400, 300);
        }
        
        const playerData = this.getPlayerData();
        const equipmentData = this.equipmentManager.getAllEquipment();
        
        this.ui.showShopModal(playerData, equipmentData);
        
        // Pausar o jogo se estiver jogando
        if (this.state === 'playing') {
            this.pauseGame();
        }
    }
    
    buyEquipment({ type, itemId }) {
        console.log('Comprando equipamento:', { type, itemId });
        
        if (!this.player) {
            console.error('Player não existe');
            return;
        }
        
        const equipment = this.equipmentManager.getEquipment(type, itemId);
        if (!equipment) {
            console.error('Equipamento não encontrado:', { type, itemId });
            return;
        }
        
        // Verificar se o jogador tem Soul Orbs suficientes
        if (this.player.soulOrbs < equipment.cost) {
            console.log('Soul Orbs insuficientes para comprar:', equipment.name);
            this.showMessage(`Soul Orbs insuficientes! Precisa de ${equipment.cost} orbs.`);
            return;
        }
        
        // Verificar se o jogador já possui o item
        if (this.player.ownedEquipment[type].includes(itemId)) {
            console.log('Jogador já possui este equipamento:', equipment.name);
            this.showMessage('Você já possui este equipamento!');
            return;
        }
        
        // Realizar a compra
        this.player.soulOrbs -= equipment.cost;
        this.player.ownedEquipment[type].push(itemId);
        
        console.log('Equipamento comprado com sucesso:', equipment.name);
        this.showMessage(`${equipment.name} comprado com sucesso!`);
        
        // Atualizar a interface da loja
        const playerData = this.getPlayerData();
        const equipmentData = this.equipmentManager.getAllEquipment();
        this.ui.updateShop(playerData, equipmentData);
        
        // Salvar progresso
        this.saveGame();
    }
    
    equipItem({ type, itemId }) {
        console.log('Equipando item:', { type, itemId });
        
        if (!this.player) {
            console.error('Player não existe');
            return;
        }
        
        const equipment = this.equipmentManager.getEquipment(type, itemId);
        if (!equipment) {
            console.error('Equipamento não encontrado:', { type, itemId });
            return;
        }
        
        // Verificar se o jogador possui o item
        if (!this.player.ownedEquipment[type].includes(itemId)) {
            console.log('Jogador não possui este equipamento:', equipment.name);
            this.showMessage('Você não possui este equipamento!');
            return;
        }
        
        // Desequipar item atual se houver
        const currentEquipped = this.player.equippedEquipment[type];
        if (currentEquipped) {
            this.equipmentManager.unapplyEquipmentEffects(this.player, type, currentEquipped);
            console.log('Desequipando item anterior:', currentEquipped);
        }
        
        // Equipar novo item
        this.player.equippedEquipment[type] = itemId;
        this.equipmentManager.applyEquipmentEffects(this.player, type, itemId);
        
        console.log('Equipamento equipado com sucesso:', equipment.name);
        this.showMessage(`${equipment.name} equipado!`);
        
        // Recalcular stats do jogador
        if (this.player.updateStats) {
            this.player.updateStats();
        }
        
        // Atualizar a interface da loja
        const playerData = this.getPlayerData();
        const equipmentData = this.equipmentManager.getAllEquipment();
        this.ui.updateShop(playerData, equipmentData);
        
        // Salvar progresso
        this.saveGame();
    }
    
    getPlayerData() {
        if (!this.player) {
            return {
                soulOrbs: 0,
                ownedEquipment: { hats: [], staffs: [] },
                equippedEquipment: { hats: null, staffs: null },
                level: 1,
                experience: 0,
                experienceToNext: 100,
                stats: {
                    damage: 15,
                    defense: 0,
                    speed: 200,
                    maxHp: 100,
                    hp: 100
                }
            };
        }
        
        return {
            soulOrbs: this.player.soulOrbs || 0,
            ownedEquipment: this.player.ownedEquipment || { hats: [], staffs: [] },
            equippedEquipment: this.player.equippedEquipment || { hats: null, staffs: null },
            level: this.player.level || 1,
            experience: this.player.exp || 0,
            experienceToNext: this.player.expToNext || 100,
            stats: {
                damage: this.player.damage || 15,
                defense: this.player.defense || 0,
                speed: this.player.speed || 200,
                maxHp: this.player.maxHp || 100,
                hp: this.player.hp || 100
            }
        };
    }
    
    showMessage(message, duration = 3000) {
        // Criar elemento de mensagem
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            border: 2px solid #4CAF50;
            font-size: 16px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut ${duration}ms ease-in-out;
        `;
        
        // Adicionar animação CSS se não existir
        if (!document.getElementById('message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    90% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageElement);
        
        // Remover mensagem após duração
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, duration);
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
        
        // Renderizar apenas se o jogo estiver ativo
        if (this.state === 'playing' || this.state === 'paused') {
            this.render();
        }
        
        // Continuar loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Atualizar entidades
        if (this.player && this.terrain) {
            const platforms = this.terrain.getPlatforms();
            this.player.update(deltaTime, this.enemySpawner.getEnemies(), this.canvas, platforms);
            
            // Atualizar tempo de sobrevivência
            this.player.updateSurvivalTime(deltaTime);
        }
        
        if (this.enemySpawner) {
            this.enemySpawner.update(deltaTime, this.player, this.canvas);
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
        
        // Renderizar terreno
        if (this.terrain) {
            this.terrain.render(this.ctx);
        }
        
        // Renderizar entidades
        if (this.enemySpawner) {
            this.enemySpawner.render(this.ctx);
        }
        
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Renderizar soul orbs
        this.renderSoulOrbs();
        
        // Renderizar HUD
        if (this.player) {
            this.ui.renderHUD(this.ctx, this.player);
        }
        
        // Renderizar menu de upgrade se estiver aberto
        if (this.upgradeSystem) {
            this.upgradeSystem.renderUpgradeMenu(this.ctx, this.canvas);
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
    
    // Sistema de Soul Orbs
    createSoulOrb(x, y, value = 1) {
        const soulOrb = this.soulOrbPool.get();
        soulOrb.x = x + (Math.random() - 0.5) * 20; // Pequena variação na posição
        soulOrb.y = y + (Math.random() - 0.5) * 20;
        soulOrb.value = value;
        soulOrb.size = 8;
        soulOrb.collected = false;
        soulOrb.alpha = 1.0;
        soulOrb.lifetime = 30000; // 30 segundos
        soulOrb.createdAt = Date.now();
        
        this.soulOrbs.push(soulOrb);
    }
    
    updateSoulOrbs(deltaTime) {
        this.soulOrbs = this.soulOrbs.filter(orb => {
            if (orb.collected) return false;
            
            // Verificar coleta pelo jogador
            if (this.player && this.isNearPlayer(orb.x, orb.y, this.player.x, this.player.y, this.player.size + 15)) {
                this.player.collectSoulOrb(orb.value);
                orb.collected = true;
                this.audioSystem.playSound('soulOrb');
                this.soulOrbPool.release(orb);
                return false;
            }
            
            // Fade out após 25 segundos
            const age = Date.now() - orb.createdAt;
            if (age > 25000) {
                orb.alpha = Math.max(0, 1 - (age - 25000) / 5000);
                if (orb.alpha <= 0) {
                    this.soulOrbPool.release(orb);
                    return false;
                }
            }
            
            return true;
        });
    }
    
    isNearPlayer(x1, y1, x2, y2, distance) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy) < distance;
    }
    
    renderSoulOrbs() {
        for (let orb of this.soulOrbs) {
            if (!orb.collected) {
                this.ctx.globalAlpha = orb.alpha;
                
                // Efeito de brilho pulsante
                const time = Date.now() * 0.005;
                const pulseSize = orb.size + Math.sin(time + orb.x * 0.01) * 2;
                
                // Soul orb principal
                this.ctx.fillStyle = '#66ffff';
                this.ctx.beginPath();
                this.ctx.arc(orb.x, orb.y, pulseSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Núcleo brilhante
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(orb.x, orb.y, pulseSize * 0.6, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Halo externo
                this.ctx.globalAlpha = orb.alpha * 0.3;
                this.ctx.fillStyle = '#66ffff';
                this.ctx.beginPath();
                this.ctx.arc(orb.x, orb.y, pulseSize * 1.5, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.globalAlpha = 1.0;
            }
        }
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
        
        // Criar terreno
        this.terrain = new Terrain(this.canvas.width, this.canvas.height);
        
        // Criar jogador no centro da tela, mas no chão
        const spawnX = this.canvas.width / 2;
        const spawnY = this.canvas.height - 100; // próximo ao chão
        this.player = new Player(spawnX, spawnY);
        
        // Limpar build anterior (nova partida = nova build)
        this.player.selectedCards = [];
        this.player.cardEffects = {};
        this.player.onKillEffects = [];
        this.player.cardStacks = {};
        
        // Limpar soul orbs
        this.soulOrbs = [];
        
        // Limpar todos os inputs para evitar movimento automático
        if (this.player && this.player.clearAllInputs) {
            this.player.clearAllInputs();
        }
        
        // Desabilitar controles mobile permanentemente em desktop
        if (!DeviceUtils.isMobile() && this.player && this.player.disableMobileControls) {
            this.player.disableMobileControls();
        }
        
        // Criar sistema de spawn de inimigos
        this.enemySpawner = new EnemySpawner();
        
        // O waveSystem é o mesmo que o enemySpawner (compatibilidade)
        this.waveSystem = this.enemySpawner;
        
        // Criar sistema de upgrades
        this.upgradeSystem = new UpgradeSystem();
        
        // Event listeners
        this.setupGameEventListeners();
        
        // Esconder menu
        this.hideAllMenus();
        
        // Mostrar canvas e HUD do jogo
        this.canvas.style.display = 'block';
        const gameHUD = document.getElementById('gameHUD');
        if (gameHUD) {
            gameHUD.style.display = 'block';
        }
        
        // Mostrar controles móveis se necessário
        if (DeviceUtils.isMobile()) {
            const mobileControls = document.getElementById('mobileControls');
            if (mobileControls) {
                mobileControls.style.display = 'block';
            }
        }
    }
    
    startGame() {
        // Carregar dados salvos se existirem
        this.loadGame();
        
        // Inicializar o player se não existir
        if (!this.player) {
            const spawnX = 400;
            const spawnY = 300;
            this.player = new Player(spawnX, spawnY);
        }
        
        // Limpar todos os inputs para garantir que não há movimento automático
        if (this.player.clearAllInputs) {
            this.player.clearAllInputs();
        }
        
        // Desabilitar controles mobile permanentemente em desktop
        if (!DeviceUtils.isMobile() && this.player.disableMobileControls) {
            this.player.disableMobileControls();
        }
        
        // Garantir que o nome do player está atualizado
        const savedPlayerName = this.playerNamePrompt.loadPlayerName();
        if (savedPlayerName) {
            this.player.setPlayerName(savedPlayerName);
        }
        
        // Atualizar stats do player com equipamentos
        this.player.updateStats();
        
        // Iniciar novo jogo
        this.startNewGame();
    }

    setupGameEventListeners() {
        // Player events
        this.player.on('death', () => {
            this.gameOver();
        });
        
        this.player.on('levelUp', (level) => {
            this.handlePlayerLevelUp(level);
        });
        
        this.player.on('expGained', (amount, currentExp, expToNext) => {
            // A barra de EXP é atualizada automaticamente no renderHUD do UI
            // this.updateExpBar(currentExp, expToNext);
        });
        
        this.player.on('critical', () => {
            this.audioSystem.playSound('critical');
        });
        
        // Enemy spawner events
        this.enemySpawner.on('enemyKilled', (enemy) => {
            this.audioSystem.playSound('enemyDeath');
            
            // Criar soul orb na posição do inimigo
            this.createSoulOrb(enemy.x, enemy.y, 1);
            
            // Atualizar estatísticas do player
            if (this.player) {
                this.player.addKill(enemy);
            }
        });
        
        // Player events para estatísticas
        this.player.on('hit', (enemy, damage) => {
            // Verificar se foi crítico
            const isCritical = damage > this.player.damage;
            this.player.addDamage(damage, isCritical);
            this.player.addShot(true); // Tiro que acertou
        });
        
        this.player.on('shot', () => {
            this.player.addShot(false); // Tiro disparado
        });
        
        // Upgrade system events
        this.upgradeSystem.on('upgradeMenuOpened', (options) => {
            this.state = 'paused'; // Pausar sem mostrar menu de pausa
            this.showUpgradeMenu(options);
        });
        
        this.upgradeSystem.on('upgradeSelected', (upgrade) => {
            this.hideUpgradeMenu();
            this.state = 'playing'; // Retomar sem usar resumeGame
            this.audioSystem.playSound('upgradeSelected');
        });
    }
    
    handlePlayerLevelUp(level) {
        this.audioSystem.playSound('levelUp');
        
        // Pausar o jogo antes de mostrar o menu
        this.state = 'paused';
        
        // Mostrar menu de upgrade
        this.upgradeSystem.showUpgradeMenu(this.player);
    }
    
    // Método para mostrar menu de upgrade
    showUpgradeMenu(options) {
        if (this.upgradeSystem) {
            this.upgradeSystem.renderUpgradeMenu(this.ctx, this.canvas);
        }
    }
    
    // Método para esconder menu de upgrade
    hideUpgradeMenu() {
        // O upgrade system cuida da lógica de esconder
        if (this.upgradeSystem) {
            this.upgradeSystem.hideUpgradeMenu();
        }
    }
    
    // Método para lidar com cliques em cartas de upgrade
    handleUpgradeCardClick(mouseX, mouseY) {
        if (this.upgradeSystem && this.upgradeSystem.isUpgradeMenuOpen) {
            const cardId = this.upgradeSystem.handleClick(mouseX, mouseY);
            if (cardId) {
                // Processar a seleção da carta
                const success = this.upgradeSystem.selectUpgrade(cardId, this.player);
                if (success) {
                    // Retomar o jogo após seleção
                    this.state = 'playing';
                }
            }
        }
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
        
        // Limpar inputs do player quando pausar
        if (this.player && this.player.clearAllInputs) {
            this.player.clearAllInputs();
        }
        
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.classList.remove('hidden');
            pauseMenu.style.display = 'flex';
            pauseMenu.style.zIndex = '9999';
            console.log('Menu de pausa mostrado'); // Debug
        } else {
            console.error('Elemento pauseMenu não encontrado'); // Debug
        }
    }
    
    resumeGame() {
        this.state = 'playing';
        
        // Limpar inputs do player quando retomar
        if (this.player && this.player.clearAllInputs) {
            this.player.clearAllInputs();
        }
        
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.classList.add('hidden');
            pauseMenu.style.display = 'none';
            console.log('Menu de pausa escondido'); // Debug
        }
    }
    
    gameOver() {
        this.state = 'gameOver';
        
        // Limpar inputs do player quando o jogo acabar
        if (this.player && this.player.clearAllInputs) {
            this.player.clearAllInputs();
        }
        
        // Atualizar tempo de sobrevivência
        if (this.player) {
            this.player.updateSurvivalTime(Date.now() - this.gameStartTime);
        }
        
        // Salvar high score e adicionar ao ranking
        this.saveHighScore();
        this.addToRanking();
        
        // Limpar save game
        Storage.remove('seraphsLastStand_save');
        
        setTimeout(() => {
            this.showMainMenu();
        }, 5000);
    }
    
    // Adicionar pontuação ao ranking
    addToRanking() {
        if (!this.player) return;
        
        // Verificar se a pontuação merece entrar no ranking
        if (this.rankingSystem.wouldMakeRanking(this.player.score)) {
            // Prompt para nome do jogador
            this.playerNamePrompt.showNamePrompt((playerName) => {
                this.player.setPlayerName(playerName);
                const stats = this.player.getStats();
                this.rankingSystem.addScore(stats);
            });
        }
    }
    
    showMainMenu() {
        this.state = 'menu'; // Garantir que o estado seja menu
        this.currentScreen = 'mainMenu';
        
        // Ocultar canvas e HUD do jogo
        this.canvas.style.display = 'none';
        const gameHUD = document.getElementById('gameHUD');
        if (gameHUD) {
            gameHUD.style.display = 'none';
        }
        
        // Ocultar controles móveis
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.display = 'none';
        }
        
        // Remover menu existente antes de criar um novo
        this.hideMainMenu();
        
        // Inicializar player se não existir para mostrar stats
        if (!this.player) {
            this.player = new Player(400, 300);
            this.loadGame(); // Carregar dados salvos
        }
        
        // Carregar nome atualizado do PlayerNamePrompt
        const savedPlayerName = this.playerNamePrompt.loadPlayerName();
        if (savedPlayerName && this.player) {
            this.player.setPlayerName(savedPlayerName);
        }
        
        const menu = document.createElement('div');
        menu.id = 'main-menu';
        menu.className = 'main-menu';
        // Verificar se há save game para mostrar botão continuar
        let continueButton = '';
        try {
            const saveData = localStorage.getItem('seraphsLastStandSave');
            if (saveData) {
                continueButton = '<button id="continueGameBtn" class="menu-btn">🔄 Continuar</button>';
            }
        } catch (error) {
            console.log('Erro ao verificar save game:', error);
        }
        
        menu.innerHTML = `
            <div class="menu-container">
                <h1 class="game-title">SERAPH'S LAST STAND</h1>
                <div class="menu-buttons">
                    <button id="startGameBtn" class="menu-btn">Iniciar Jogo</button>
                    ${continueButton}
                    <button id="shopBtn" class="menu-btn">🛒 Loja</button>
                    <button id="rankingBtn" class="menu-btn">🏆 Ranking</button>
                    <button id="settingsBtn" class="menu-btn">⚙️ Configurações</button>
                </div>
                <div class="menu-stats">
                    <div class="stat-item">
                        <span class="stat-label">Soul Orbs:</span>
                        <span class="stat-value">${this.player.soulOrbs || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Nível:</span>
                        <span class="stat-value">${this.player.level || 1}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(menu);
        this.addMainMenuStyles();
        
        // Event listeners
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.hideMainMenu();
            this.startGame();
        });
        
        // Botão continuar (se existir)
        const continueBtn = document.getElementById('continueGameBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.hideMainMenu();
                this.loadGame();
                this.startGame();
            });
        }
        
        document.getElementById('shopBtn').addEventListener('click', () => {
            this.showShop();
        });
        
        document.getElementById('rankingBtn').addEventListener('click', () => {
            this.showRanking();
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });
    }
    
    hideMainMenu() {
        const menu = document.getElementById('main-menu');
        if (menu) {
            menu.remove();
        }
    }
    
    addMainMenuStyles() {
        if (document.getElementById('main-menu-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'main-menu-styles';
        style.textContent = `
            .main-menu {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0a0a0a, #1a1a1a, #0a0a0a);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9000;
            }
            
            .menu-container {
                text-align: center;
                background: rgba(20, 20, 20, 0.9);
                padding: 40px;
                border-radius: 20px;
                border: 2px solid #333;
                box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
                min-width: 400px;
            }
            
            .game-title {
                font-size: 48px;
                font-weight: bold;
                color: #fff;
                margin-bottom: 30px;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .menu-buttons {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .menu-btn {
                padding: 15px 30px;
                font-size: 18px;
                font-weight: bold;
                background: linear-gradient(135deg, #2a2a2a, #1a2a2a);
                color: white;
                border: 2px solid #333;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .menu-btn:hover {
                border-color: #4CAF50;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
                background: linear-gradient(135deg, #3a3a3a, #2a2a2a);
            }
            
            .menu-btn:active {
                transform: translateY(0);
            }
            
            .menu-stats {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #333;
            }
            
            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
            
            .stat-label {
                font-size: 14px;
                color: #ccc;
            }
            
            .stat-value {
                font-size: 20px;
                font-weight: bold;
                color: #4CAF50;
            }
            
            @media (max-width: 600px) {
                .menu-container {
                    padding: 20px;
                    min-width: 300px;
                }
                
                .game-title {
                    font-size: 32px;
                }
                
                .menu-btn {
                    padding: 12px 24px;
                    font-size: 16px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Sistema de save/load
    saveGame() {
        const gameData = {
            player: {
                soulOrbs: this.player.soulOrbs,
                level: this.player.level,
                experience: this.player.exp,
                ownedEquipment: this.player.ownedEquipment,
                equippedEquipment: this.player.equippedEquipment,
                playerName: this.player.playerName,
                selectedCards: this.player.selectedCards || [] // Salvar build
            },
            settings: {
                audioEnabled: !this.audioSystem.isMuted(),
                masterVolume: this.audioSystem.masterVolume,
                sfxVolume: this.audioSystem.sfxVolume,
                musicVolume: this.audioSystem.musicVolume,
                expMultiplier: this.expMultiplier || 1
            },
            timestamp: Date.now()
        };
        
        localStorage.setItem('seraphsLastStandSave', JSON.stringify(gameData));
        console.log('Jogo salvo:', gameData);
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem('seraphsLastStandSave');
            if (!saveData) return false;
            
            const gameData = JSON.parse(saveData);
            console.log('Carregando jogo:', gameData);
            
            // Aplicar dados do jogador
            if (gameData.player) {
                this.player.soulOrbs = gameData.player.soulOrbs || 0;
                this.player.level = gameData.player.level || 1;
                this.player.exp = gameData.player.experience || 0;
                this.player.setPlayerName(gameData.player.playerName || this.playerNamePrompt.loadPlayerName() || 'Player');
                
                // Equipamentos
                if (gameData.player.ownedEquipment) {
                    this.player.ownedEquipment = gameData.player.ownedEquipment;
                }
                if (gameData.player.equippedEquipment) {
                    this.player.equippedEquipment = gameData.player.equippedEquipment;
                }
                
                // Build (cartas escolhidas)
                if (gameData.player.selectedCards) {
                    this.player.selectedCards = gameData.player.selectedCards;
                }
            } else {
                // Se não há dados salvos, carregar nome do PlayerNamePrompt
                const savedName = this.playerNamePrompt.loadPlayerName();
                if (savedName && this.player) {
                    this.player.setPlayerName(savedName);
                }
            }
            
            // Aplicar configurações
            if (gameData.settings) {
                if (gameData.settings.audioEnabled === false) {
                    this.audioSystem.mute();
                } else {
                    this.audioSystem.unmute();
                }
                this.audioSystem.setMasterVolume(gameData.settings.masterVolume || 0.7);
                this.audioSystem.setSfxVolume(gameData.settings.sfxVolume || 0.8);
                this.audioSystem.setMusicVolume(gameData.settings.musicVolume || 0.5);
                this.expMultiplier = gameData.settings.expMultiplier || 1;
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao carregar jogo:', error);
            return false;
        }
    }
    
    showRanking() {
        console.log('Mostrando ranking');
        const rankings = this.rankingSystem.getRankings();
        this.ui.showRankingModal(rankings);
    }
    
    showSettings() {
        console.log('Mostrando configurações');
        
        // Carregar nome salvo do PlayerNamePrompt
        const savedPlayerName = this.playerNamePrompt.loadPlayerName();
        
        const settings = {
            playerName: savedPlayerName || (this.player ? this.player.playerName : 'Player'),
            audioEnabled: this.audioSystem ? !this.audioSystem.isMuted() : true,
            masterVolume: this.audioSystem ? this.audioSystem.masterVolume : 0.7,
            sfxVolume: this.audioSystem ? this.audioSystem.sfxVolume : 0.8,
            xpMultiplier: this.expMultiplier || 1.0
        };
        console.log('Settings object:', settings); // Debug
        this.ui.showSettingsModal(settings);
    }
    
    setXpMultiplier(multiplier) {
        this.expMultiplier = Math.max(0.5, Math.min(5.0, multiplier));
        console.log('XP Multiplier definido para:', this.expMultiplier);
    }
    
    // Métodos de controle de input
    handleKeyDown(key) {
        if (!this.player) return;
        
        // Controles específicos por estado do jogo
        if (this.state === 'playing') {
            switch (key) {
                case 'a':
                case 'A':
                case 'ArrowLeft':
                    this.player.setInput('left', true);
                    break;
                case 'd':
                case 'D':
                case 'ArrowRight':
                    this.player.setInput('right', true);
                    break;
                case ' ':
                case 'Space':
                    this.player.setInput('jump', true);
                    break;
                case 'p':
                case 'P':
                case 'Escape':
                    this.pauseGame();
                    break;
            }
        } else if (this.state === 'paused') {
            if (key === 'p' || key === 'P' || key === 'Escape') {
                this.resumeGame();
            }
        } else if (this.state === 'menu') {
            // Permitir navegação por teclado no menu se necessário
            if (key === 'Enter') {
                // Simular clique no botão de iniciar jogo se estiver no menu
                const startBtn = document.getElementById('startGameBtn');
                if (startBtn) {
                    startBtn.click();
                }
            }
        }
    }
    
    handleKeyUp(key) {
        if (!this.player) return;
        
        // Apenas processar se o jogo estiver ativo
        if (this.state === 'playing') {
            switch (key) {
                case 'a':
                case 'A':
                case 'ArrowLeft':
                    this.player.setInput('left', false);
                    break;
                case 'd':
                case 'D':
                case 'ArrowRight':
                    this.player.setInput('right', false);
                    break;
                case ' ':
                case 'Space':
                    this.player.setInput('jump', false);
                    break;
            }
        }
    }
    
    // Método para obter multiplicador de XP
    getXpMultiplier() {
        let multiplier = 1.0;
        
        // Multiplicador baseado no tempo de jogo (fica mais difícil)
        if (this.gameTime) {
            const timeInMinutes = this.gameTime / (1000 * 60);
            multiplier += timeInMinutes * 0.1; // 10% a mais a cada minuto
        }
        
        // Multiplicador baseado no nível do jogador
        if (this.player && this.player.level) {
            multiplier += (this.player.level - 1) * 0.05; // 5% a mais por nível
        }
        
        // Multiplicador baseado em equipamentos (se houver)
        // TODO: Implementar multiplicadores de equipamentos
        
        return Math.max(multiplier, 1.0); // Nunca menor que 1.0
    }
    
    // Salvar high score
    saveHighScore() {
        if (!this.player) return;
        
        const currentScore = this.player.score;
        let highScore = parseInt(localStorage.getItem('seraphsLastStand_highScore') || '0');
        
        if (currentScore > highScore) {
            localStorage.setItem('seraphsLastStand_highScore', currentScore.toString());
            console.log('Novo high score salvo:', currentScore);
            
            // Mostrar notificação de novo recorde
            this.showMessage(`🏆 NOVO RECORDE: ${currentScore} pontos!`, 5000);
            
            return true; // Indica que foi um novo recorde
        }
        
        return false;
    }
    
    // Obter high score salvo
    getHighScore() {
        return parseInt(localStorage.getItem('seraphsLastStand_highScore') || '0');
    }
    
    // Métodos auxiliares para controle de menus
    hideAllMenus() {
        // Esconder menus HTML que ainda existem
        const menus = ['pauseMenu'];
        menus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.add('hidden');
                menu.style.display = 'none';
            }
        });
        
        // Esconder menu dinâmico se existir
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.remove();
        }
        
        // Mostrar canvas
        this.canvas.style.display = 'block';
        
        // Mostrar UI do jogo
        this.ui.showUI();
    }
    
    autoSave() {
        if (this.player) {
            this.saveGame();
            console.log('Auto-save realizado');
        }
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado - inicializando jogo...');
    window.game = new Game();
    console.log('Jogo inicializado:', window.game);
});

// Fallback para navegadores mais antigos
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.game) {
            console.log('Fallback - inicializando jogo...');
            window.game = new Game();
        }
    });
} else {
    // DOM já carregou
    console.log('DOM já carregado - inicializando jogo imediatamente...');
    window.game = new Game();
}

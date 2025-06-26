// game.js - Core game loop e sistema principal
// Última atualização: 2025-06-24 - Refatoração para remover duplicações
// 
// REFATORAÇÃO APLICADA:
// 1. Removida duplicação do método showSettings() (linha 1692)
// 2. Unificados os métodos hideAllMenus() e hideAllOtherMenus()
// 3. Consolidados event listeners duplicados
// 4. Criado sistema híbrido para compatibilidade entre menus HTML e modais
// 5. Removidos event listeners redundantes de showRanking/showSettings em setupUI()

class Game extends EventEmitter {
    constructor() {
        super();
        
        // Canvas e contexto
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found! Make sure gameCanvas element exists in DOM.');
            throw new Error('Canvas element not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context from canvas!');
            throw new Error('Could not get 2D context from canvas');
        }
        
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
        
        // Configurações do jogo
        this.settings = {
            playerName: 'Player',
            audioEnabled: true,
            masterVolume: 0.7,
            sfxVolume: 0.8,
            xpMultiplier: 1.0
        };
        
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
        
        // Configurar event listeners dos menus uma única vez
        setTimeout(() => {
            this.setupAllMenuListeners();
            console.log('Menu listeners configurados');
        }, 100);
        
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
        
        // Definir tamanho base
        let width = 1024;
        let height = 768;
        let containerRect = null; // Declarar a variável no escopo correto
        
        // Se o container existir, usar suas dimensões
        if (container && container.getBoundingClientRect) {
            try {
                containerRect = container.getBoundingClientRect();
                // Use container dimensions if available
                if (containerRect.width > 0 && containerRect.height > 0) {
                    width = containerRect.width;
                    height = containerRect.height;
                }
            } catch (error) {
                console.warn('Error getting container rect, using default size:', error);
                containerRect = null; // Reset em caso de erro
            }
        } else {
            // Fallback para viewport ou valores padrão
            width = window.innerWidth || 1024;
            height = window.innerHeight || 768;
        }
        
        // Ajustar para dispositivos móveis
        if (typeof DeviceUtils !== 'undefined' && DeviceUtils.isMobile()) {
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
            // Desktop: ajustar ao container apenas se containerRect estiver disponível
            if (containerRect && containerRect.width > 0 && containerRect.height > 0) {
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
            if (typeof DeviceUtils === 'undefined' || !DeviceUtils.isMobile()) {
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
            if (typeof DeviceUtils === 'undefined' || !DeviceUtils.isMobile()) {
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
        
        // Event listeners para elementos que sempre existem - REMOVIDO duplicação
        // Os listeners de resumeBtn, restartBtn e mainMenuBtn são configurados em setupAllMenuListeners()
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
    }
    
    // Configurar todos os event listeners dos menus uma única vez
    setupAllMenuListeners() {
        console.log('Configurando listeners dos menus...');
        
        // Menu Principal - Botão Novo Jogo
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', (e) => {
                console.log('Botão Novo Jogo clicado');
                e.preventDefault();
                this.hideAllMenus();
                this.startGame();
            });
            console.log('Listener do botão Novo Jogo configurado');
        } else {
            console.error('Botão startGameBtn não encontrado');
        }
        
        // Menu Principal - Botão Carregar Jogo
        const loadGameBtn = document.getElementById('loadGameBtn');
        if (loadGameBtn) {
            loadGameBtn.addEventListener('click', (e) => {
                console.log('Botão Carregar Jogo clicado');
                e.preventDefault();
                this.loadGame();
                this.hideAllMenus();
                this.startGame();
            });
            console.log('Listener do botão Carregar Jogo configurado');
        }
        
        // Menu Principal - Botão Loja
        const shopBtn = document.getElementById('shopBtn');
        if (shopBtn) {
            shopBtn.addEventListener('click', (e) => {
                console.log('Botão Loja clicado');
                e.preventDefault();
                this.showShop();
            });
            console.log('Listener do botão Loja configurado');
        } else {
            console.error('Botão shopBtn não encontrado');
        }
        
        // Menu Principal - Botão Ranking
        const rankingBtn = document.getElementById('rankingBtn');
        if (rankingBtn) {
            rankingBtn.addEventListener('click', (e) => {
                console.log('Botão Ranking clicado');
                e.preventDefault();
                this.showRanking();
            });
            console.log('Listener do botão Ranking configurado');
        } else {
            console.error('Botão rankingBtn não encontrado');
        }
        
        // Menu Principal - Botão Configurações
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                console.log('Botão Configurações clicado');
                e.preventDefault();
                this.showSettings();
            });
            console.log('Listener do botão Configurações configurado');
        } else {
            console.error('Botão settingsBtn não encontrado');
        }
        
        // Menu de Pausa - Botão Continuar
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', (e) => {
                console.log('Botão Continuar clicado');
                e.preventDefault();
                this.resumeGame();
            });
        }
        
        // Menu de Pausa - Botão Reiniciar
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => {
                console.log('Botão Reiniciar clicado');
                e.preventDefault();
                this.startGame();
            });
        }
        
        // Menu de Pausa - Botão Menu Principal
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', (e) => {
                console.log('Botão Menu Principal clicado');
                e.preventDefault();
                this.showMainMenu();
            });
        }
        
        // Botões de fechar menus
        const closeShopBtn = document.getElementById('closeShopBtn');
        if (closeShopBtn) {
            closeShopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideShop();
            });
        }
        
        const closeRankingBtn = document.getElementById('closeRankingBtn');
        if (closeRankingBtn) {
            closeRankingBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideRanking();
            });
        }
        
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideSettings();
            });
        }
        
        // Botões do Game Over Menu
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', (e) => {
                console.log('Botão Jogar Novamente clicado');
                e.preventDefault();
                this.startGame();
            });
        }
        
        const backToMenuBtn = document.getElementById('backToMenuBtn');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', (e) => {
                console.log('Botão Menu Principal clicado (Game Over)');
                e.preventDefault();
                this.showMainMenu();
            });
        }
        
        console.log('Todos os listeners dos menus foram configurados');
    }
    
    // Métodos para lidar com input de teclado
    handleKeyDown(key) {
        // Handle game over state
        if (this.state === 'gameOver') {
            switch(key.toLowerCase()) {
                case 'r':
                    this.startGame();
                    break;
                case 'escape':
                    this.showMainMenu();
                    break;
            }
            return;
        }
        
        // Handle playing state
        if (!this.player || this.state !== 'playing') return;
        
        switch(key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                this.player.setInput('left', true);
                break;
            case 'd':
            case 'arrowright':
                this.player.setInput('right', true);
                break;
            case 'w':
            case 'arrowup':
            case ' ':
                this.player.setInput('jump', true);
                break;
            case 'escape':
                this.togglePause();
                break;
        }
    }
    
    handleKeyUp(key) {
        if (!this.player || this.state !== 'playing') return;
        
        switch(key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                this.player.setInput('left', false);
                break;
            case 'd':
            case 'arrowright':
                this.player.setInput('right', false);
                break;
            case 'w':
            case 'arrowup':
            case ' ':
                this.player.setInput('jump', false);
                break;
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
        
        // Event listeners para loja - CONSOLIDADO (remove duplicação)
        this.ui.on('buyItem', (data) => {
            this.buyItem(data.type, data.itemId);
        });
        
        this.ui.on('buyEquipment', (data) => {
            this.buyItem(data.type, data.itemId);
        });
        
        this.ui.on('equipItem', (data) => {
            this.equipItem(data.type, data.itemId);
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
        
        // Event listeners para ranking e configurações - REMOVIDOS (duplicação)
        // Estes são acionados pelos botões do menu principal já configurados em setupAllMenuListeners()
        
        // Event listeners para Soul Orbs (debug)
        this.ui.on('addSoulOrbs', (amount) => {
            this.addSoulOrbs(amount);
        });
        
        this.ui.on('removeSoulOrbs', (amount) => {
            this.removeSoulOrbs(amount);
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
    
    // Equipment and shop methods
    buyItem(type, itemId) {
        if (!this.player) {
            console.error('Player not found');
            this.ui.showNotification('Player não encontrado!', 'error', 2000);
            return false;
        }
        
        const equipment = this.equipmentManager.getEquipment(type, itemId);
        if (!equipment) {
            console.error('Equipment not found:', type, itemId);
            this.ui.showNotification('Item não encontrado!', 'error', 2000);
            return false;
        }
        
        // Check if player has enough soul orbs
        if (this.player.soulOrbs < equipment.cost) {
            this.ui.showNotification('Soul Orbs insuficientes!', 'error', 2000);
            return false;
        }
        
        // Check if player already owns this equipment
        if (this.player.ownedEquipment[type] && this.player.ownedEquipment[type].includes(itemId)) {
            this.ui.showNotification('Você já possui este item!', 'error', 2000);
            return false;
        }
        
        // Purchase the item
        this.player.soulOrbs -= equipment.cost;
        if (!this.player.ownedEquipment[type]) {
            this.player.ownedEquipment[type] = [];
        }
        this.player.ownedEquipment[type].push(itemId);
        
        this.ui.showNotification(`${equipment.name} comprado com sucesso!`, 'success', 2000);
        this.saveGame();
        return true;
    }
    
    equipItem(data) {
        const { type, itemId } = data;
        
        if (!this.player) {
            console.error('Player not found');
            this.ui.showNotification('Player não encontrado!', 'error', 2000);
            return false;
        }
        
        // Check if player owns the item
        if (!this.player.ownedEquipment[type] || !this.player.ownedEquipment[type].includes(itemId)) {
            this.ui.showNotification('Você não possui este item!', 'error', 2000);
            return false;
        }
        
        // Equip the item
        if (!this.player.equippedEquipment) {
            this.player.equippedEquipment = {};
        }
        this.player.equippedEquipment[type] = itemId;
        
        // Update player sprites if method exists
        if (this.player.updateEquipmentSprites) {
            this.player.updateEquipmentSprites();
        }
        
        // Update player stats
        if (this.player.updateStats) {
            this.player.updateStats();
        }
        
        const equipment = this.equipmentManager.getEquipment(type, itemId);
        const equipmentName = equipment ? equipment.name : itemId;
        this.ui.showNotification(`${equipmentName} equipado!`, 'success', 2000);
        this.saveGame();
        return true;
    }
    
    // Also add buyEquipment method as alias
    buyEquipment(data) {
        return this.buyItem(data.type, data.itemId);
    }
    
    // Método UNIFICADO para esconder todos os outros menus - Remove duplicação
    hideAllOtherMenus() {
        // Lista completa de todos os menus do sistema
        const allMenus = [
            'pauseMenu', 'shopMenu', 'rankingMenu', 'settingsMenu', 
            'gameOverMenu', 'upgradeMenu'
        ];
        
        allMenus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.add('hidden');
                menu.style.display = 'none';
            }
        });
        
        // Fechar modais também se estiver usando sistema moderno
        if (this.ui && this.ui.closeAllModals) {
            this.ui.closeAllModals();
        }
    }

    // Método UNIFICADO para esconder todos os menus - consolida hideAllMenus e hideAllOtherMenus
    hideAllMenus() {
        console.log('Escondendo todos os menus - versão unificada');
        
        // Esconder menu principal também
        this.hideMainMenu();
        
        // Esconder todos os outros menus
        this.hideAllOtherMenus();
        
        // Esconder controles móveis
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.display = 'none';
        }
        
        // Fechar menu de upgrades se estiver aberto
        if (this.upgradeSystem && this.upgradeSystem.isUpgradeMenuOpen) {
            this.upgradeSystem.hideUpgradeMenu();
        }
        
        // Fechar menu de cartas se estiver aberto
        if (this.cardSystem && this.cardSystem.isChoosingCard) {
            this.cardSystem.cancelCardChoice();
        }
        
        // Mostrar canvas do jogo
        this.canvas.style.display = 'block';
        
        console.log('Todos os menus foram escondidos - versão unificada');
    }
    
    // Método para mostrar loja - UNIFICADO
    showShop() {
        console.log('Mostrando loja - usando modal moderno...');
        
        // Verificar se devemos usar o sistema modal moderno ou menus estáticos
        if (this.ui && this.ui.showShopModal && this.player) {
            // Sistema moderno - usando modais
            const playerData = {
                soulOrbs: this.player.soulOrbs || 0,
                ownedEquipment: this.player.ownedEquipment || { hats: [], staffs: [] },
                equippedEquipment: this.player.equippedEquipment || { hats: null, staffs: null }
            };
            
            const equipmentData = this.equipmentManager ? this.equipmentManager.getAllEquipment() : { hats: {}, staffs: {} };
            
            this.ui.showShopModal(playerData, equipmentData);
        } else {
            // Sistema legado - usando menus HTML estáticos
            this.hideAllOtherMenus();
            const mainMenu = document.getElementById('mainMenu');
            if (mainMenu) {
                mainMenu.classList.add('hidden');
                mainMenu.style.display = 'none';
            }
            
            const shopMenu = document.getElementById('shopMenu');
            if (shopMenu) {
                shopMenu.classList.remove('hidden');
                shopMenu.style.display = 'flex';
                console.log('Menu da loja mostrado (sistema legado)');
            } else {
                console.error('Elemento shopMenu não encontrado');
            }
        }
    }
    
    // Método para esconder loja
    hideShop() {
        const shopMenu = document.getElementById('shopMenu');
        if (shopMenu) {
            shopMenu.classList.add('hidden');
            shopMenu.style.display = 'none';
        }
        this.showMainMenu();
    }
    
    // Método para esconder ranking
    hideRanking() {
        const rankingMenu = document.getElementById('rankingMenu');
        if (rankingMenu) {
            rankingMenu.classList.add('hidden');
            rankingMenu.style.display = 'none';
        }
        this.showMainMenu();
    }
    
    // Método para mostrar configurações - UNIFICADO
    showSettings() {
        console.log('Mostrando configurações - usando modal moderno...');
        
        // Verificar se devemos usar o sistema modal moderno ou menus estáticos
        if (this.ui && this.ui.showSettingsModal) {
            // Sistema moderno - usando modais
            const currentSettings = {
                playerName: this.player ? this.player.playerName : 'Player',
                audioEnabled: this.audioSystem ? !this.audioSystem.isMuted() : true,
                masterVolume: this.audioSystem ? this.audioSystem.masterVolume : 0.7,
                sfxVolume: this.audioSystem ? this.audioSystem.sfxVolume : 0.8,
                xpMultiplier: this.expMultiplier || 1.0
            };
            
            this.ui.showSettingsModal(currentSettings);
        } else {
            // Sistema legado - usando menus HTML estáticos
            this.hideAllOtherMenus();
            const mainMenu = document.getElementById('mainMenu');
            if (mainMenu) {
                mainMenu.classList.add('hidden');
                mainMenu.style.display = 'none';
            }
            
            const settingsMenu = document.getElementById('settingsMenu');
            if (settingsMenu) {
                settingsMenu.classList.remove('hidden');
                settingsMenu.style.display = 'flex';
                console.log('Menu de configurações mostrado (sistema legado)');
            } else {
                console.error('Elemento settingsMenu não encontrado');
            }
        }
    }
    
    // Método para esconder configurações
    hideSettings() {
        const settingsMenu = document.getElementById('settingsMenu');
        if (settingsMenu) {
            settingsMenu.classList.add('hidden');
            settingsMenu.style.display = 'none';
        }
        this.showMainMenu();
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
                // Game over é tratado via menu HTML, não precisa renderizar no canvas
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
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        // Final Score
        const finalScore = this.calculateScore();
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(`Pontuação Final: ${finalScore}`, this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Estatísticas
        if (this.waveSystem) {
            const stats = [
                `Onda alcançada: ${this.waveSystem.currentWave}`,
                `Inimigos derrotados: ${this.waveSystem.enemiesKilled}`,
                `Tempo sobrevivido: ${TimeUtils.formatTime(this.gameTime)}`,
                `Soul Orbs coletados: ${this.player ? this.player.soulOrbs : 0}`
            ];
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '18px Arial';
            
            stats.forEach((stat, index) => {
                this.ctx.fillText(stat, this.canvas.width / 2, this.canvas.height / 2 + 10 + index * 25);
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
        
        // Garantir que o player tenha equipamentos iniciais
        if (!this.player.ownedEquipment.hats.includes('wizardHat')) {
            this.player.ownedEquipment.hats.push('wizardHat');
        }
        if (!this.player.ownedEquipment.staffs.includes('wizardStaff')) {
            this.player.ownedEquipment.staffs.push('wizardStaff');
        }
        
        // Equipar itens iniciais se não tiver nada equipado
        if (!this.player.equippedEquipment.hats) {
            this.player.equippedEquipment.hats = 'wizardHat';
        }
        if (!this.player.equippedEquipment.staffs) {
            this.player.equippedEquipment.staffs = 'wizardStaff';
        }
        
        // Atualizar sprites dos equipamentos
        if (this.player.updateEquipmentSprites) {
            this.player.updateEquipmentSprites();
        }
        
        // Garantir que o player aplique os efeitos dos equipamentos
        if (this.player.updateStats) {
            this.player.updateStats();
        }
        
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
        if ((typeof DeviceUtils === 'undefined' || !DeviceUtils.isMobile()) && this.player && this.player.disableMobileControls) {
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
        if (typeof DeviceUtils !== 'undefined' && DeviceUtils.isMobile()) {
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
        
        // Garantir que o player tenha equipamentos iniciais
        if (!this.player.ownedEquipment.hats.includes('wizardHat')) {
            this.player.ownedEquipment.hats.push('wizardHat');
        }
        if (!this.player.ownedEquipment.staffs.includes('wizardStaff')) {
            this.player.ownedEquipment.staffs.push('wizardStaff');
        }
        
        // Equipar itens iniciais se não tiver nada equipado
        if (!this.player.equippedEquipment.hats) {
            this.player.equippedEquipment.hats = 'wizardHat';
        }
        if (!this.player.equippedEquipment.staffs) {
            this.player.equippedEquipment.staffs = 'wizardStaff';
        }
        
        // Atualizar sprites dos equipamentos
        if (this.player.updateEquipmentSprites) {
            this.player.updateEquipmentSprites();
        }
        
        // Limpar todos os inputs para garantir que não há movimento automático
        if (this.player.clearAllInputs) {
            this.player.clearAllInputs();
        }
        
        // Desabilitar controles mobile permanentemente em desktop
        if ((typeof DeviceUtils === 'undefined' || !DeviceUtils.isMobile()) && this.player.disableMobileControls) {
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
        // Prevent multiple game over calls
        if (this.state === 'gameOver') return;
        
        this.state = 'gameOver';
        
        // Limpar inputs do player quando o jogo acabar
        if (this.player && this.player.clearAllInputs) {
            this.player.clearAllInputs();
        }
        
        // Atualizar tempo de sobrevivência
        if (this.player) {
            this.player.updateSurvivalTime(Date.now() - this.gameStartTime);
        }
        
        // Adicionar ao ranking (faz o save internamente)
        this.addToRanking();
        
        // Limpar save game
        Storage.remove('seraphsLastStand_save');
        
        // Mostrar menu de game over HTML
        this.showGameOverMenu();
    }
    
    // Adicionar pontuação ao ranking
    addToRanking() {
        if (!this.player) return;
        
        // Calculate final score
        const score = this.calculateScore();
        
        // Create stats entry
        const stats = {
            playerName: this.player.playerName || 'Player',
            score: score,
            level: this.player.level,
            survivalTime: this.gameTime,
            enemiesKilled: this.waveSystem?.enemiesKilled || 0,
            build: this.player.selectedCards || [],
            date: new Date().toLocaleDateString('pt-BR')
        };
        
        // Always add to ranking (let the ranking system handle duplicates/limits)
        if (this.rankingSystem) {
            this.rankingSystem.addScore(stats);
            console.log('Score added to ranking:', stats);
        }
    }
    
    showMainMenu() {
        console.log('Mostrando menu principal...');
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
        
        // Fechar todos os outros menus primeiro
        this.hideAllOtherMenus();
        
        // Mostrar menu principal
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.classList.remove('hidden');
            mainMenu.style.display = 'flex';
            console.log('Menu principal mostrado');
        } else {
            console.error('Elemento mainMenu não encontrado');
        }
        
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
    }
    
    hideMainMenu() {
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.classList.add('hidden');
            mainMenu.style.display = 'none';
        }
    }
    
    // Método removido - consolidado no hideAllMenus() acima para evitar duplicação
    
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
    
    // Auto-save method
    autoSave() {
        try {
            this.saveGame();
            console.log('Auto-save concluído');
        } catch (error) {
            console.error('Erro no auto-save:', error);
        }
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
    
    // Método para mostrar ranking - UNIFICADO
    showRanking() {
        console.log('Mostrando ranking - usando modal moderno...');
        
        // Verificar se devemos usar o sistema modal moderno ou menus estáticos
        if (this.ui && this.ui.showRankingModal && this.rankingSystem) {
            // Sistema moderno - usando modais
            const rankings = this.rankingSystem.getRankings();
            this.ui.showRankingModal(rankings);
        } else {
            // Sistema legado - usando menus HTML estáticos
            this.hideAllOtherMenus();
            const mainMenu = document.getElementById('mainMenu');
            if (mainMenu) {
                mainMenu.classList.add('hidden');
                mainMenu.style.display = 'none';
            }
            
            const rankingMenu = document.getElementById('rankingMenu');
            if (rankingMenu) {
                rankingMenu.classList.remove('hidden');
                rankingMenu.style.display = 'flex';
                console.log('Menu de ranking mostrado (sistema legado)');
            } else {
                console.error('Elemento rankingMenu não encontrado');
            }
        }
    }
    
    // Método removido - duplicação da função em linha 728
    
    setXpMultiplier(multiplier) {
        this.expMultiplier = Math.max(0.5, Math.min(5.0, multiplier));
        console.log('XP Multiplier definido para:', this.expMultiplier);
    }
    
    // Métodos para adicionar/remover Soul Orbs (debug)
    addSoulOrbs(amount) {
        if (!this.player) {
            console.warn('Player não existe, criando novo player');
            this.player = new Player(400, 300);
        }
        
        const finalAmount = Math.max(0, parseInt(amount) || 0);
        this.player.soulOrbs = (this.player.soulOrbs || 0) + finalAmount;
        
        console.log(`Adicionados ${finalAmount} Soul Orbs. Total: ${this.player.soulOrbs}`);
        this.ui.showNotification(`+${finalAmount} Soul Orbs adicionados! Total: ${this.player.soulOrbs}`, 'success', 2000);
        
        // Salvar mudanças
        this.saveGame();
        
        // Atualizar menu principal se estiver aberto
        if (this.state === 'menu') {
            const soulOrbsValue = document.querySelector('.stat-value');
            if (soulOrbsValue) {
                soulOrbsValue.textContent = this.player.soulOrbs;
            }
        }
    }
    
    removeSoulOrbs(amount) {
        if (!this.player) {
            console.warn('Player não existe');
            this.ui.showNotification('Nenhum player encontrado!', 'error', 2000);
            return;
        }
        
        const finalAmount = Math.max(0, parseInt(amount) || 0);
        const oldAmount = this.player.soulOrbs || 0;
        this.player.soulOrbs = Math.max(0, oldAmount - finalAmount);
        const actualRemoved = oldAmount - this.player.soulOrbs;
        
        console.log(`Removidos ${actualRemoved} Soul Orbs. Total: ${this.player.soulOrbs}`);
        this.ui.showNotification(`-${actualRemoved} Soul Orbs removidos! Total: ${this.player.soulOrbs}`, 'info', 2000);
        
        // Salvar mudanças
        this.saveGame();
        
        // Atualizar menu principal se estiver aberto
        if (this.state === 'menu') {
            const soulOrbsValue = document.querySelector('.stat-value');
            if (soulOrbsValue) {
                soulOrbsValue.textContent = this.player.soulOrbs;
            }
        }
    }
    
    // Método para obter multiplicador de XP
    getXpMultiplier() {
        // Retorna o multiplicador de XP configurado ou padrão
        return this.settings?.xpMultiplier || 1.0;
    }
    
    // Calcular pontuação final
    calculateScore() {
        if (!this.player) return 0;
        
        let score = 0;
        score += this.player.level * 100;
        score += (this.waveSystem?.enemiesKilled || 0) * 10;
        score += Math.floor(this.gameTime / 1000) * 5;
        score += this.player.soulOrbs;
        
        return score;
    }
    
    showGameOverMenu() {
        console.log('Mostrando menu de game over...');
        
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
        
        // Fechar todos os outros menus primeiro
        this.hideAllOtherMenus();
        
        // Mostrar menu de game over
        const gameOverMenu = document.getElementById('gameOverMenu');
        if (gameOverMenu) {
            gameOverMenu.classList.remove('hidden');
            gameOverMenu.style.display = 'flex';
            
            // Preencher estatísticas
            this.populateGameOverStats();
            
            console.log('Menu de game over mostrado');
        } else {
            console.error('Elemento gameOverMenu não encontrado');
        }
    }
    
    populateGameOverStats() {
        const statsContainer = document.getElementById('gameOverStats');
        if (!statsContainer || !this.player) return;
        
        const finalScore = this.calculateScore();
        const survivalTimeFormatted = TimeUtils.formatTime(this.gameTime);
        const accuracy = this.player.shotsFired > 0 ? 
            Math.round((this.player.shotsHit / this.player.shotsFired) * 100) : 0;
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Pontuação Final:</span>
                <span class="stat-value">${finalScore}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Nível Alcançado:</span>
                <span class="stat-value">${this.player.level}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Tempo de Sobrevivência:</span>
                <span class="stat-value">${survivalTimeFormatted}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Inimigos Eliminados:</span>
                <span class="stat-value">${this.player.enemiesKilled}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Precisão:</span>
                <span class="stat-value">${accuracy}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Críticos:</span>
                <span class="stat-value">${this.player.criticalHits}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Soul Orbs:</span>
                <span class="stat-value">${this.player.soulOrbs}</span>
            </div>
            <div class="controls-hint">
                <p><strong>R</strong> - Jogar Novamente | <strong>ESC</strong> - Menu Principal</p>
            </div>
        `;
    }
}

// Classe para pré-carregar todas as imagens do jogo
class ImagePreloader {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onAllLoadedCallback = null;
    }
    
    preloadImages(imagePaths, onAllLoaded) {
        this.onAllLoadedCallback = onAllLoaded;
        this.totalCount = imagePaths.length;
        this.loadedCount = 0;
        
        imagePaths.forEach(imagePath => {
            const img = new Image();
            img.onload = () => {
                this.loadedCount++;
                console.log(`Imagem carregada: ${imagePath} (${this.loadedCount}/${this.totalCount})`);
                if (this.loadedCount === this.totalCount && this.onAllLoadedCallback) {
                    this.onAllLoadedCallback();
                }
            };
            img.onerror = () => {
                console.error(`Erro ao carregar imagem: ${imagePath}`);
                this.loadedCount++;
                if (this.loadedCount === this.totalCount && this.onAllLoadedCallback) {
                    this.onAllLoadedCallback();
                }
            };
            img.src = imagePath;
            this.images[imagePath] = img;
        });
    }
    
    getImage(path) {
        return this.images[path];
    }
}

// Instância global do pré-carregador
const imagePreloader = new ImagePreloader();

// Pré-carregar todas as imagens de equipamentos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const equipmentImages = [
        'img/player/mago.png',
        'img/chapeus/1_ChapeudeMago.png',
        'img/chapeus/2_Capacete.png',
        'img/chapeus/3_GorroHelice.png',
        'img/chapeus/4._ChapeuIncomum.png',
        'img/chapeus/5_ChapeudoDesafiante.png',
        'img/chapeus/6_Fedora.png',
        'img/cajados/1_CajadodoMago.png',
        'img/cajados/2_CajadodeEsmeralda.png',
        'img/cajados/3_Tridente.png',
        'img/cajados/4_Boomstaff.png',
        'img/cajados/5_CajadodoTrovao.png',
        'img/cajados/6_PontaCongelada.png',
        'img/cajados/7_CajadoArco-Iris.png'
    ];
    
    imagePreloader.preloadImages(equipmentImages, () => {
        console.log('Todas as imagens de equipamentos foram carregadas!');
    });
});

// Sistema de inicialização do jogo - UNIFICADO para evitar duplicação
function initializeGame() {
    if (!window.game) {
        console.log('Inicializando jogo...');
        window.game = new Game();
        console.log('Jogo inicializado:', window.game);
    }
}

// Inicializar jogo quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado');
    initializeGame();
});

// Fallback para navegadores mais antigos
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    // DOM já carregou
    console.log('DOM já carregado - inicializando imediatamente');
    initializeGame();
}

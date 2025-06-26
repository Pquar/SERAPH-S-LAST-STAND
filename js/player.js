// player.js - Sistema do jogador com mecânicas de plataforma

// Importar definições de equipamentos se não estiverem disponíveis globalmente
if (typeof EQUIPMENT_DEFINITIONS === 'undefined') {
    console.warn('EQUIPMENT_DEFINITIONS não está disponível. Sprites de equipamentos não funcionarão.');
}

class Player extends EventEmitter {
    constructor(x, y) {
        super();
        
        // Posição e movimento (plataforma)
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 200; // pixels por segundo horizontal
        this.size = 20;
        
        // Física de plataforma
        this.onGround = false;
        this.jumpSpeed = 400; // velocidade inicial do pulo
        this.gravity = 1200; // acelereção da gravidade
        this.jumpsAvailable = 1;
        this.maxJumps = 1;
        this.groundY = 0; // será definido pela plataforma atual
        
        // Estatísticas base
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.damage = 15;
        this.attackSpeed = 3.0; // tiros por segundo
        this.critChance = 0.05; // 5%
        this.critMultiplier = 1.5;
        this.defense = 0;
        
        // Sistema de experiência e nível
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100; // EXP necessária para próximo nível
        this.expGrowthRate = 1.5; // multiplicador de EXP por nível
        
        // Soul Orbs (moeda do jogo)
        this.soulOrbs = 0;
        
        // Sistema de equipamentos
        this.ownedEquipment = {
            hats: [],
            staffs: []
        };
        this.equippedEquipment = {
            hats: null,
            staffs: null
        };
        
        // Sistema de sprites
        this.sprites = {
            base: null,
            hat: null,
            staff: null
        };
        this.facingRight = true;
        this.spriteSize = 64; // tamanho do sprite base
        
        // Carregar sprites
        this.loadSprites();
        
        // Sistema de pontuação e estatísticas
        this.score = 0;
        this.enemiesKilled = 0;
        this.totalDamageDealt = 0;
        this.shotsHit = 0;
        this.shotsFired = 0;
        this.criticalHits = 0;
        this.survivalTime = 0;
        this.playerName = 'Player'; // Nome padrão
        
        // Sistema de build/cartas escolhidas
        this.selectedCards = []; // Array das cartas escolhidas durante a partida
        this.cardEffects = {}; // Efeitos ativos das cartas
        this.onKillEffects = []; // Efeitos que ativam quando um inimigo morre
        this.cardStacks = {}; // Contador de stacks das cartas
        
        // Sistema de tiro (mouse aim)
        this.lastShotTime = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isShooting = false; // para disparo automático ao segurar
        this.projectiles = [];
        this.projectileSpeed = 500;
        this.projectileSize = 6;
        
        // Estados especiais
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 1000; // 1 segundo
        
        // Visual
        this.color = '#66ffff';
        
        // Input (apenas A/D/Space)
        this.input = {
            left: false,   // A
            right: false,  // D
            jump: false    // Space
        };
        
        // Mobile controls
        this.mobileControls = {
            left: false,
            right: false,
            jump: false,
            shooting: false,
            aimX: 0,
            aimY: 0
        };
        
        // Plataformas para colisão
        this.platforms = [];
    }
    
    update(deltaTime, enemies, canvas, platforms = []) {
        this.platforms = platforms;
        this.handleMovement(deltaTime, canvas);
        this.handleShooting(deltaTime, enemies);
        this.updateProjectiles(deltaTime, enemies, canvas);
        this.updateInvulnerability(deltaTime);
        this.updateCardEffects(deltaTime, enemies, canvas);
        
        // Manter dentro do canvas horizontalmente
        this.constrainToCanvas(canvas);
    }
    
    handleMovement(deltaTime, canvas) {
        const dt = deltaTime / 1000;
        
        // Só processar movimento se o jogo estiver ativo
        if (window.game && window.game.state !== 'playing') {
            this.vx = 0;
            return;
        }
        
        // Verificar se é desktop
        const isDesktop = !window.DeviceUtils || !DeviceUtils.isMobile();
        
        // Movimento horizontal (apenas A/D)
        let moveX = 0;
        
        // DESKTOP: usar APENAS input de teclado, ignorar completamente mobile controls
        if (isDesktop) {
            // Limpar mobile controls em desktop para evitar conflitos
            this.mobileControls.left = false;
            this.mobileControls.right = false;
            
            // Apenas teclado
            if (this.input.left && !this.input.right) {
                moveX -= 1;
                this.facingRight = false;
            } else if (this.input.right && !this.input.left) {
                moveX += 1;
                this.facingRight = true;
            }
        } else {
            // MOBILE: prioridade para teclado, fallback para mobile
            if (this.input.left || this.input.right) {
                // Usar apenas input de teclado
                if (this.input.left && !this.input.right) {
                    moveX -= 1;
                    this.facingRight = false;
                } else if (this.input.right && !this.input.left) {
                    moveX += 1;
                    this.facingRight = true;
                }
            } else {
                // Fallback para mobile controls
                if (this.mobileControls.left && !this.mobileControls.right) {
                    moveX -= 1;
                    this.facingRight = false;
                } else if (this.mobileControls.right && !this.mobileControls.left) {
                    moveX += 1;
                    this.facingRight = true;
                }
            }
        }
        
        // Aplicar velocidade horizontal
        this.vx = moveX * this.speed;
        
        // Sistema de pulo (Space)
        if ((this.input.jump || this.mobileControls.jump) && this.jumpsAvailable > 0) {
            this.vy = -this.jumpSpeed;
            this.jumpsAvailable--;
            this.onGround = false;
            this.input.jump = false; // Evita salto contínuo
            this.mobileControls.jump = false;
        }
        
        // Aplicar gravidade
        if (!this.onGround) {
            this.vy += this.gravity * dt;
        }
        
        // Atualizar posição
        const oldY = this.y;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Verificar colisão com plataformas
        this.checkPlatformCollisions(oldY, canvas);
    }
    
    checkPlatformCollisions(oldY, canvas) {
        // Colisão com o chão (bottom do canvas)
        const groundLevel = canvas.height - 40; // espaço para o chão
        if (this.y + this.size >= groundLevel) {
            this.y = groundLevel - this.size;
            this.vy = 0;
            this.onGround = true;
            this.jumpsAvailable = this.maxJumps;
            return;
        }
        
        // Colisão com plataformas (degraus)
        this.onGround = false;
        
        for (let platform of this.platforms) {
            // Verificar se está caindo na plataforma
            if (this.vy >= 0 && oldY + this.size <= platform.y && 
                this.y + this.size >= platform.y &&
                this.x + this.size > platform.x && 
                this.x < platform.x + platform.width) {
                
                this.y = platform.y - this.size;
                this.vy = 0;
                this.onGround = true;
                this.jumpsAvailable = this.maxJumps;
                break;
            }
        }
    }
    
    handleShooting(deltaTime, enemies) {
        if (!this.isShooting && !this.mobileControls.shooting) return;
        
        const now = Date.now();
        const shotInterval = 1000 / this.attackSpeed;
        
        if (now - this.lastShotTime >= shotInterval) {
            let aimX = this.mouseX;
            let aimY = this.mouseY;
            
            // Verificar se é dispositivo móvel
            const isMobile = window.DeviceUtils && DeviceUtils.isMobile();
            
            if (isMobile && this.mobileControls.shooting) {
                // Mobile: atirar no inimigo mais próximo
                const nearestEnemy = this.findNearestEnemy(enemies);
                
                if (nearestEnemy) {
                    // Atirar no inimigo mais próximo
                    aimX = nearestEnemy.x;
                    aimY = nearestEnemy.y;
                } else {
                    // Se não há inimigos próximos, atirar na direção que está andando
                    const movingLeft = this.input.left || this.mobileControls.left;
                    const movingRight = this.input.right || this.mobileControls.right;
                    
                    if (movingLeft) {
                        this.facingRight = false;
                        aimX = this.x - 150;
                        aimY = this.y;
                    } else if (movingRight) {
                        this.facingRight = true;
                        aimX = this.x + 150;
                        aimY = this.y;
                    } else {
                        // Se não está se movendo, atirar na direção que está olhando
                        aimX = this.x + (this.facingRight ? 150 : -150);
                        aimY = this.y;
                    }
                }
            } else if (!isMobile) {
                // Desktop/Web: continuar usando posição do mouse
                // Se o mouse não foi movido ainda, atirar na direção que está olhando
                if (this.mouseX === 0 && this.mouseY === 0) {
                    aimX = this.x + (this.facingRight ? 150 : -150);
                    aimY = this.y;
                }
            }
            
            this.shootAt(aimX, aimY);
            this.lastShotTime = now;
        }
    }
    
    shootAt(targetX, targetY) {
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const projectile = {
            x: this.x,
            y: this.y - this.size / 2, // sair do centro do player
            vx: Math.cos(angle) * this.projectileSpeed,
            vy: Math.sin(angle) * this.projectileSpeed,
            size: this.projectileSize,
            damage: this.calculateDamage(),
            lifetime: 3000, // 3 segundos
            createdAt: Date.now(),
            color: this.color
        };
        
        this.projectiles.push(projectile);
        this.emit('shot', projectile);
        this.playShotSound(); // Toca som de tiro
    }
    
    // Métodos para controle de mira
    setMousePosition(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }

    // Métodos para controle de tiro (compatibilidade com mouse e mobile)
    startShooting() {
        this.isShooting = true;
        this.mobileControls.shooting = true;
    }
    
    stopShooting() {
        this.isShooting = false;
        this.mobileControls.shooting = false;
    }

    // Métodos para controle de experiência
    gainExp(amount) {
        // Aplicar multiplicador de XP
        const xpMultiplier = window.game ? window.game.getXpMultiplier() : 1.0;
        const finalAmount = Math.floor(amount * xpMultiplier);
        
        this.exp += finalAmount;
        
        // Verificar se subiu de nível
        if (this.exp >= this.expToNext) {
            this.levelUp();
        }
        
        this.emit('expGained', finalAmount, this.exp, this.expToNext);
    }
    
    levelUp() {
        this.level++;
        this.exp -= this.expToNext;
        this.expToNext = Math.floor(this.expToNext * this.expGrowthRate);
        
        // Curar um pouco ao subir de nível
        this.hp = Math.min(this.maxHp, this.hp + Math.floor(this.maxHp * 0.1));
        
        this.emit('levelUp', this.level);
    }
    
    // Calcular dano com chance de crítico
    calculateDamage() {
        let damage = this.damage;
        
        // Calcular crítico
        if (Math.random() < this.critChance) {
            damage *= this.critMultiplier;
            this.emit('critical');
        }
        
        return damage;
    }
    
    updateProjectiles(deltaTime, enemies, canvas) {
        const dt = deltaTime / 1000;
        const now = Date.now();
        
        this.projectiles = this.projectiles.filter(projectile => {
            // Atualizar posição
            projectile.x += projectile.vx * dt;
            projectile.y += projectile.vy * dt;
            
            // Verificar tempo de vida
            if (now - projectile.createdAt > projectile.lifetime) {
                return false;
            }
            
            // Verificar se saiu do canvas
            if (projectile.x < 0 || projectile.x > canvas.width || 
                projectile.y < 0 || projectile.y > canvas.height) {
                return false;
            }
            
            // Verificar colisão com inimigos
            for (let enemy of enemies) {
                if (Collision.circleCircle(
                    projectile.x, projectile.y, projectile.size,
                    enemy.x, enemy.y, enemy.size
                )) {
                    enemy.takeDamage(projectile.damage);
                    
                    // Ganhar EXP por hit
                    if (enemy.hp <= 0) {
                        this.gainExp(enemy.expValue || 10);
                    }
                    
                    this.emit('hit', enemy, projectile.damage);
                    return false; // Remove o projétil
                }
            }
            
            return true;
        });
    }
    
    updateInvulnerability(deltaTime) {
        if (this.invulnerable) {
            this.invulnerabilityTime += deltaTime;
            if (this.invulnerabilityTime >= this.invulnerabilityDuration) {
                this.invulnerable = false;
                this.invulnerabilityTime = 0;
            }
        }
    }
    
    takeDamage(amount) {
        if (this.invulnerable) return;
        
        // Aplicar defesa
        const damageReduction = this.defense / (this.defense + 100);
        const finalDamage = Math.max(1, Math.floor(amount * (1 - damageReduction)));
        
        this.hp = Math.max(0, this.hp - finalDamage);
        this.invulnerable = true;
        this.invulnerabilityTime = 0;
        
        this.emit('damaged', finalDamage, this.hp);
        this.playHitSound(); // Toca som de hit
        
        if (this.hp <= 0) {
            this.emit('death');
        }
    }
    
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        this.emit('healed', amount, this.hp);
    }
    
    constrainToCanvas(canvas) {
        // Apenas controlar horizontalmente, verticalmente é controlado pelas plataformas
        if (this.x - this.size < 0) {
            this.x = this.size;
        }
        if (this.x + this.size > canvas.width) {
            this.x = canvas.width - this.size;
        }
    }
    
    // Métodos de input para compatibilidade
    setInput(key, value) {
        if (this.input.hasOwnProperty(key)) {
            this.input[key] = Boolean(value);
        }
    }
    
    // Mobile controls
    setMobileControls(controls) {
        // Limpar primeiro para evitar estados persistentes
        if (controls.hasOwnProperty('left') || controls.hasOwnProperty('right')) {
            this.mobileControls.left = false;
            this.mobileControls.right = false;
        }
        
        Object.assign(this.mobileControls, controls);
    }
    
    // Método para limpar completamente os controles
    clearAllInputs() {
        // Limpar inputs de teclado
        this.input = {
            left: false,
            right: false,
            jump: false
        };
        
        // Limpar controles mobile
        this.resetMobileControls();
        
        // Limpar velocidade também para parar movimento imediatamente
        this.vx = 0;
    }
    
    // Método para desabilitar completamente controles mobile (usado em desktop)
    disableMobileControls() {
        this.mobileControls = {
            left: false,
            right: false,
            jump: false,
            shooting: false,
            aimX: 0,
            aimY: 0
        };
        console.log('Mobile controls permanently disabled (desktop mode)');
    }
    
    // Sistema de estatísticas e equipamentos
    updateStats() {
        // Recalcular estatísticas base do level
        this.recalculateBaseStats();
        
        // Aplicar efeitos dos equipamentos equipados
        if (this.equippedEquipment.hats) {
            this.applyEquipmentEffects('hats', this.equippedEquipment.hats);
        }
        if (this.equippedEquipment.staffs) {
            this.applyEquipmentEffects('staffs', this.equippedEquipment.staffs);
        }
        
        // Garantir que HP não exceda maxHp
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        
        console.log('Stats atualizadas:', {
            level: this.level,
            hp: this.hp,
            maxHp: this.maxHp,
            damage: this.damage,
            defense: this.defense,
            speed: this.speed,
            equippedHat: this.equippedEquipment.hats,
            equippedStaff: this.equippedEquipment.staffs
        });
    }
    
    recalculateBaseStats() {
        // Stats base por nível
        const baseStats = this.getBaseStats();
        
        this.maxHp = baseStats.maxHp;
        this.damage = baseStats.damage;
        this.defense = baseStats.defense;
        this.speed = baseStats.speed;
        this.attackSpeed = baseStats.attackSpeed;
        this.critChance = baseStats.critChance;
    }
    
    getBaseStats() {
        // Estatísticas base que crescem com o level
        return {
            maxHp: 100 + (this.level - 1) * 20,
            damage: 15 + (this.level - 1) * 3,
            defense: (this.level - 1) * 2,
            speed: 200 + (this.level - 1) * 5,
            attackSpeed: 3.0 + (this.level - 1) * 0.1,
            critChance: 0.05 + (this.level - 1) * 0.01
        };
    }
    
    applyEquipmentEffects(type, itemId) {
        // Esta função será chamada pelo equipmentManager
        // quando um equipamento for equipado
        console.log(`Aplicando efeitos do equipamento ${type}:${itemId}`);
    }
    
    render(ctx) {
        // Desenhar corpo do jogador
        this.renderBody(ctx);
        
        // Desenhar projéteis
        this.renderProjectiles(ctx);
        
        // Desenhar raios do Thunderbolt
        this.renderLightning(ctx);
    }
    
    renderBody(ctx) {
        const alpha = this.invulnerable ? 0.5 : 1.0;
        ctx.globalAlpha = alpha;
        
        // Calcular posição e tamanho de renderização
        const renderSize = this.spriteSize;
        const renderX = this.x - renderSize / 2;
        const renderY = this.y - renderSize / 2;
        
        // Salvar contexto para flip horizontal
        ctx.save();
        
        // Aplicar flip horizontal se necessário
        if (!this.facingRight) {
            ctx.scale(-1, 1);
            ctx.translate(-this.x * 2, 0);
        }
        
        // Renderizar sprite base do mago
        if (this.sprites.base && this.sprites.base.complete) {
            ctx.drawImage(this.sprites.base, renderX, renderY, renderSize, renderSize);
        } else {
            // Fallback para círculo se sprite não carregou
            CanvasUtils.drawCircle(ctx, this.x, this.y, this.size, this.invulnerable ? '#ff6666' : '#4CAF50');
        }
        
        // Renderizar chapéu equipado (acima da cabeça)
        if (this.sprites.hat && this.sprites.hat.complete) {
            // Posicionar chapéu no topo da cabeça com tamanho menor
            const hatSize = renderSize * 0.6; // 60% do tamanho do personagem
            const hatX = renderX + (renderSize - hatSize) / 2; // Centralizar
            const hatY = renderY - hatSize * 0.3; // Posicionar acima da cabeça
            ctx.drawImage(this.sprites.hat, hatX, hatY, hatSize, hatSize);
        }
        
        // Renderizar cajado equipado (ao lado do mago)
        if (this.sprites.staff && this.sprites.staff.complete) {
            // Posicionar cajado ao lado do mago com tamanho menor
            const staffSize = renderSize * 0.7; // 70% do tamanho do personagem
            const staffX = renderX - staffSize * 0.4; // Ao lado esquerdo
            const staffY = renderY + renderSize * 0.1; // Ligeiramente abaixo do centro
            ctx.drawImage(this.sprites.staff, staffX, staffY, staffSize, staffSize);
        }
        
        // Restaurar contexto
        ctx.restore();
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
    }
    
    renderProjectiles(ctx) {
        for (let projectile of this.projectiles) {
            CanvasUtils.drawCircle(ctx, projectile.x, projectile.y, projectile.size, projectile.color);
        }
    }
    
    renderLightning(ctx) {
        if (!this.lightningStrikes) return;
        
        const now = Date.now();
        
        for (let lightning of this.lightningStrikes) {
            const age = now - lightning.createdAt;
            
            // Renderizar apenas durante a duração visual
            if (age > lightning.duration) continue;
            
            const isWarningPhase = age < lightning.warningDuration;
            
            if (isWarningPhase) {
                // Fase de aviso - círculo piscante vermelho
                const opacity = 0.3 + 0.3 * Math.sin(age * 0.02); // Piscando
                ctx.globalAlpha = opacity;
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                ctx.arc(lightning.x, lightning.y, lightning.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Borda de aviso
                ctx.globalAlpha = 0.8;
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                // Fase do raio - efeito de raio brilhante
                const strikeAge = age - lightning.warningDuration;
                const strikeProgress = strikeAge / lightning.visualDuration;
                
                if (strikeProgress <= 1) {
                    // Desenhar o raio principal
                    ctx.globalAlpha = 1 - strikeProgress;
                    
                    // Raio principal (amarelo brilhante)
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(lightning.x, lightning.y, lightning.size * (1 + strikeProgress * 0.5), 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Núcleo brilhante (branco)
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(lightning.x, lightning.y, lightning.size * 0.5 * (1 - strikeProgress), 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Efeito de brilho externo
                    ctx.globalAlpha = (1 - strikeProgress) * 0.3;
                    ctx.fillStyle = '#ffff88';
                    ctx.beginPath();
                    ctx.arc(lightning.x, lightning.y, lightning.size * (2 + strikeProgress), 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Raios menores ao redor
                    ctx.globalAlpha = 1 - strikeProgress;
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = 3;
                    
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const length = lightning.size * (1.5 + Math.random() * 0.5);
                        const startX = lightning.x + Math.cos(angle) * lightning.size * 0.5;
                        const startY = lightning.y + Math.sin(angle) * lightning.size * 0.5;
                        const endX = lightning.x + Math.cos(angle) * length;
                        const endY = lightning.y + Math.sin(angle) * length;
                        
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();
                    }
                }
            }
        }
        
        // Resetar alpha
        ctx.globalAlpha = 1.0;
    }
    
    // Coletar Soul Orb
    collectSoulOrb(value = 1) {
        this.soulOrbs += value;
        this.score += value * 5; // 5 pontos por soul orb
        this.emit('soulOrbCollected', this.soulOrbs);
    }
    
    // Métodos para atualizar estatísticas e pontuação
    addKill(enemy) {
        this.enemiesKilled++;
        this.score += enemy.points || 10;
        
        // Bônus por tipo de inimigo
        const typeBonus = {
            'basic': 10,
            'fast': 15,
            'heavy': 25,
            'sniper': 20
        };
        this.score += typeBonus[enemy.type] || 10;
        
        // Processar efeitos OnKill (como Fragmentation)
        this.processOnKillEffects(enemy);
    }
    
    addDamage(damage, isCritical = false) {
        this.totalDamageDealt += damage;
        this.score += Math.floor(damage / 10); // 1 ponto a cada 10 de dano
        
        if (isCritical) {
            this.criticalHits++;
            this.score += 25; // Bônus por crítico
        }
    }
    
    addShot(hit = false) {
        this.shotsFired++;
        if (hit) {
            this.shotsHit++;
            this.score += 2; // Pontos por acerto
        }
    }
    
    updateSurvivalTime(deltaTime) {
        this.survivalTime += deltaTime;
        // 1 ponto por segundo sobrevivido
        this.score += Math.floor(deltaTime / 1000);
    }
    
    // Obter estatísticas para o ranking
    getStats() {
        const accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired) * 100 : 0;
        
        return {
            playerName: this.playerName,
            score: this.score,
            level: this.level,
            enemiesKilled: this.enemiesKilled,
            survivalTime: this.survivalTime,
            accuracy: Math.round(accuracy * 100) / 100,
            criticalHits: this.criticalHits,
            totalDamageDealt: this.totalDamageDealt,
            soulOrbs: this.soulOrbs,
            build: this.getBuild(), // Adicionar build ao placar
            timestamp: Date.now()
        };
    }
    
    // Definir nome do jogador
    setPlayerName(name) {
        this.playerName = name || 'Player';
    }
    
    // Adicionar sons ao player para tiro e hit
    playShotSound() {
        // Verificar se há acesso ao audioSystem através do game
        if (window.game && window.game.audioSystem) {
            window.game.audioSystem.playSound('shot');
        }
    }
    
    playHitSound() {
        if (window.game && window.game.audioSystem) {
            window.game.audioSystem.playSound('hit');
        }
    }
    
    // Adicionar carta escolhida à build
    addSelectedCard(card) {
        if (!card) return;
        
        this.selectedCards.push({
            id: card.id,
            name: card.name,
            rarity: card.rarity,
            description: card.description,
            selectedAt: Date.now()
        });
        
        console.log('Carta adicionada à build:', card.name, 'Total de cartas:', this.selectedCards.length);
    }
    
    // Obter build (cartas escolhidas)
    getBuild() {
        return [...this.selectedCards]; // Retorna cópia
    }
    
    // Métodos para atualizar cartas (ex: fragmentação)
    updateCards(deltaTime) {
        const now = Date.now();
        
        // Atualizar efeitos de cartas ativas
        for (let card of this.selectedCards) {
            if (card.id === 'fragmentation' && card.active) {
                // Exemplo: fragmentação causa dano ao longo do tempo
                if (now - card.lastApplied >= 1000) {
                    this.applyFragmentationDamage();
                    card.lastApplied = now;
                }
            }
        }
    }
    
    applyFragmentationDamage() {
        const damage = 5 + Math.floor(this.level * 0.5);
        this.totalDamageDealt += damage;
        this.score += Math.floor(damage / 10);
        
        console.log('Dano de fragmentação aplicado:', damage);
    }
    
    // Método para resetar controles mobile
    resetMobileControls() {
        this.mobileControls = {
            left: false,
            right: false,
            jump: false,
            shooting: false,
            aimX: 0,
            aimY: 0
        };
    }
    
    // Método para forçar parada do movimento
    stopMovement() {
        console.log('Forcing movement stop...');
        this.vx = 0;
        this.input.left = false;
        this.input.right = false;
        this.mobileControls.left = false;
        this.mobileControls.right = false;
        console.log('Movement stopped');
    }
    
    // Método para encontrar o inimigo mais próximo (usado em mobile)
    findNearestEnemy(enemies) {
        if (!enemies || enemies.length === 0) return null;
        
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        const maxTargetRange = 400; // Alcance máximo para mira automática
        
        for (let enemy of enemies) {
            // Ignorar inimigos mortos ou em animação de morte
            if (enemy.hp <= 0 || enemy.deathAnimation) continue;
            
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + 
                Math.pow(enemy.y - this.y, 2)
            );
            
            // Só considerar inimigos dentro do alcance
            if (distance < nearestDistance && distance <= maxTargetRange) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        return nearestEnemy;
    }
    
    // Método para processar efeitos das cartas
    updateCardEffects(deltaTime, enemies, canvas) {
        const now = Date.now();
        
        // Processar efeito de raio (Thunderbolt)
        if (this.lightningEffect && this.lightningEffect.enabled) {
            if (now - this.lightningEffect.lastCast >= this.lightningEffect.interval) {
                this.castLightning(enemies, canvas);
                this.lightningEffect.lastCast = now;
            }
        }
        
        // Aqui podem ser adicionados outros efeitos de cartas no futuro
        // como fragmentação, etc.
    }
    
    // Método para lançar raios do Thunderbolt
    castLightning(enemies, canvas) {
        if (!this.lightningEffect || !enemies || enemies.length === 0) return;
        
        const lightningStrikes = [];
        const strikeCount = this.lightningEffect.count || 2;
        const damage = this.lightningEffect.damage || (this.damage * 2);
        
        // Priorizar inimigos próximos ao jogador
        const sortedEnemies = enemies
            .filter(enemy => enemy.hp > 0) // Apenas inimigos vivos
            .sort((a, b) => {
                const distA = Math.sqrt(Math.pow(a.x - this.x, 2) + Math.pow(a.y - this.y, 2));
                const distB = Math.sqrt(Math.pow(b.x - this.x, 2) + Math.pow(b.y - this.y, 2));
                return distA - distB;
            });
        
        // Criar raios
        for (let i = 0; i < strikeCount; i++) {
            let targetX, targetY;
            
            if (sortedEnemies.length > 0 && i < sortedEnemies.length) {
                // Mirar em inimigos próximos primeiro
                const enemy = sortedEnemies[i];
                targetX = enemy.x + (Math.random() - 0.5) * 40; // Pequena variação
                targetY = enemy.y + (Math.random() - 0.5) * 40;
            } else {
                // Posições aleatórias se não há inimigos suficientes
                targetX = Math.random() * canvas.width;
                targetY = Math.random() * canvas.height;
            }
            
            const lightning = {
                x: targetX,
                y: targetY,
                damage: damage,
                size: 40, // Raio de dano
                createdAt: Date.now(),
                duration: 500, // 0.5 segundos
                visualDuration: 200, // Efeito visual mais rápido
                warningDuration: 300 // Tempo de aviso antes do dano
            };
            
            lightningStrikes.push(lightning);
        }
        
        // Armazenar raios para renderização e dano
        this.lightningStrikes = this.lightningStrikes || [];
        this.lightningStrikes.push(...lightningStrikes);
        
        // Processar dano após o tempo de aviso
        lightningStrikes.forEach(lightning => {
            setTimeout(() => {
                this.dealLightningDamage(lightning, enemies);
            }, lightning.warningDuration);
        });
        
        // Limpar raios antigos
        this.cleanupOldLightning();
    }
    
    // Método para causar dano dos raios
    dealLightningDamage(lightning, enemies) {
        if (!enemies) return;
        
        enemies.forEach(enemy => {
            if (enemy.hp <= 0) return; // Pular inimigos mortos
            
            const distance = Math.sqrt(
                Math.pow(enemy.x - lightning.x, 2) + 
                Math.pow(enemy.y - lightning.y, 2)
            );
            
            if (distance <= lightning.size) {
                enemy.takeDamage(lightning.damage);
                
                // Efeitos visuais no inimigo atingido
                if (enemy.flashColor) {
                    enemy.flashColor = '#ffff00'; // Amarelo para raio
                    enemy.flashTime = 300;
                }
                
                // Estatísticas
                this.addDamage(lightning.damage);
                if (enemy.hp <= 0) {
                    this.addKill(enemy);
                }
            }
        });
    }
    
    // Método para limpar raios antigos
    cleanupOldLightning() {
        if (!this.lightningStrikes) return;
        
        const now = Date.now();
        this.lightningStrikes = this.lightningStrikes.filter(lightning => {
            return (now - lightning.createdAt) < lightning.duration;
        });
    }
    
    // Processar efeitos que ativam quando um inimigo é morto
    processOnKillEffects(enemy) {
        if (!this.onKillEffects || this.onKillEffects.length === 0) return;
        
        for (let effect of this.onKillEffects) {
            switch (effect.type) {
                case 'fragmentation':
                    this.createFragmentationProjectiles(enemy, effect);
                    break;
                // Outros efeitos OnKill podem ser adicionados aqui
            }
        }
    }
    
    // Criar projéteis de fragmentação quando um inimigo morre
    createFragmentationProjectiles(enemy, effect) {
        const projectileCount = effect.projectiles || 2;
        const projectileDamage = effect.damage || (this.damage * 0.3);
        
        console.log(`Criando ${projectileCount} projéteis de fragmentação em`, enemy.x, enemy.y);
        console.log('Array de projéteis antes:', this.projectiles.length);
        
        for (let i = 0; i < projectileCount; i++) {
            // Ângulo aleatório para cada projétil
            const angle = (Math.PI * 2 * i / projectileCount) + (Math.random() - 0.5) * 0.5;
            
            const projectile = {
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angle) * this.projectileSpeed * 0.8, // Velocidade um pouco menor
                vy: Math.sin(angle) * this.projectileSpeed * 0.8,
                size: this.projectileSize,
                damage: projectileDamage,
                lifetime: 2000, // 2 segundos
                createdAt: Date.now(),
                color: '#ff8800', // Cor laranja para distinguir
                isFragmentation: true
            };
            
            this.projectiles.push(projectile);
            console.log('Projétil de fragmentação adicionado:', projectile);
        }
        
        console.log('Array de projéteis depois:', this.projectiles.length);
        
        // Som de fragmentação (se disponível)
        if (window.game && window.game.audioSystem) {
            window.game.audioSystem.playSound('fragmentation');
        }
    }
    
    // Sistema de Sprites e Renderização Visual
    loadSprites() {
        // Usar pré-carregador se disponível, senão carregar diretamente
        if (typeof imagePreloader !== 'undefined') {
            this.sprites.base = imagePreloader.getImage('img/player/mago.png');
            if (!this.sprites.base) {
                // Fallback se não estiver pré-carregado
                this.sprites.base = new Image();
                this.sprites.base.src = 'img/player/mago.png';
            }
        } else {
            this.sprites.base = new Image();
            this.sprites.base.src = 'img/player/mago.png';
        }
        
        console.log('Sprite base do mago configurado');
    }
    
    // Carregar sprite do chapéu equipado
    loadHatSprite() {
        if (!this.equippedEquipment.hats) {
            this.sprites.hat = null;
            console.log('Nenhum chapéu equipado');
            return;
        }
        
        // Verificar se EQUIPMENT_DEFINITIONS está disponível
        if (typeof EQUIPMENT_DEFINITIONS === 'undefined') {
            console.warn('EQUIPMENT_DEFINITIONS não está disponível. Tentando novamente em 1 segundo...');
            setTimeout(() => this.loadHatSprite(), 1000);
            return;
        }
        
        const hatData = EQUIPMENT_DEFINITIONS[this.equippedEquipment.hats];
        if (hatData && hatData.image) {
            // Usar pré-carregador se disponível
            if (typeof imagePreloader !== 'undefined') {
                this.sprites.hat = imagePreloader.getImage(hatData.image);
                if (!this.sprites.hat) {
                    // Fallback se não estiver pré-carregado
                    this.sprites.hat = new Image();
                    this.sprites.hat.src = hatData.image;
                }
            } else {
                this.sprites.hat = new Image();
                this.sprites.hat.src = hatData.image;
            }
            console.log('Sprite do chapéu configurado:', hatData.name, 'Imagem:', hatData.image);
        } else {
            console.error('Dados do chapéu não encontrados:', this.equippedEquipment.hats);
        }
    }
    
    // Carregar sprite do cajado equipado
    loadStaffSprite() {
        if (!this.equippedEquipment.staffs) {
            this.sprites.staff = null;
            console.log('Nenhum cajado equipado');
            return;
        }
        
        // Verificar se EQUIPMENT_DEFINITIONS está disponível
        if (typeof EQUIPMENT_DEFINITIONS === 'undefined') {
            console.warn('EQUIPMENT_DEFINITIONS não está disponível. Tentando novamente em 1 segundo...');
            setTimeout(() => this.loadStaffSprite(), 1000);
            return;
        }
        
        const staffData = EQUIPMENT_DEFINITIONS[this.equippedEquipment.staffs];
        if (staffData && staffData.image) {
            // Usar pré-carregador se disponível
            if (typeof imagePreloader !== 'undefined') {
                this.sprites.staff = imagePreloader.getImage(staffData.image);
                if (!this.sprites.staff) {
                    // Fallback se não estiver pré-carregado
                    this.sprites.staff = new Image();
                    this.sprites.staff.src = staffData.image;
                }
            } else {
                this.sprites.staff = new Image();
                this.sprites.staff.src = staffData.image;
            }
            console.log('Sprite do cajado configurado:', staffData.name, 'Imagem:', staffData.image);
        } else {
            console.error('Dados do cajado não encontrados:', this.equippedEquipment.staffs);
        }
    }
    
    // Atualizar sprites quando equipamentos mudarem
    updateEquipmentSprites() {
        this.loadHatSprite();
        this.loadStaffSprite();
    }
}

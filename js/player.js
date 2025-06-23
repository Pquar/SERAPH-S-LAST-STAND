// player.js - Sistema do jogador com mecânicas de plataforma

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
        this.invulnerabilityDuration = 500; // 0.5 segundos
        
        // Visual
        this.color = '#66ffff';
        this.facingRight = true; // direção que está olhando
        
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
        
        // Manter dentro do canvas horizontalmente
        this.constrainToCanvas(canvas);
    }
    
    handleMovement(deltaTime, canvas) {
        const dt = deltaTime / 1000;
        
        // Movimento horizontal (apenas A/D)
        let moveX = 0;
        
        // Input de teclado ou mobile
        if (this.input.left || this.mobileControls.left) {
            moveX -= 1;
            this.facingRight = false;
        }
        if (this.input.right || this.mobileControls.right) {
            moveX += 1;
            this.facingRight = true;
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
            // Usar posição do mouse ou mobile aim
            let aimX = this.mouseX;
            let aimY = this.mouseY;
            
            if (this.mobileControls.shooting) {
                aimX = this.mobileControls.aimX;
                aimY = this.mobileControls.aimY;
            }
            
            this.shootAt(aimX, aimY);
            this.lastShotTime = now;
        }
    }
    
    shootAt(targetX, targetY) {
        const angle = Math2D.angle(this.x, this.y, targetX, targetY);
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
    }
    
    // Métodos para controle de mira
    setMousePosition(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }
    
    startShooting() {
        this.isShooting = true;
    }
    
    stopShooting() {
        this.isShooting = false;
    }
    
    // Métodos para controle de experiência
    gainExp(amount) {
        this.exp += amount;
        
        // Verificar se subiu de nível
        if (this.exp >= this.expToNext) {
            this.levelUp();
        }
        
        this.emit('expGained', amount, this.exp, this.expToNext);
    }
    
    levelUp() {
        this.level++;
        this.exp -= this.expToNext;
        this.expToNext = Math.floor(this.expToNext * this.expGrowthRate);
        
        // Curar um pouco ao subir de nível
        this.hp = Math.min(this.maxHp, this.hp + Math.floor(this.maxHp * 0.1));
        
        this.emit('levelUp', this.level);
    }
    
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
            this.input[key] = value;
        }
    }
    
    // Mobile controls
    setMobileControls(controls) {
        Object.assign(this.mobileControls, controls);
    }
    
    render(ctx) {
        // Desenhar corpo do jogador
        this.renderBody(ctx);
        
        // Desenhar projéteis
        this.renderProjectiles(ctx);
    }
    
    renderBody(ctx) {
        const alpha = this.invulnerable ? 0.5 : 1.0;
        const color = this.invulnerable ? '#ff6666' : this.color;
        
        // Corpo principal
        ctx.globalAlpha = alpha;
        CanvasUtils.drawCircle(ctx, this.x, this.y, this.size, color);
        
        // Borda
        CanvasUtils.drawCircle(ctx, this.x, this.y, this.size, '#ffffff', false);
        
        // Indicador de direção
        const dirX = this.facingRight ? this.size * 0.8 : -this.size * 0.8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + dirX, this.y);
        ctx.stroke();
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
    }
    
    renderProjectiles(ctx) {
        for (let projectile of this.projectiles) {
            CanvasUtils.drawCircle(ctx, projectile.x, projectile.y, projectile.size, projectile.color);
        }
    }
}

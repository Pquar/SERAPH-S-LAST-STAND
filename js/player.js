// player.js - Sistema do jogador com as mecânicas principais

class Player extends EventEmitter {
    constructor(x, y) {
        super();
        
        // Posição e movimento
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 250; // pixels por segundo
        this.size = 20;
        
        // Estatísticas base
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.damage = 10;
        this.attackSpeed = 1.0; // ataques por segundo
        this.critChance = 0.05; // 5%
        this.critMultiplier = 1.5;
        this.defense = 0;
        
        // Sistema de tiro
        this.lastShotTime = 0;
        this.autoAim = true;
        this.projectiles = [];
        this.projectileSpeed = 400;
        this.projectileSize = 5;
        
        // Sistema de movimento/salto
        this.onGround = true;
        this.jumpHeight = 300;
        this.gravity = 800;
        this.jumpsAvailable = 1;
        this.maxJumps = 1;
        
        // Estados especiais
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 1000; // 1 segundo
        
        // Soul Orbs coletados
        this.soulOrbs = 0;
        
        // Visual
        this.color = '#66ffff';
        this.trailPoints = [];
        this.maxTrailPoints = 10;
        
        // Input
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false,
            special: false
        };
        
        // Mobile controls
        this.joystick = {
            x: 0,
            y: 0,
            active: false
        };
        
        // Target para auto-aim
        this.currentTarget = null;
        this.targetingRange = 300;
    }
    
    update(deltaTime, enemies, canvas) {
        this.handleMovement(deltaTime, canvas);
        this.handleShooting(deltaTime, enemies);
        this.updateProjectiles(deltaTime, enemies, canvas);
        this.updateInvulnerability(deltaTime);
        this.updateTrail();
        this.updateTargeting(enemies);
        
        // Manter dentro do canvas
        this.constrainToCanvas(canvas);
    }
    
    handleMovement(deltaTime, canvas) {
        const dt = deltaTime / 1000;
        
        // Movimento horizontal baseado no input ou joystick
        let moveX = 0;
        let moveY = 0;
        
        if (this.joystick.active) {
            moveX = this.joystick.x;
            moveY = this.joystick.y;
        } else {
            if (this.input.left) moveX -= 1;
            if (this.input.right) moveX += 1;
            if (this.input.up) moveY -= 1;
            if (this.input.down) moveY += 1;
        }
        
        // Normalizar movimento diagonal
        if (moveX !== 0 && moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }
        
        // Aplicar velocidade
        this.vx = moveX * this.speed;
        this.vy = moveY * this.speed;
        
        // Atualizar posição
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Sistema de salto (para implementações futuras com plataformas)
        if (this.input.jump && this.jumpsAvailable > 0) {
            this.vy = -this.jumpHeight;
            this.jumpsAvailable--;
            this.onGround = false;
            this.input.jump = false; // Evita salto contínuo
        }
    }
    
    handleShooting(deltaTime, enemies) {
        const now = Date.now();
        const shotInterval = 1000 / this.attackSpeed;
        
        if (now - this.lastShotTime >= shotInterval) {
            // Auto-aim: encontrar o inimigo mais próximo
            if (this.autoAim && this.currentTarget) {
                this.shootAt(this.currentTarget.x, this.currentTarget.y);
                this.lastShotTime = now;
            } else if (enemies.length > 0) {
                // Se não tem target específico, atira no mais próximo
                const closest = this.findClosestEnemy(enemies);
                if (closest && Math2D.distance(this.x, this.y, closest.x, closest.y) <= this.targetingRange) {
                    this.shootAt(closest.x, closest.y);
                    this.lastShotTime = now;
                }
            }
        }
    }
    
    shootAt(targetX, targetY) {
        const angle = Math2D.angle(this.x, this.y, targetX, targetY);
        const projectile = {
            x: this.x,
            y: this.y,
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
                    this.emit('hit', enemy, projectile.damage);
                    return false; // Remove o projétil
                }
            }
            
            return true;
        });
    }
    
    updateTargeting(enemies) {
        // Atualizar target atual
        if (enemies.length === 0) {
            this.currentTarget = null;
            return;
        }
        
        // Se não tem target ou target morreu, encontrar novo
        if (!this.currentTarget || this.currentTarget.hp <= 0) {
            this.currentTarget = this.findClosestEnemy(enemies);
        }
        
        // Verificar se target ainda está no alcance
        if (this.currentTarget) {
            const distance = Math2D.distance(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
            if (distance > this.targetingRange) {
                this.currentTarget = this.findClosestEnemy(enemies);
            }
        }
    }
    
    findClosestEnemy(enemies) {
        let closest = null;
        let closestDistance = Infinity;
        
        for (let enemy of enemies) {
            const distance = Math2D.distance(this.x, this.y, enemy.x, enemy.y);
            if (distance < closestDistance && distance <= this.targetingRange) {
                closest = enemy;
                closestDistance = distance;
            }
        }
        
        return closest;
    }
    
    updateInvulnerability(deltaTime) {
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    updateTrail() {
        // Adicionar ponto atual ao trail
        this.trailPoints.push({ x: this.x, y: this.y, alpha: 1.0 });
        
        // Limitar número de pontos
        if (this.trailPoints.length > this.maxTrailPoints) {
            this.trailPoints.shift();
        }
        
        // Reduzir alpha dos pontos
        this.trailPoints.forEach((point, index) => {
            point.alpha = (index + 1) / this.trailPoints.length * 0.5;
        });
    }
    
    constrainToCanvas(canvas) {
        const margin = this.size / 2;
        this.x = Math2D.clamp(this.x, margin, canvas.width - margin);
        this.y = Math2D.clamp(this.y, margin, canvas.height - margin);
    }
    
    takeDamage(damage) {
        if (this.invulnerable) return;
        
        // Aplicar defesa
        const actualDamage = Math.max(1, damage - this.defense);
        this.hp -= actualDamage;
        
        // Ativar invulnerabilidade
        this.invulnerable = true;
        this.invulnerabilityTime = this.invulnerabilityDuration;
        
        this.emit('damaged', actualDamage);
        
        if (this.hp <= 0) {
            this.hp = 0;
            this.emit('death');
        }
    }
    
    heal(amount) {
        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        const healed = this.hp - oldHp;
        
        if (healed > 0) {
            this.emit('healed', healed);
        }
        
        return healed;
    }
    
    collectSoulOrb(value = 1) {
        this.soulOrbs += value;
        this.emit('soulOrbCollected', value);
    }
    
    // Input handling
    setInput(key, value) {
        if (this.input.hasOwnProperty(key)) {
            this.input[key] = value;
        }
    }
    
    setJoystick(x, y, active) {
        this.joystick.x = x;
        this.joystick.y = y;
        this.joystick.active = active;
    }
    
    render(ctx) {
        // Desenhar trail
        this.renderTrail(ctx);
        
        // Desenhar corpo do jogador
        this.renderBody(ctx);
        
        // Desenhar projéteis
        this.renderProjectiles(ctx);
        
        // Desenhar linha de mira (se houver target)
        if (this.currentTarget && this.autoAim) {
            this.renderTargetLine(ctx);
        }
    }
    
    renderTrail(ctx) {
        if (this.trailPoints.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
        
        for (let i = 1; i < this.trailPoints.length; i++) {
            const point = this.trailPoints[i];
            ctx.lineTo(point.x, point.y);
            
            ctx.strokeStyle = `rgba(102, 255, 255, ${point.alpha})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
        }
    }
    
    renderBody(ctx) {
        const alpha = this.invulnerable ? 0.5 : 1.0;
        const color = this.invulnerable ? '#ff6666' : this.color;
        
        // Corpo principal
        ctx.globalAlpha = alpha;
        CanvasUtils.drawCircle(ctx, this.x, this.y, this.size, color);
        
        // Borda
        CanvasUtils.drawCircle(ctx, this.x, this.y, this.size, '#ffffff', false);
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
        
        // HP bar acima do jogador (se não estiver com HP cheio)
        if (this.hp < this.maxHp) {
            this.renderHealthBar(ctx);
        }
    }
    
    renderHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barY = this.y - this.size - 10;
        
        // Background
        CanvasUtils.drawRect(ctx, this.x - barWidth/2, barY, barWidth, barHeight, 'rgba(255, 255, 255, 0.3)');
        
        // HP fill
        const hpPercent = this.hp / this.maxHp;
        const fillWidth = barWidth * hpPercent;
        const color = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#F44336';
        
        CanvasUtils.drawRect(ctx, this.x - barWidth/2, barY, fillWidth, barHeight, color);
    }
    
    renderProjectiles(ctx) {
        this.projectiles.forEach(projectile => {
            const age = (Date.now() - projectile.createdAt) / projectile.lifetime;
            const alpha = 1 - age;
            
            ctx.globalAlpha = alpha;
            CanvasUtils.drawCircle(ctx, projectile.x, projectile.y, projectile.size, projectile.color);
            ctx.globalAlpha = 1.0;
        });
    }
    
    renderTargetLine(ctx) {
        if (!this.currentTarget) return;
        
        ctx.setLineDash([5, 5]);
        CanvasUtils.drawLine(
            ctx,
            this.x, this.y,
            this.currentTarget.x, this.currentTarget.y,
            'rgba(255, 255, 255, 0.3)',
            1
        );
        ctx.setLineDash([]);
    }
}

// enemies.js - Sistema de inimigos voadores

class Enemy extends EventEmitter {
    constructor(x, y, type = 'basic') {
        super();
        
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.type = type;
        
        // Estados de movimento específicos para sidescroller
        this.state = 'descending'; // descending, following, attacking
        this.targetHeight = 0; // 70% da altura da tela
        this.followDelay = 100; // delay suave para seguir o jogador
        
        // Configurações baseadas no tipo
        this.setupByType(type);
        
        // Estados
        this.hp = this.maxHp;
        this.lastAttackTime = 0;
        this.target = null;
        this.stateTime = 0;
        this.expValue = this.points; // EXP que dá quando morto
        
        // Projéteis do inimigo
        this.projectiles = [];
        
        // Visual
        this.animationTime = 0;
        this.deathAnimation = false;
        this.deathTime = 0;
    }
    
    setupByType(type) {
        const types = {
            basic: {
                maxHp: 25,
                speed: 80,
                damage: 10,
                attackSpeed: 1.2,
                size: 12,
                color: '#ff6666',
                points: 15,
                projectileSpeed: 200,
                attackRange: 300
            },
            fast: {
                maxHp: 15,
                speed: 120,
                damage: 8,
                attackSpeed: 1.8,
                size: 10,
                color: '#ffff66',
                points: 20,
                projectileSpeed: 250,
                attackRange: 250
            },
            heavy: {
                maxHp: 60,
                speed: 50,
                damage: 20,
                attackSpeed: 0.8,
                size: 18,
                color: '#ff6600',
                points: 35,
                projectileSpeed: 150,
                attackRange: 350
            },
            sniper: {
                maxHp: 30,
                speed: 60,
                damage: 25,
                attackSpeed: 0.6,
                size: 14,
                color: '#ff66ff',
                points: 30,
                projectileSpeed: 400,
                attackRange: 400
            }
        };
        
        const config = types[type] || types.basic;
        Object.assign(this, config);
    }
    
    update(deltaTime, player, canvas) {
        if (this.deathAnimation) {
            this.updateDeathAnimation(deltaTime);
            return;
        }
        
        this.target = player;
        this.targetHeight = canvas.height * 0.7; // 70% da altura
        
        this.updateMovement(deltaTime, canvas);
        this.updateCombat(deltaTime, canvas);
        this.updateProjectiles(deltaTime, canvas);
        this.animationTime += deltaTime;
        this.stateTime += deltaTime;
    }
    
    updateMovement(deltaTime, canvas) {
        const dt = deltaTime / 1000;
        
        if (this.state === 'descending') {
            // Fase 1: Descer verticalmente até 70% da altura da tela
            this.vy = this.speed * 0.8; // velocidade de descida
            this.vx = 0; // sem movimento horizontal
            
            // Verificar se atingiu 70% da altura
            if (this.y >= this.targetHeight) {
                this.state = 'following';
                this.vy = 0;
            }
        } else if (this.state === 'following') {
            // Fase 2: Seguir o jogador com atraso suave
            if (!this.target) return;
            
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Movimento suave com atraso
                const followStrength = 0.7; // reduz a responsividade para criar atraso
                const dirX = (dx / distance) * followStrength;
                const dirY = (dy / distance) * followStrength;
                
                // Velocidade baseada na distância (mais longe = mais rápido)
                const speedMultiplier = Math.min(2.0, distance / 100);
                const moveSpeed = this.speed * speedMultiplier;
                
                this.vx = dirX * moveSpeed;
                this.vy = dirY * moveSpeed;
                
                // Adicionar pequena variação no movimento para parecer mais orgânico
                if (this.animationTime % 2000 < 100) {
                    this.vx += Math2D.random(-30, 30);
                    this.vy += Math2D.random(-30, 30);
                }
            }
        }
        
        // Aplicar velocidade
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Manter dentro do canvas
        const margin = this.size;
        this.x = Math2D.clamp(this.x, margin, canvas.width - margin);
        
        // Não permitir subir acima de 70% quando em following
        if (this.state === 'following') {
            this.y = Math.max(this.targetHeight, this.y);
        }
        
        this.y = Math2D.clamp(this.y, margin, canvas.height - margin);
    }
    
    updateCombat(deltaTime, canvas) {
        if (!this.target || this.state === 'descending') return;
        
        const distance = Math2D.distance(this.x, this.y, this.target.x, this.target.y);
        const now = Date.now();
        const attackInterval = 1000 / this.attackSpeed;
        
        // Só ataca quando está seguindo o jogador
        if (this.state === 'following' && now - this.lastAttackTime >= attackInterval) {
            if (distance <= this.attackRange) {
                this.shootAt(this.target);
                this.lastAttackTime = now;
            }
        }
    }
    
    updateProjectiles(deltaTime, canvas) {
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
            
            return true;
        });
    }
    
    shootAt(target) {
        const angle = Math2D.angle(this.x, this.y, target.x, target.y);
        
        const projectile = {
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * this.projectileSpeed,
            vy: Math.sin(angle) * this.projectileSpeed,
            damage: this.damage,
            size: 5,
            color: this.color,
            lifetime: 4000,
            createdAt: Date.now()
        };
        
        this.projectiles.push(projectile);
        this.emit('enemyShot', projectile);
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        this.emit('damaged', damage);
        
        // Pequeno knockback para trás
        if (this.target) {
            const angle = Math2D.angle(this.target.x, this.target.y, this.x, this.y);
            this.vx = Math.cos(angle) * 100;
            this.vy = Math.sin(angle) * 100;
        }
        
        if (this.hp <= 0) {
            this.die();
        }
    }
    
    die() {
        this.deathAnimation = true;
        this.deathTime = 0;
        this.emit('death', this);
    }
    
    updateDeathAnimation(deltaTime) {
        this.deathTime += deltaTime;
        // Animação dura 500ms
        if (this.deathTime >= 500) {
            this.emit('remove', this);
        }
    }
    
    render(ctx) {
        if (this.deathAnimation) {
            this.renderDeathAnimation(ctx);
            return;
        }
        
        // Desenhar corpo
        this.renderBody(ctx);
        
        // Desenhar projéteis
        this.renderProjectiles(ctx);
        
        // Desenhar HP bar se não estiver com HP cheio
        if (this.hp < this.maxHp) {
            this.renderHealthBar(ctx);
        }
    }
    
    renderBody(ctx) {
        // Efeito de piscar quando com pouco HP
        const flashEffect = (Date.now() % 300) < 150;
        const lowHP = this.hp < this.maxHp * 0.3;
        const color = flashEffect && lowHP ? '#ffffff' : this.color;
        
        // Corpo principal
        CanvasUtils.drawCircle(ctx, this.x, this.y, this.size, color);
        
        // Borda
        CanvasUtils.drawCircle(ctx, this.x, this.y, this.size, '#ffffff', false);
        
        // Indicador de direção (pequenas asas ou olhos)
        const wingOffset = this.size * 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x - wingOffset, this.y, 3, 0, Math.PI * 2);
        ctx.arc(this.x + wingOffset, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderProjectiles(ctx) {
        for (let projectile of this.projectiles) {
            CanvasUtils.drawCircle(ctx, projectile.x, projectile.y, projectile.size, projectile.color);
        }
    }
    
    renderHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 3;
        const barY = this.y - this.size - 8;
        
        // Background
        CanvasUtils.drawRect(ctx, this.x - barWidth/2, barY, barWidth, barHeight, 'rgba(0, 0, 0, 0.5)');
        
        // HP fill
        const hpPercent = this.hp / this.maxHp;
        const fillWidth = barWidth * hpPercent;
        const color = hpPercent > 0.6 ? '#4CAF50' : hpPercent > 0.3 ? '#FF9800' : '#F44336';
        
        CanvasUtils.drawRect(ctx, this.x - barWidth/2, barY, fillWidth, barHeight, color);
    }
    
    renderDeathAnimation(ctx) {
        const progress = this.deathTime / 500;
        const alpha = 1 - progress;
        const scale = 1 + progress * 2;
        
        ctx.globalAlpha = alpha;
        CanvasUtils.drawCircle(ctx, this.x, this.y, this.size * scale, this.color);
        ctx.globalAlpha = 1.0;
    }
}

// Sistema de spawn contínuo de inimigos
class EnemySpawner extends EventEmitter {
    constructor() {
        super();
        
        this.enemies = [];
        this.enemyProjectiles = [];
        
        // Sistema de spawn contínuo
        this.spawnRate = 2000; // 2 segundos entre spawns inicialmente
        this.lastSpawnTime = 0;
        this.maxEnemies = 8; // máximo de inimigos na tela
        
        // Progressão de dificuldade
        this.gameStartTime = Date.now();
        this.difficultyMultiplier = 1.0;
        this.difficultyIncreaseInterval = 30000; // aumenta a cada 30 segundos
        
        // Estatísticas
        this.totalEnemiesSpawned = 0;
        this.totalEnemiesKilled = 0;
    }
    
    update(deltaTime, player, canvas) {
        this.updateDifficulty();
        this.updateSpawning(canvas);
        this.updateEnemies(deltaTime, player, canvas);
        this.updateEnemyProjectiles(deltaTime, player, canvas);
    }
    
    updateDifficulty() {
        const timeElapsed = Date.now() - this.gameStartTime;
        const difficultyLevel = Math.floor(timeElapsed / this.difficultyIncreaseInterval);
        
        // Aumentar dificuldade gradualmente
        this.difficultyMultiplier = 1.0 + (difficultyLevel * 0.2);
        
        // Reduzir tempo entre spawns
        this.spawnRate = Math.max(800, 2000 - (difficultyLevel * 150));
        
        // Aumentar máximo de inimigos
        this.maxEnemies = Math.min(15, 8 + difficultyLevel);
    }
    
    updateSpawning(canvas) {
        const now = Date.now();
        
        // Spawn contínuo se não atingiu o máximo
        if (now - this.lastSpawnTime >= this.spawnRate && 
            this.enemies.length < this.maxEnemies) {
            
            this.spawnEnemy(canvas);
            this.lastSpawnTime = now;
        }
    }
    
    spawnEnemy(canvas) {
        // Spawnar sempre no topo da tela (conforme descrição)
        const x = Math2D.random(50, canvas.width - 50);
        const y = -30; // acima da tela
        
        // Determinar tipo de inimigo baseado na dificuldade
        const enemyType = this.determineEnemyType();
        const enemy = new Enemy(x, y, enemyType);
        
        // Aplicar escalas de dificuldade
        enemy.maxHp = Math.floor(enemy.maxHp * this.difficultyMultiplier);
        enemy.hp = enemy.maxHp;
        enemy.damage = Math.floor(enemy.damage * this.difficultyMultiplier);
        enemy.speed = Math.floor(enemy.speed * (1 + (this.difficultyMultiplier - 1) * 0.5));
        enemy.expValue = Math.floor(enemy.expValue * this.difficultyMultiplier);
        
        // Event listeners
        enemy.on('death', () => {
            this.totalEnemiesKilled++;
            this.removeEnemy(enemy);
            this.emit('enemyKilled', enemy);
        });
        
        enemy.on('enemyShot', (projectile) => {
            this.enemyProjectiles.push(projectile);
        });
        
        enemy.on('remove', (enemyToRemove) => {
            this.removeEnemy(enemyToRemove);
        });
        
        this.enemies.push(enemy);
        this.totalEnemiesSpawned++;
        this.emit('enemySpawned', enemy);
    }
    
    determineEnemyType() {
        const difficultyLevel = Math.floor((Date.now() - this.gameStartTime) / this.difficultyIncreaseInterval);
        const random = Math.random();
        
        // Tipos básicos inicialmente, mais variedade com dificuldade
        if (difficultyLevel === 0) {
            return 'basic';
        } else if (difficultyLevel === 1) {
            return random < 0.7 ? 'basic' : 'fast';
        } else if (difficultyLevel === 2) {
            if (random < 0.5) return 'basic';
            else if (random < 0.8) return 'fast';
            else return 'heavy';
        } else {
            // Dificuldade alta - todos os tipos
            if (random < 0.3) return 'basic';
            else if (random < 0.5) return 'fast';
            else if (random < 0.7) return 'heavy';
            else return 'sniper';
        }
    }
    
    updateEnemies(deltaTime, player, canvas) {
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(deltaTime, player, canvas);
            
            // Verificar colisão com jogador (apenas quando muito próximo)
            const distance = Math2D.distance(enemy.x, enemy.y, player.x, player.y);
            const collisionDistance = enemy.size + player.size - 5;
            
            if (distance < collisionDistance) {
                player.takeDamage(enemy.damage);
                enemy.takeDamage(enemy.maxHp * 0.5); // Dano no inimigo também
            }
            
            return enemy.hp > 0 || (enemy.deathAnimation && enemy.deathTime < 500);
        });
    }
    
    updateEnemyProjectiles(deltaTime, player, canvas) {
        const dt = deltaTime / 1000;
        const now = Date.now();
        
        this.enemyProjectiles = this.enemyProjectiles.filter(projectile => {
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
            
            // Verificar colisão com jogador
            if (Collision.circleCircle(
                projectile.x, projectile.y, projectile.size,
                player.x, player.y, player.size
            )) {
                player.takeDamage(projectile.damage);
                return false;
            }
            
            return true;
        });
    }
    
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }
    
    render(ctx) {
        // Renderizar inimigos
        for (let enemy of this.enemies) {
            enemy.render(ctx);
        }
        
        // Renderizar projéteis inimigos
        for (let projectile of this.enemyProjectiles) {
            CanvasUtils.drawCircle(ctx, projectile.x, projectile.y, projectile.size, projectile.color);
        }
    }
    
    getEnemies() {
        return this.enemies;
    }
    
    getEnemyProjectiles() {
        return this.enemyProjectiles;
    }
    
    getStats() {
        return {
            totalSpawned: this.totalEnemiesSpawned,
            totalKilled: this.totalEnemiesKilled,
            currentEnemies: this.enemies.length,
            difficultyMultiplier: this.difficultyMultiplier,
            spawnRate: this.spawnRate
        };
    }
}

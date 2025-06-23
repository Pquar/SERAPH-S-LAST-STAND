// enemies.js - Sistema de inimigos e ondas

class Enemy extends EventEmitter {
    constructor(x, y, type = 'basic') {
        super();
        
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.type = type;
        
        // Configurações baseadas no tipo
        this.setupByType(type);
        
        // Estados
        this.hp = this.maxHp;
        this.lastAttackTime = 0;
        this.target = null;
        this.state = 'seeking'; // seeking, attacking, stunned
        this.stateTime = 0;
        
        // Visual
        this.animationTime = 0;
        this.deathAnimation = false;
        this.deathTime = 0;
        
        // Trail para movimento
        this.trailPoints = [];
        this.maxTrailPoints = 5;
    }
    
    setupByType(type) {
        const types = {
            basic: {
                maxHp: 30,
                speed: 100,
                damage: 15,
                attackSpeed: 1.0,
                size: 15,
                color: '#ff6666',
                soulOrbChance: 0.3,
                soulOrbValue: 1,
                points: 10
            },
            fast: {
                maxHp: 20,
                speed: 180,
                damage: 10,
                attackSpeed: 1.5,
                size: 12,
                color: '#ffff66',
                soulOrbChance: 0.2,
                soulOrbValue: 1,
                points: 15
            },
            heavy: {
                maxHp: 80,
                speed: 60,
                damage: 25,
                attackSpeed: 0.7,
                size: 25,
                color: '#ff6600',
                soulOrbChance: 0.5,
                soulOrbValue: 3,
                points: 30
            },
            shooter: {
                maxHp: 25,
                speed: 80,
                damage: 12,
                attackSpeed: 2.0,
                size: 14,
                color: '#ff66ff',
                soulOrbChance: 0.4,
                soulOrbValue: 2,
                points: 20,
                range: 200,
                projectileSpeed: 300
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
        this.updateMovement(deltaTime, canvas);
        this.updateCombat(deltaTime);
        this.updateTrail();
        this.animationTime += deltaTime;
        this.stateTime += deltaTime;
    }
    
    updateMovement(deltaTime, canvas) {
        if (!this.target || this.state === 'stunned') return;
        
        const dt = deltaTime / 1000;
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Normalizar direção
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Comportamento baseado no tipo
            let moveSpeed = this.speed;
            let keepDistance = this.size + this.target.size + 5;
            
            if (this.type === 'shooter') {
                // Shooters mantém distância
                keepDistance = this.range * 0.7;
                if (distance < keepDistance) {
                    // Se muito perto, se afasta
                    moveSpeed *= -0.5;
                }
            }
            
            // Aplicar movimento se não estiver na distância ideal
            if (distance > keepDistance) {
                this.vx = dirX * moveSpeed;
                this.vy = dirY * moveSpeed;
            } else {
                // Parar se estiver próximo o suficiente
                this.vx *= 0.9;
                this.vy *= 0.9;
            }
            
            // Adicionar um pouco de variação no movimento
            if (this.animationTime % 1000 < 100) {
                this.vx += Math2D.random(-50, 50);
                this.vy += Math2D.random(-50, 50);
            }
        }
        
        // Aplicar velocidade
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Manter dentro do canvas
        const margin = this.size;
        this.x = Math2D.clamp(this.x, margin, canvas.width - margin);
        this.y = Math2D.clamp(this.y, margin, canvas.height - margin);
    }
    
    updateCombat(deltaTime) {
        if (!this.target || this.state === 'stunned') return;
        
        const distance = Math2D.distance(this.x, this.y, this.target.x, this.target.y);
        const now = Date.now();
        const attackInterval = 1000 / this.attackSpeed;
        
        if (now - this.lastAttackTime >= attackInterval) {
            if (this.type === 'shooter') {
                // Atirador: ataca à distância
                if (distance <= this.range) {
                    this.shootAt(this.target);
                    this.lastAttackTime = now;
                }
            } else {
                // Melee: ataca quando próximo
                const attackRange = this.size + this.target.size + 10;
                if (distance <= attackRange) {
                    this.meleeAttack();
                    this.lastAttackTime = now;
                }
            }
        }
    }
    
    shootAt(target) {
        const angle = Math2D.angle(this.x, this.y, target.x, target.y);
        
        // Criar projétil inimigo (será implementado no sistema de projéteis)
        this.emit('enemyShot', {
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * this.projectileSpeed,
            vy: Math.sin(angle) * this.projectileSpeed,
            damage: this.damage,
            size: 4,
            color: this.color
        });
    }
    
    meleeAttack() {
        // Ataque corpo a corpo
        this.emit('meleeAttack', this.damage);
        
        // Pequeno knockback
        const angle = Math2D.angle(this.x, this.y, this.target.x, this.target.y);
        this.vx = -Math.cos(angle) * 100;
        this.vy = -Math.sin(angle) * 100;
    }
    
    updateTrail() {
        // Só adiciona trail se estiver se movendo
        if (Math.abs(this.vx) > 10 || Math.abs(this.vy) > 10) {
            this.trailPoints.push({ x: this.x, y: this.y, alpha: 1.0 });
            
            if (this.trailPoints.length > this.maxTrailPoints) {
                this.trailPoints.shift();
            }
        }
        
        // Reduzir alpha dos pontos
        this.trailPoints.forEach((point, index) => {
            point.alpha = (index + 1) / this.trailPoints.length * 0.3;
        });
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        this.emit('damaged', damage);
        
        // Knockback
        if (this.target) {
            const angle = Math2D.angle(this.target.x, this.target.y, this.x, this.y);
            this.vx = Math.cos(angle) * 150;
            this.vy = Math.sin(angle) * 150;
        }
        
        if (this.hp <= 0) {
            this.die();
        }
    }
    
    die() {
        this.deathAnimation = true;
        this.deathTime = 0;
        this.emit('death', this);
        
        // Chance de dropar soul orb
        if (Math.random() < this.soulOrbChance) {
            this.emit('soulOrbDrop', {
                x: this.x,
                y: this.y,
                value: this.soulOrbValue
            });
        }
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
        
        // Desenhar trail
        this.renderTrail(ctx);
        
        // Desenhar corpo
        this.renderBody(ctx);
        
        // Desenhar HP bar se não estiver com HP cheio
        if (this.hp < this.maxHp) {
            this.renderHealthBar(ctx);
        }
        
        // Indicadores especiais
        if (this.type === 'shooter') {
            this.renderShooterIndicator(ctx);
        }
    }
    
    renderTrail(ctx) {
        if (this.trailPoints.length < 2) return;
        
        this.trailPoints.forEach(point => {
            CanvasUtils.drawCircle(ctx, point.x, point.y, this.size * 0.5, 
                                 `rgba(255, 100, 100, ${point.alpha})`);
        });
    }
    
    renderBody(ctx) {
        // Efeito de piscar quando dano
        const flashEffect = (Date.now() % 200) < 100;
        const color = flashEffect && this.hp < this.maxHp * 0.3 ? '#ffffff' : this.color;
        
        // Corpo principal
        CanvasUtils.drawCircle(ctx, this.x, this.y, this.size, color);
        
        // Borda
        CanvasUtils.drawCircle(ctx, this.x, this.y, this.size, '#ffffff', false);
        
        // Olhos simples
        const eyeOffset = this.size * 0.3;
        CanvasUtils.drawCircle(ctx, this.x - eyeOffset, this.y - eyeOffset, 2, '#000000');
        CanvasUtils.drawCircle(ctx, this.x + eyeOffset, this.y - eyeOffset, 2, '#000000');
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
    
    renderShooterIndicator(ctx) {
        // Círculo de range
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 100, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
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

// Sistema de gerenciamento de ondas
class WaveSystem extends EventEmitter {
    constructor() {
        super();
        
        this.currentWave = 1;
        this.enemies = [];
        this.enemyProjectiles = [];
        this.waveStartTime = 0;
        this.waveInProgress = false;
        this.timeBetweenWaves = 3000; // 3 segundos
        this.difficultyMultiplier = 1.0;
        
        // Estatísticas da onda
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.totalEnemiesInWave = 0;
        
        // Timer de dificuldade
        this.gameStartTime = Date.now();
        this.difficultyIncreaseInterval = 30000; // A cada 30 segundos
    }
    
    update(deltaTime, player, canvas) {
        this.updateDifficulty();
        this.updateEnemies(deltaTime, player, canvas);
        this.updateEnemyProjectiles(deltaTime, player, canvas);
        this.updateWaveLogic();
    }
    
    updateDifficulty() {
        const timeElapsed = Date.now() - this.gameStartTime;
        const difficultyLevel = Math.floor(timeElapsed / this.difficultyIncreaseInterval);
        this.difficultyMultiplier = 1.0 + (difficultyLevel * 0.2);
    }
    
    updateEnemies(deltaTime, player, canvas) {
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(deltaTime, player, canvas);
            
            // Verificar colisão com jogador (apenas melee)
            if (enemy.type !== 'shooter') {
                const distance = Math2D.distance(enemy.x, enemy.y, player.x, player.y);
                const collisionDistance = enemy.size + player.size;
                
                if (distance < collisionDistance) {
                    player.takeDamage(enemy.damage);
                    enemy.takeDamage(enemy.maxHp); // Mata o inimigo no contato
                }
            }
            
            return !enemy.deathAnimation || enemy.deathTime < 500;
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
            if (now - projectile.createdAt > 5000) {
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
    
    updateWaveLogic() {
        if (!this.waveInProgress && this.enemies.length === 0) {
            // Iniciar nova onda
            this.startWave();
        }
        
        // Verificar se onda terminou
        if (this.waveInProgress && this.enemiesKilled >= this.totalEnemiesInWave) {
            this.completeWave();
        }
    }
    
    startWave() {
        this.currentWave++;
        this.waveInProgress = true;
        this.waveStartTime = Date.now();
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        
        // Calcular número de inimigos baseado na onda e dificuldade
        this.totalEnemiesInWave = Math.floor(5 + (this.currentWave * 1.5) * this.difficultyMultiplier);
        
        this.emit('waveStart', this.currentWave);
        
        // Spawn inimigos ao longo do tempo
        this.scheduleEnemySpawns();
    }
    
    scheduleEnemySpawns() {
        const spawnInterval = 1000; // 1 segundo entre spawns
        const spawnCount = Math.min(3, this.totalEnemiesInWave - this.enemiesSpawned);
        
        for (let i = 0; i < spawnCount; i++) {
            setTimeout(() => {
                if (this.enemiesSpawned < this.totalEnemiesInWave) {
                    this.spawnEnemy();
                }
            }, i * (spawnInterval / spawnCount));
        }
        
        // Agendar próximo batch se necessário
        if (this.enemiesSpawned + spawnCount < this.totalEnemiesInWave) {
            setTimeout(() => {
                this.scheduleEnemySpawns();
            }, spawnInterval);
        }
    }
    
    spawnEnemy() {
        const canvas = document.getElementById('gameCanvas');
        const spawnSide = Math2D.randomInt(0, 3); // 0=top, 1=right, 2=bottom, 3=left
        let x, y;
        
        switch (spawnSide) {
            case 0: // top
                x = Math2D.random(50, canvas.width - 50);
                y = -30;
                break;
            case 1: // right
                x = canvas.width + 30;
                y = Math2D.random(50, canvas.height - 50);
                break;
            case 2: // bottom
                x = Math2D.random(50, canvas.width - 50);
                y = canvas.height + 30;
                break;
            case 3: // left
                x = -30;
                y = Math2D.random(50, canvas.height - 50);
                break;
        }
        
        // Determinar tipo de inimigo baseado na onda
        const enemyType = this.determineEnemyType();
        const enemy = new Enemy(x, y, enemyType);
        
        // Event listeners
        enemy.on('death', () => {
            this.enemiesKilled++;
            this.emit('enemyKilled', enemy);
        });
        
        enemy.on('enemyShot', (projectile) => {
            projectile.createdAt = Date.now();
            this.enemyProjectiles.push(projectile);
        });
        
        enemy.on('meleeAttack', (damage) => {
            // Este evento será tratado na colisão física
        });
        
        enemy.on('soulOrbDrop', (orb) => {
            this.emit('soulOrbDrop', orb);
        });
        
        this.enemies.push(enemy);
        this.enemiesSpawned++;
    }
    
    determineEnemyType() {
        const wave = this.currentWave;
        const rand = Math.random();
        
        // Tipos básicos sempre disponíveis
        if (wave < 5) {
            return rand < 0.7 ? 'basic' : 'fast';
        } else if (wave < 10) {
            if (rand < 0.4) return 'basic';
            if (rand < 0.7) return 'fast';
            if (rand < 0.9) return 'heavy';
            return 'shooter';
        } else {
            // Ondas avançadas: mais variedade
            if (rand < 0.3) return 'basic';
            if (rand < 0.5) return 'fast';
            if (rand < 0.7) return 'heavy';
            return 'shooter';
        }
    }
    
    completeWave() {
        this.waveInProgress = false;
        this.emit('waveComplete', this.currentWave - 1);
    }
    
    render(ctx) {
        // Renderizar inimigos
        this.enemies.forEach(enemy => enemy.render(ctx));
        
        // Renderizar projéteis inimigos
        this.enemyProjectiles.forEach(projectile => {
            CanvasUtils.drawCircle(ctx, projectile.x, projectile.y, projectile.size, projectile.color);
        });
    }
    
    getWaveInfo() {
        return {
            current: this.currentWave,
            enemiesAlive: this.enemies.length,
            enemiesKilled: this.enemiesKilled,
            totalEnemies: this.totalEnemiesInWave,
            inProgress: this.waveInProgress,
            difficulty: this.difficultyMultiplier.toFixed(1)
        };
    }
}

// terrain.js - Sistema de terreno e plataformas em degraus

class Terrain {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.platforms = [];
        
        this.createTerrain();
    }
    
    createTerrain() {
        // Criar terreno em formato de degraus baseado na descrição
        const stepWidth = 120;
        const stepHeight = 80;
        const numSteps = Math.floor(this.canvasWidth / stepWidth);
        const baseY = this.canvasHeight - 60; // altura do chão
        
        // Chão principal (base)
        this.platforms.push({
            x: 0,
            y: baseY,
            width: this.canvasWidth,
            height: 60,
            type: 'ground'
        });
        
        // Criar degraus em ambos os lados
        // Lado esquerdo - degraus ascendentes
        for (let i = 0; i < Math.floor(numSteps / 2); i++) {
            const x = i * stepWidth;
            const y = baseY - (i + 1) * stepHeight;
            
            if (y > 100) { // não criar muito alto
                this.platforms.push({
                    x: x,
                    y: y,
                    width: stepWidth + 20,
                    height: 20,
                    type: 'platform'
                });
            }
        }
        
        // Lado direito - degraus ascendentes (espelhado)
        for (let i = 0; i < Math.floor(numSteps / 2); i++) {
            const x = this.canvasWidth - (i + 1) * stepWidth;
            const y = baseY - (i + 1) * stepHeight;
            
            if (y > 100 && x > 0) { // não criar muito alto nem fora da tela
                this.platforms.push({
                    x: x,
                    y: y,
                    width: stepWidth + 20,
                    height: 20,
                    type: 'platform'
                });
            }
        }
        
        // Plataforma central elevada
        const centerX = this.canvasWidth / 2 - stepWidth / 2;
        const centerY = baseY - stepHeight * 2;
        
        if (centerY > 150) {
            this.platforms.push({
                x: centerX,
                y: centerY,
                width: stepWidth,
                height: 20,
                type: 'platform'
            });
        }
    }
    
    // Verificar colisão de um objeto com as plataformas
    checkCollision(x, y, width, height, velocityY) {
        for (let platform of this.platforms) {
            // Verificar se está caindo na plataforma (apenas de cima)
            if (velocityY >= 0 && 
                y + height >= platform.y &&
                y + height <= platform.y + platform.height + 10 &&
                x + width > platform.x && 
                x < platform.x + platform.width) {
                
                return {
                    collided: true,
                    platform: platform,
                    newY: platform.y - height
                };
            }
        }
        
        return { collided: false };
    }
    
    // Encontrar a plataforma mais próxima abaixo de uma posição
    findGroundBelow(x, y) {
        let closestPlatform = null;
        let closestDistance = Infinity;
        
        for (let platform of this.platforms) {
            if (platform.y > y && 
                x >= platform.x && 
                x <= platform.x + platform.width) {
                
                const distance = platform.y - y;
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPlatform = platform;
                }
            }
        }
        
        // Se não encontrou plataforma específica, usar o chão
        if (!closestPlatform) {
            const ground = this.platforms.find(p => p.type === 'ground');
            if (ground) {
                return ground.y;
            }
        }
        
        return closestPlatform ? closestPlatform.y : this.canvasHeight - 60;
    }
    
    // Renderizar o terreno
    render(ctx) {
        ctx.fillStyle = '#2d5a2d'; // verde escuro para plataformas
        ctx.strokeStyle = '#4a8f4a'; // verde claro para bordas
        ctx.lineWidth = 2;
        
        for (let platform of this.platforms) {
            // Preenchimento
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Borda superior mais clara
            ctx.strokeStyle = '#6abf6a';
            ctx.beginPath();
            ctx.moveTo(platform.x, platform.y);
            ctx.lineTo(platform.x + platform.width, platform.y);
            ctx.stroke();
            
            // Bordas laterais
            ctx.strokeStyle = '#1a401a';
            ctx.beginPath();
            ctx.moveTo(platform.x, platform.y);
            ctx.lineTo(platform.x, platform.y + platform.height);
            ctx.moveTo(platform.x + platform.width, platform.y);
            ctx.lineTo(platform.x + platform.width, platform.y + platform.height);
            ctx.stroke();
        }
    }
    
    // Atualizar tamanho quando canvas redimensionar
    resize(newWidth, newHeight) {
        this.canvasWidth = newWidth;
        this.canvasHeight = newHeight;
        this.platforms = [];
        this.createTerrain();
    }
    
    // Obter todas as plataformas (para uso pelo player)
    getPlatforms() {
        return this.platforms;
    }
}

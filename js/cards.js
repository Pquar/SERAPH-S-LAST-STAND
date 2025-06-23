// cards.js - Sistema de cartas placeholder (para implementação futura)

class Card {
    constructor(name, rarity, description, effect) {
        this.name = name;
        this.rarity = rarity; // 'common', 'uncommon', 'epic', 'ascension'
        this.description = description;
        this.effect = effect;
        this.stacks = 1;
        this.maxStacks = this.getMaxStacks();
    }
    
    getMaxStacks() {
        // Diferentes cartas têm diferentes limites de stack
        const stackLimits = {
            'Catalisador': 20,
            'Visão': 10,
            'Crescimento': 15,
            'Impulso': 8,
            'Resistência': 20,
            'Ressonância': 10,
            'Veloz': 10
        };
        
        return stackLimits[this.name] || 5;
    }
    
    apply(player) {
        // Aplicar efeito da carta ao jogador
        if (typeof this.effect === 'function') {
            this.effect(player, this.stacks);
        }
    }
    
    addStack() {
        if (this.stacks < this.maxStacks) {
            this.stacks++;
            return true;
        }
        return false;
    }
    
    getColor() {
        const colors = {
            common: '#ffffff',
            uncommon: '#4da6ff',
            epic: '#9d4edd',
            ascension: '#ffd700'
        };
        return colors[this.rarity] || colors.common;
    }
    
    getDisplayName() {
        return this.stacks > 1 ? `${this.name} (${this.stacks})` : this.name;
    }
}

class CardSystem extends EventEmitter {
    constructor() {
        super();
        
        this.cardDatabase = this.initializeCardDatabase();
        this.playerCards = [];
        this.cardChoices = [];
        this.isChoosingCard = false;
    }
    
    initializeCardDatabase() {
        return {
            // Cartas Comuns
            common: [
                new Card('Catalisador', 'common', 'Dano de Projétil +2', (player, stacks) => {
                    player.damage += 2 * stacks;
                }),
                new Card('Visão', 'common', 'Chance crítica +5%', (player, stacks) => {
                    player.critChance += 0.05 * stacks;
                }),
                new Card('Crescimento', 'common', 'HP máximo +10', (player, stacks) => {
                    const oldMax = player.maxHp;
                    player.maxHp += 10 * stacks;
                    player.hp += player.maxHp - oldMax; // Heal por HP aumentado
                }),
                new Card('Impulso', 'common', 'Altura do Salto +30%', (player, stacks) => {
                    player.jumpHeight += player.jumpHeight * 0.3 * stacks;
                }),
                new Card('Renovar', 'common', 'Cura completa instantânea', (player, stacks) => {
                    player.heal(player.maxHp);
                }),
                new Card('Resistência', 'common', 'Redução de dano +4%', (player, stacks) => {
                    player.defense += 4 * stacks;
                }),
                new Card('Ressonância', 'common', 'Velocidade de Ataque +12%', (player, stacks) => {
                    player.attackSpeed += player.attackSpeed * 0.12 * stacks;
                }),
                new Card('Veloz', 'common', 'Velocidade de Movimento +20%', (player, stacks) => {
                    player.speed += player.speed * 0.2 * stacks;
                })
            ],
            
            // Cartas Incomuns (placeholder)
            uncommon: [
                new Card('Catalisador+', 'uncommon', 'Dano de Projétil +4', (player, stacks) => {
                    player.damage += 4 * stacks;
                }),
                new Card('Carga', 'uncommon', 'Tamanho do Projétil +20%', (player, stacks) => {
                    player.projectileSize += player.projectileSize * 0.2 * stacks;
                }),
                new Card('Sanguessuga', 'uncommon', '3% de lifesteal em todo dano', (player, stacks) => {
                    // TODO: Implementar lifesteal
                })
            ],
            
            // Cartas Épicas (placeholder)
            epic: [
                new Card('Imortal', 'epic', '+1 Vida extra (mata todos inimigos ao reviver)', (player, stacks) => {
                    // TODO: Implementar sistema de revive
                })
            ],
            
            // Cartas de Ascensão (placeholder)
            ascension: []
        };
    }
    
    // Oferecer escolha de cartas (placeholder)
    offerCardChoice(rarityWeights = { common: 0.7, uncommon: 0.25, epic: 0.045, ascension: 0.005 }) {
        if (this.isChoosingCard) return;
        
        this.isChoosingCard = true;
        this.cardChoices = this.generateCardChoices(3, rarityWeights);
        
        this.emit('cardChoiceOffered', this.cardChoices);
    }
    
    generateCardChoices(count, weights) {
        const choices = [];
        
        for (let i = 0; i < count; i++) {
            const rarity = this.selectRarity(weights);
            const availableCards = this.cardDatabase[rarity];
            
            if (availableCards.length > 0) {
                const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
                choices.push(this.cloneCard(randomCard));
            }
        }
        
        return choices;
    }
    
    selectRarity(weights) {
        const rand = Math.random();
        let accumulated = 0;
        
        for (const [rarity, weight] of Object.entries(weights)) {
            accumulated += weight;
            if (rand <= accumulated) {
                return rarity;
            }
        }
        
        return 'common'; // fallback
    }
    
    cloneCard(card) {
        return new Card(card.name, card.rarity, card.description, card.effect);
    }
    
    chooseCard(cardIndex, player) {
        if (!this.isChoosingCard || cardIndex >= this.cardChoices.length) return false;
        
        const chosenCard = this.cardChoices[cardIndex];
        this.addCardToPlayer(chosenCard, player);
        
        this.isChoosingCard = false;
        this.cardChoices = [];
        
        this.emit('cardChosen', chosenCard);
        return true;
    }
    
    addCardToPlayer(card, player) {
        // Verificar se jogador já tem a carta
        const existingCard = this.playerCards.find(c => c.name === card.name);
        
        if (existingCard) {
            // Adicionar stack se possível
            if (existingCard.addStack()) {
                this.emit('cardStacked', existingCard);
            }
        } else {
            // Adicionar nova carta
            this.playerCards.push(card);
            this.emit('cardAdded', card);
        }
        
        // Aplicar efeito da carta
        card.apply(player);
    }
    
    getPlayerCards() {
        return this.playerCards;
    }
    
    hasCard(cardName) {
        return this.playerCards.some(card => card.name === cardName);
    }
    
    getCardStacks(cardName) {
        const card = this.playerCards.find(c => c.name === cardName);
        return card ? card.stacks : 0;
    }
    
    // Sistema de Ascensão (verificar requisitos)
    checkAscensionRequirements() {
        const ascensionCards = [];
        
        // Verificar cada carta de ascensão
        const requirements = {
            'Absorvente': { 'Manto': 4 },
            'Antiaéreo': { 'Atrito': 10 },
            'Vingador': { 'Fúria': 5 },
            'Abençoado': { 'Sorte': 5 },
            'Mago Sangrento': { 'Ferimento': 3 }
            // ... mais requisitos
        };
        
        for (const [ascensionName, reqs] of Object.entries(requirements)) {
            let canUnlock = true;
            
            for (const [reqCard, reqStacks] of Object.entries(reqs)) {
                if (this.getCardStacks(reqCard) < reqStacks) {
                    canUnlock = false;
                    break;
                }
            }
            
            if (canUnlock && !this.hasCard(ascensionName)) {
                ascensionCards.push(ascensionName);
            }
        }
        
        return ascensionCards;
    }
    
    // Renderizar UI de cartas (placeholder)
    renderCardChoice(ctx, canvas) {
        if (!this.isChoosingCard) return;
        
        // Overlay escuro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Título
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Escolha uma Carta', canvas.width / 2, 100);
        
        // Renderizar cartas
        const cardWidth = 150;
        const cardHeight = 200;
        const spacing = 20;
        const startX = (canvas.width - (cardWidth * this.cardChoices.length + spacing * (this.cardChoices.length - 1))) / 2;
        
        this.cardChoices.forEach((card, index) => {
            const x = startX + index * (cardWidth + spacing);
            const y = canvas.height / 2 - cardHeight / 2;
            
            this.renderCard(ctx, card, x, y, cardWidth, cardHeight, index);
        });
        
        // Instruções
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '16px Arial';
        ctx.fillText('Clique na carta desejada ou use as teclas 1, 2, 3', canvas.width / 2, canvas.height - 50);
    }
    
    renderCard(ctx, card, x, y, width, height, index) {
        // Background da carta
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(x, y, width, height);
        
        // Borda baseada na raridade
        ctx.strokeStyle = card.getColor();
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Nome da carta
        ctx.fillStyle = card.getColor();
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(card.getDisplayName(), x + width / 2, y + 30);
        
        // Descrição (quebrar texto)
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        this.wrapText(ctx, card.description, x + 10, y + 60, width - 20, 16);
        
        // Número da tecla
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 16px Arial';
        ctx.fillText((index + 1).toString(), x + 20, y + 20);
        
        // Indicador de hover/click
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    }
    
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
    
    // Handle input para escolha de carta
    handleCardChoiceInput(key) {
        if (!this.isChoosingCard) return false;
        
        const keyNum = parseInt(key);
        if (keyNum >= 1 && keyNum <= this.cardChoices.length) {
            return keyNum - 1; // Retorna índice da carta
        }
        
        return -1;
    }
    
    // Reset para novo jogo
    reset() {
        this.playerCards = [];
        this.cardChoices = [];
        this.isChoosingCard = false;
    }
}

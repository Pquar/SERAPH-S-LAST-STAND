// upgrades.js - Sistema de upgrades por nível integrado com cartas

class UpgradeSystem extends EventEmitter {
    constructor() {
        super();
        
        this.currentUpgradeOptions = [];
        this.isUpgradeMenuOpen = false;
        this.selectedUpgrade = null;
        
        // Carregar sistema de cartas
        this.loadCardSystem();
    }
    
    loadCardSystem() {
        // Certificar que o sistema de cartas está disponível
        if (typeof getRandomCards === 'undefined') {
            console.error('Card system not loaded! Make sure types-card.js is included.');
            return;
        }
    }
    
    // Gerar opções de upgrade quando jogador sobe de nível
    generateUpgradeOptions(player) {
        const baseOptions = 3;
        const extraOptions = (player.abilities && player.abilities.extraCardOptions) || 0;
        const totalOptions = baseOptions + extraOptions;
        
        // Se o chapéu força cartas incomuns+
        let cards;
        if (player.abilities && player.abilities.onlyUncommonCards) {
            cards = this.getFilteredCards(totalOptions, ['uncommon', 'epic']);
        } else {
            cards = getRandomCards(totalOptions, 0);
        }
        
        this.currentUpgradeOptions = cards;
        this.isUpgradeMenuOpen = true;
        
        this.emit('upgradeMenuOpened', cards);
        
        return cards;
    }
    
    // Obter cartas filtradas por raridade
    getFilteredCards(count, allowedRarities) {
        const cards = [];
        const pools = buildCardPools();
        
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let card = null;
            
            while (!card && attempts < 50) {
                const rarity = allowedRarities[Math.floor(Math.random() * allowedRarities.length)];
                const pool = pools[rarity];
                
                if (pool && pool.length > 0) {
                    const randomCard = pool[Math.floor(Math.random() * pool.length)];
                    
                    // Evitar duplicatas
                    if (!cards.find(c => c.id === randomCard.id)) {
                        card = randomCard;
                    }
                }
                attempts++;
            }
            
            if (card) {
                cards.push(card);
            }
        }
        
        return cards;
    }
    
    // Aplicar upgrade selecionado
    selectUpgrade(cardId, player) {
        if (!this.isUpgradeMenuOpen) return false;
        
        const selectedCard = this.currentUpgradeOptions.find(card => card.id === cardId);
        if (!selectedCard) return false;
        
        // Aplicar efeito da carta
        const success = applyCard(player, cardId, 1);
        
        if (success) {
            this.selectedUpgrade = selectedCard;
            this.closeUpgradeMenu();
            this.emit('upgradeSelected', selectedCard, player);
            
            // Efeito visual/sonoro
            this.showUpgradeEffect(selectedCard);
            
            return true;
        }
        
        return false;
    }
    
    // Reroll das opções (se permitido)
    rerollOptions(player) {
        // Verificar se tem rerolls infinitos (Fedora)
        if (player.abilities && player.abilities.infiniteRerolls) {
            this.generateUpgradeOptions(player);
            return true;
        }
        
        // Sistema básico de reroll (pode ser expandido)
        if (player.rerolls && player.rerolls > 0) {
            player.rerolls--;
            this.generateUpgradeOptions(player);
            this.emit('rerollUsed', player.rerolls);
            return true;
        }
        
        return false;
    }
    
    // Fechar menu de upgrade
    closeUpgradeMenu() {
        this.isUpgradeMenuOpen = false;
        this.currentUpgradeOptions = [];
        this.selectedUpgrade = null;
        
        this.emit('upgradeMenuClosed');
    }
    
    // Mostrar efeito visual do upgrade
    showUpgradeEffect(card) {
        // Criar elemento visual
        const effect = document.createElement('div');
        effect.className = `upgrade-effect upgrade-${card.rarity}`;
        effect.innerHTML = `
            <div class="upgrade-card">
                <img src="${card.image}" alt="${card.name}" onerror="this.style.display='none';">
                <h3>${card.name}</h3>
                <p>${card.description}</p>
            </div>
        `;
        
        // Estilos
        Object.assign(effect.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0)',
            zIndex: '2000',
            background: this.getRarityColor(card.rarity),
            padding: '20px',
            borderRadius: '15px',
            border: '3px solid #fff',
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
            color: '#fff',
            textAlign: 'center',
            maxWidth: '300px',
            animation: 'upgradeShow 2s ease-out forwards'
        });
        
        document.body.appendChild(effect);
        
        // Remover após animação
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2000);
    }
    
    // Obter cor baseada na raridade
    getRarityColor(rarity) {
        const colors = {
            common: 'linear-gradient(135deg, #9E9E9E, #BDBDBD)',
            uncommon: 'linear-gradient(135deg, #2196F3, #64B5F6)',
            epic: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
            ascension: 'linear-gradient(135deg, #FF9800, #FFB74D)'
        };
        return colors[rarity] || colors.common;
    }
    
    // Renderizar menu de upgrade
    renderUpgradeMenu(ctx, canvas) {
        if (!this.isUpgradeMenuOpen || this.currentUpgradeOptions.length === 0) {
            return;
        }
        
        // Overlay escuro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Título
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL UP!', canvas.width / 2, 80);
        
        ctx.font = '18px Arial';
        ctx.fillText('Choose an upgrade:', canvas.width / 2, 110);
        
        // Cartas
        const cardWidth = 200;
        const cardHeight = 280;
        const spacing = 20;
        const startX = (canvas.width - (this.currentUpgradeOptions.length * cardWidth + (this.currentUpgradeOptions.length - 1) * spacing)) / 2;
        const startY = 150;
        
        this.currentUpgradeOptions.forEach((card, index) => {
            const x = startX + index * (cardWidth + spacing);
            const y = startY;
            
            this.renderUpgradeCard(ctx, card, x, y, cardWidth, cardHeight, index);
        });
        
        // Instruções
        ctx.fillStyle = '#cccccc';
        ctx.font = '16px Arial';
        ctx.fillText('Click on a card to select it', canvas.width / 2, canvas.height - 40);
    }
    
    // Renderizar carta individual
    renderUpgradeCard(ctx, card, x, y, width, height, index) {
        // Background da carta
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        
        switch(card.rarity) {
            case 'common':
                gradient.addColorStop(0, '#f5f5f5');
                gradient.addColorStop(1, '#e0e0e0');
                break;
            case 'uncommon':
                gradient.addColorStop(0, '#e3f2fd');
                gradient.addColorStop(1, '#2196f3');
                break;
            case 'epic':
                gradient.addColorStop(0, '#f3e5f5');
                gradient.addColorStop(1, '#9c27b0');
                break;
            default:
                gradient.addColorStop(0, '#fff3e0');
                gradient.addColorStop(1, '#ff9800');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        // Borda
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Nome da carta
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(card.name, x + width/2, y + 30);
        
        // Descrição
        ctx.font = '14px Arial';
        const lines = this.wrapText(ctx, card.description, width - 20);
        lines.forEach((line, lineIndex) => {
            ctx.fillText(line, x + width/2, y + 60 + lineIndex * 18);
        });
        
        // Indicador de raridade
        ctx.fillStyle = this.getRarityTextColor(card.rarity);
        ctx.font = 'bold 12px Arial';
        ctx.fillText(card.rarity.toUpperCase(), x + width/2, y + height - 15);
        
        // Número da opção
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText((index + 1).toString(), x + 15, y + 20);
        
        // Guardar área clicável
        card._clickArea = { x, y, width, height };
    }
    
    // Quebrar texto em linhas
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        
        return lines;
    }
    
    // Cor do texto baseada na raridade
    getRarityTextColor(rarity) {
        const colors = {
            common: '#666666',
            uncommon: '#1976d2',
            epic: '#7b1fa2',
            ascension: '#f57c00'
        };
        return colors[rarity] || colors.common;
    }
    
    // Detectar clique nas cartas
    handleClick(x, y) {
        if (!this.isUpgradeMenuOpen) return null;
        
        for (let card of this.currentUpgradeOptions) {
            if (card._clickArea) {
                const area = card._clickArea;
                if (x >= area.x && x <= area.x + area.width &&
                    y >= area.y && y <= area.y + area.height) {
                    return card.id;
                }
            }
        }
        
        return null;
    }
}

// Adicionar estilos CSS para as animações
const upgradeStyles = document.createElement('style');
upgradeStyles.textContent = `
    @keyframes upgradeShow {
        0% {
            transform: translate(-50%, -50%) scale(0) rotate(-180deg);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
        }
    }
    
    .upgrade-card {
        text-align: center;
    }
    
    .upgrade-card img {
        width: 64px;
        height: 64px;
        margin-bottom: 10px;
        border-radius: 8px;
    }
    
    .upgrade-card h3 {
        margin: 10px 0 5px 0;
        font-size: 1.2em;
    }
    
    .upgrade-card p {
        margin: 0;
        font-size: 0.9em;
        opacity: 0.9;
    }
`;

document.head.appendChild(upgradeStyles);

// upgrades.js - Sistema de upgrades por nível

class UpgradeSystem extends EventEmitter {
    constructor() {
        super();
        
        this.availableUpgrades = this.initializeUpgrades();
        this.currentUpgradeOptions = [];
        this.isUpgradeMenuOpen = false;
    }
    
    initializeUpgrades() {
        return {
            // Upgrades Básicos (Comuns - 70% chance)
            catalyst: {
                name: "Catalyst",
                description: "Dano de Projétil +2",
                rarity: "common",
                effect: (player) => { player.damage += 2; },
                stackable: true
            },
            growth: {
                name: "Growth",
                description: "HP máximo +10",
                rarity: "common",
                effect: (player) => { 
                    player.maxHp += 10; 
                    player.hp += 10; // também cura
                },
                stackable: true
            },
            swift: {
                name: "Swift",
                description: "Velocidade de Movimento +15%",
                rarity: "common",
                effect: (player) => { player.speed *= 1.15; },
                stackable: true
            },
            resonance: {
                name: "Resonance",
                description: "Velocidade de Ataque +10%",
                rarity: "common",
                effect: (player) => { player.attackSpeed *= 1.10; },
                stackable: true
            },
            impulse: {
                name: "Impulse",
                description: "Altura do Salto +25%",
                rarity: "common",
                effect: (player) => { player.jumpSpeed *= 1.25; },
                stackable: true
            },
            resist: {
                name: "Resist",
                description: "Redução de dano +3%",
                rarity: "common",
                effect: (player) => { player.defense += 3; },
                stackable: true
            },
            precision: {
                name: "Precision",
                description: "Chance crítica +5%",
                rarity: "common",
                effect: (player) => { player.critChance += 0.05; },
                stackable: true
            },
            renew: {
                name: "Renew",
                description: "Cura completa instantânea",
                rarity: "common",
                effect: (player) => { player.hp = player.maxHp; },
                stackable: false
            },
            
            // Upgrades Especiais (Incomuns - 25% chance)
            catalystPlus: {
                name: "Catalyst+",
                description: "Dano de Projétil +4",
                rarity: "uncommon",
                effect: (player) => { player.damage += 4; },
                stackable: true
            },
            growthPlus: {
                name: "Growth+",
                description: "HP máximo +20",
                rarity: "uncommon",
                effect: (player) => { 
                    player.maxHp += 20; 
                    player.hp += 20; 
                },
                stackable: true
            },
            swiftPlus: {
                name: "Swift+",
                description: "Velocidade de Movimento +30%",
                rarity: "uncommon",
                effect: (player) => { player.speed *= 1.30; },
                stackable: true
            },
            gush: {
                name: "Gush",
                description: "+1 Salto adicional (multi-jump)",
                rarity: "uncommon",
                effect: (player) => { player.maxJumps += 1; },
                stackable: true
            },
            leech: {
                name: "Leech",
                description: "5% lifesteal em todo dano causado",
                rarity: "uncommon",
                effect: (player) => { 
                    player.lifesteal = (player.lifesteal || 0) + 0.05; 
                },
                stackable: true
            },
            charge: {
                name: "Charge",
                description: "Tamanho do Projétil +25%",
                rarity: "uncommon",
                effect: (player) => { player.projectileSize *= 1.25; },
                stackable: true
            },
            fragmentation: {
                name: "Fragmentation",
                description: "Inimigos mortos liberam 2 projéteis",
                rarity: "uncommon",
                effect: (player) => { 
                    player.fragmentation = (player.fragmentation || 0) + 2; 
                },
                stackable: true
            },
            thunderbolt: {
                name: "Thunderbolt",
                description: "A cada 4s, invoca 2 raios aleatórios",
                rarity: "uncommon",
                effect: (player) => { 
                    player.thunderbolt = (player.thunderbolt || 0) + 2; 
                },
                stackable: true
            },
            
            // Upgrades Épicos (Raros - 5% chance)
            barrier: {
                name: "Barrier",
                description: "Gera escudo que absorve 1 hit a cada 6s",
                rarity: "epic",
                effect: (player) => { player.barrier = true; },
                stackable: false
            },
            immortal: {
                name: "Immortal",
                description: "+1 Vida extra (única por partida)",
                rarity: "epic",
                effect: (player) => { player.lives = (player.lives || 1) + 1; },
                stackable: false
            },
            willOWisp: {
                name: "Will-O-Wisp",
                description: "Spawn wisp orbitante que ataca",
                rarity: "epic",
                effect: (player) => { 
                    player.wisps = (player.wisps || 0) + 1; 
                },
                stackable: true
            },
            overheat: {
                name: "Overheat",
                description: "Corpo causa dano de contato",
                rarity: "epic",
                effect: (player) => { player.overheat = true; },
                stackable: false
            },
            growthMax: {
                name: "Growth++",
                description: "HP máximo +40",
                rarity: "epic",
                effect: (player) => { 
                    player.maxHp += 40; 
                    player.hp += 40; 
                },
                stackable: true
            }
        };
    }
    
    generateUpgradeOptions(playerLevel) {
        const options = [];
        const numOptions = 3;
        
        for (let i = 0; i < numOptions; i++) {
            const upgrade = this.selectRandomUpgrade(playerLevel);
            if (upgrade && !options.includes(upgrade)) {
                options.push(upgrade);
            }
        }
        
        // Garantir que temos 3 opções únicas
        while (options.length < numOptions) {
            const upgrade = this.selectRandomUpgrade(playerLevel, true); // forceCommon
            if (upgrade && !options.includes(upgrade)) {
                options.push(upgrade);
            }
        }
        
        return options;
    }
    
    selectRandomUpgrade(playerLevel, forceCommon = false) {
        const random = Math.random();
        let targetRarity;
        
        if (forceCommon) {
            targetRarity = 'common';
        } else {
            // Distribuição de raridade
            if (random < 0.70) {
                targetRarity = 'common';
            } else if (random < 0.95) {
                targetRarity = 'uncommon';
            } else {
                targetRarity = 'epic';
            }
        }
        
        // Filtrar upgrades pela raridade
        const upgradeKeys = Object.keys(this.availableUpgrades);
        const filteredUpgrades = upgradeKeys.filter(key => 
            this.availableUpgrades[key].rarity === targetRarity
        );
        
        if (filteredUpgrades.length === 0) {
            return null;
        }
        
        const randomKey = filteredUpgrades[Math.floor(Math.random() * filteredUpgrades.length)];
        return this.availableUpgrades[randomKey];
    }
    
    showUpgradeMenu(player) {
        this.currentUpgradeOptions = this.generateUpgradeOptions(player.level);
        this.isUpgradeMenuOpen = true;
        this.emit('upgradeMenuOpened', this.currentUpgradeOptions);
    }
    
    selectUpgrade(index, player) {
        if (index >= 0 && index < this.currentUpgradeOptions.length) {
            const selectedUpgrade = this.currentUpgradeOptions[index];
            
            // Aplicar efeito do upgrade
            selectedUpgrade.effect(player);
            
            // Fechar menu
            this.isUpgradeMenuOpen = false;
            this.currentUpgradeOptions = [];
            
            this.emit('upgradeSelected', selectedUpgrade);
            this.emit('upgradeMenuClosed');
            
            return selectedUpgrade;
        }
        
        return null;
    }
    
    closeUpgradeMenu() {
        this.isUpgradeMenuOpen = false;
        this.currentUpgradeOptions = [];
        this.emit('upgradeMenuClosed');
    }
    
    getRarityColor(rarity) {
        switch (rarity) {
            case 'common': return '#ffffff';
            case 'uncommon': return '#66ccff';
            case 'epic': return '#cc66ff';
            default: return '#ffffff';
        }
    }
    
    getRarityName(rarity) {
        switch (rarity) {
            case 'common': return 'Comum';
            case 'uncommon': return 'Incomum';
            case 'epic': return 'Épico';
            default: return 'Comum';
        }
    }
}

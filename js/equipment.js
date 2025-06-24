// equipment.js - Sistema de equipamentos (Chapéus e Cajados)

// Enum para tipos de equipamentos
const EquipmentType = {
    HAT: 'hat',
    STAFF: 'staff'
};

// Enum para raridades dos equipamentos
const EquipmentRarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    LEGENDARY: 'legendary'
};

// Definições dos Chapéus
const HAT_DEFINITIONS = {
    wizardHat: {
        id: 'wizardHat',
        name: 'Chapéu de Mago',
        description: 'Clássico pontudo, efeito básico balanceado',
        image: 'img/chapeus/1_ChapeudeMago.png',
        type: EquipmentType.HAT,
        rarity: EquipmentRarity.COMMON,
        cost: 50,
        unlocked: true, // Disponível desde o início
        effects: {
            damage: 5,
            expMultiplier: 1.1
        },
        apply: (player) => {
            player.expMultiplier = (player.expMultiplier || 1) * 1.1;
            player.damage += 5;
        }
    },
    
    helmet: {
        id: 'helmet',
        name: 'Capacete de Batalha',
        description: '+Defesa e HP, -Velocidade de movimento',
        image: 'img/chapeus/2_Capacete.png',
        type: EquipmentType.HAT,
        rarity: EquipmentRarity.COMMON,
        cost: 75,
        unlocked: false,
        unlockCondition: 'Take 1000 damage in a single run',
        effects: {
            defense: 15,
            maxHp: 25
        },
        apply: (player) => {
            player.defense += 15;
            player.maxHp += 25;
            player.speed *= 0.9; // -10% velocidade
        }
    },
    
    propellerBeanie: {
        id: 'propellerBeanie',
        name: 'Gorro Hélice',
        description: 'Melhora velocidade de movimento e ataque',
        image: 'img/chapeus/3_GorroHelice.png',
        type: EquipmentType.HAT,
        rarity: EquipmentRarity.UNCOMMON,
        cost: 150,
        unlocked: false,
        unlockCondition: 'Jump 500 times in a single run',
        effects: {
            attackSpeed: 0.5,
            critChance: 0.05
        },
        apply: (player) => {
            player.attackSpeed += 0.5;
            player.critChance += 0.05;
            player.speed *= 1.2; // +20% velocidade
        }
    },
    
    uncommonHat: {
        id: 'uncommonHat',
        name: 'Chapéu da Sorte',
        description: 'Aumenta chance de crítico e drop de soul orbs',
        image: 'img/chapeus/4._ChapeuIncomum.png',
        type: EquipmentType.HAT,
        rarity: EquipmentRarity.RARE,
        cost: 300,
        unlocked: false,
        unlockCondition: 'Get 50 uncommon cards',
        effects: {
            critChance: 0.1,
            critMultiplier: 0.5
        },
        apply: (player) => {
            player.critChance += 0.1;
            player.critMultiplier += 0.5;
        }
    },
    
    challengerHat: {
        id: 'challengerHat',
        name: 'Chapéu do Desafiante',
        description: '20% chance de double loot, dobra inimigos',
        image: 'img/chapeus/5_ChapeudoDesafiante.png',
        type: EquipmentType.HAT,
        rarity: EquipmentRarity.LEGENDARY,
        cost: 500,
        unlocked: false,
        unlockCondition: 'Reach level 50',
        effects: {
            doubleLootChance: 0.2,
            doubleEnemies: true
        },
        apply: (player) => {
            player.abilities = player.abilities || {};
            player.abilities.doubleLootChance = 0.2;
            player.abilities.doubleEnemySpawn = true;
        }
    },
    
    fedora: {
        id: 'fedora',
        name: 'Fedora',
        description: 'Reroll gratuito infinito, desabilita ranking online',
        image: 'img/chapeus/6_Fedora.png',
        type: EquipmentType.HAT,
        rarity: EquipmentRarity.LEGENDARY,
        cost: 750,
        unlocked: false,
        unlockCondition: 'Reroll cards 100 times',
        effects: {
            infiniteRerolls: true,
            disableRanking: true
        },
        apply: (player) => {
            player.abilities = player.abilities || {};
            player.abilities.infiniteRerolls = true;
            player.abilities.rankingDisabled = true;
        }
    }
};

// Definições dos Cajados
const STAFF_DEFINITIONS = {
    wizardStaff: {
        id: 'wizardStaff',
        name: 'Cajado do Mago',
        description: 'Projétil único em linha reta (padrão)',
        image: 'img/cajados/1_CajadodoMago.png',
        type: EquipmentType.STAFF,
        rarity: EquipmentRarity.COMMON,
        cost: 0, // Grátis - item inicial
        unlocked: true,
        shootingPattern: 'single',
        effects: {
            // Padrão - sem modificadores
        },
        apply: (player) => {
            player.shootingPattern = 'single';
        }
    },
    
    emeraldStaff: {
        id: 'emeraldStaff',
        name: 'Cajado de Esmeralda',
        description: 'Projéteis teleguiados, +velocidade de ataque, -50% dano',
        image: 'img/cajados/2_CajadodeEsmeralda.png',
        type: EquipmentType.STAFF,
        rarity: EquipmentRarity.UNCOMMON,
        cost: 100,
        unlocked: false,
        unlockCondition: 'Kill 1000 enemies',
        shootingPattern: 'homing',
        effects: {
            homingProjectiles: true,
            attackSpeedBonus: 0.5,
            damagePenalty: -0.5
        },
        apply: (player) => {
            player.shootingPattern = 'homing';
            player.attackSpeed *= 1.5;
            player.damage *= 0.5;
            player.abilities = player.abilities || {};
            player.abilities.homingProjectiles = true;
        }
    },
    
    trident: {
        id: 'trident',
        name: 'Tridente',
        description: 'Disparo triplo em leque',
        image: 'img/cajados/3_Tridente.png',
        type: EquipmentType.STAFF,
        rarity: EquipmentRarity.UNCOMMON,
        cost: 120,
        unlocked: false,
        unlockCondition: 'Fire 10000 projectiles',
        shootingPattern: 'triple',
        effects: {
            projectileCount: 3,
            spreadAngle: 30
        },
        apply: (player) => {
            player.shootingPattern = 'triple';
            player.projectileCount = 3;
            player.spreadAngle = 30; // graus
        }
    },
    
    boomstaff: {
        id: 'boomstaff',
        name: 'Boomstaff',
        description: 'Projéteis explosivos com área de dano',
        image: 'img/cajados/4_Boomstaff.png',
        type: EquipmentType.STAFF,
        rarity: EquipmentRarity.RARE,
        cost: 200,
        unlocked: false,
        unlockCondition: 'Deal 50000 damage in a single run',
        shootingPattern: 'explosive',
        effects: {
            explosiveProjectiles: true,
            explosionRadius: 50,
            explosionDamage: 0.7 // 70% do dano base
        },
        apply: (player) => {
            player.shootingPattern = 'explosive';
            player.abilities = player.abilities || {};
            player.abilities.explosiveProjectiles = true;
            player.abilities.explosionRadius = 50;
            player.abilities.explosionDamage = player.damage * 0.7;
        }
    },
    
    thunderStaff: {
        id: 'thunderStaff',
        name: 'Cajado do Trovão',
        description: 'Invoca raios do céu em área aleatória',
        image: 'img/cajados/5_CajadodoTrovao.png',
        type: EquipmentType.STAFF,
        rarity: EquipmentRarity.RARE,
        cost: 250,
        unlocked: false,
        unlockCondition: 'Get Thunderbolt card 10 times',
        shootingPattern: 'lightning',
        effects: {
            lightningStrikes: true,
            lightningInterval: 2000,
            lightningCount: 3
        },
        apply: (player) => {
            player.shootingPattern = 'lightning';
            player.abilities = player.abilities || {};
            player.abilities.lightningStrikes = true;
            player.abilities.lightningInterval = 2000;
            player.abilities.lightningCount = 3;
            player.lastLightning = 0;
        }
    },
    
    frozenTip: {
        id: 'frozenTip',
        name: 'Ponta Congelada',
        description: 'Projéteis perfuram múltiplos inimigos',
        image: 'img/cajados/6_PontaCongelada.png',
        type: EquipmentType.STAFF,
        rarity: EquipmentRarity.RARE,
        cost: 180,
        unlocked: false,
        unlockCondition: 'Kill 3 enemies with one projectile',
        shootingPattern: 'piercing',
        effects: {
            piercingProjectiles: true,
            maxPierces: 5
        },
        apply: (player) => {
            player.shootingPattern = 'piercing';
            player.abilities = player.abilities || {};
            player.abilities.piercingProjectiles = true;
            player.abilities.maxPierces = 5;
        }
    },
    
    rainbowStaff: {
        id: 'rainbowStaff',
        name: 'Cajado Arco-Íris',
        description: 'Efeito aleatório a cada tiro',
        image: 'img/cajados/7_CajadoArco-Iris.png',
        type: EquipmentType.STAFF,
        rarity: EquipmentRarity.LEGENDARY,
        cost: 500,
        unlocked: false,
        unlockCondition: 'Use all other staffs at least once',
        shootingPattern: 'random',
        effects: {
            randomEffects: true
        },
        apply: (player) => {
            player.shootingPattern = 'random';
            player.abilities = player.abilities || {};
            player.abilities.randomEffects = true;
        }
    }
};

// Combinar todas as definições de equipamentos
const EQUIPMENT_DEFINITIONS = {
    ...HAT_DEFINITIONS,
    ...STAFF_DEFINITIONS
};

// Classe para gerenciar equipamentos do jogador
class EquipmentManager {
    constructor() {
        this.equippedHat = 'wizardHat';
        this.equippedStaff = 'wizardStaff';
        this.unlockedEquipment = ['wizardHat', 'wizardStaff'];
    }
    
    // Equipar item
    equip(equipmentId) {
        const equipment = EQUIPMENT_DEFINITIONS[equipmentId];
        if (!equipment || !this.isUnlocked(equipmentId)) {
            return false;
        }
        
        if (equipment.type === EquipmentType.HAT) {
            this.equippedHat = equipmentId;
        } else if (equipment.type === EquipmentType.STAFF) {
            this.equippedStaff = equipmentId;
        }
        
        return true;
    }
    
    // Verificar se equipamento está desbloqueado
    isUnlocked(equipmentId) {
        return this.unlockedEquipment.includes(equipmentId);
    }
    
    // Desbloquear equipamento
    unlock(equipmentId) {
        if (!this.unlockedEquipment.includes(equipmentId)) {
            this.unlockedEquipment.push(equipmentId);
            return true;
        }
        return false;
    }
    
    // Obter equipamento atual
    getEquippedHat() {
        return EQUIPMENT_DEFINITIONS[this.equippedHat];
    }
    
    getEquippedStaff() {
        return EQUIPMENT_DEFINITIONS[this.equippedStaff];
    }
    
    // Aplicar efeitos dos equipamentos ao jogador
    applyEquipmentEffects(player) {
        const hat = this.getEquippedHat();
        const staff = this.getEquippedStaff();
        
        if (hat && hat.apply) {
            hat.apply(player);
        }
        
        if (staff && staff.apply) {
            staff.apply(player);
        }
        
        // Verificar sinergias especiais
        this.checkSynergies(player, hat, staff);
    }
    
    // Verificar sinergias entre chapéu e cajado
    checkSynergies(player, hat, staff) {
        // Exemplo: Chapéu de Mago + Cajado do Trovão = Raios mais frequentes
        if (hat.id === 'wizardHat' && staff.id === 'thunderStaff') {
            player.abilities = player.abilities || {};
            player.abilities.lightningInterval *= 0.7; // 30% mais rápido
        }
        
        // Capacete + Boomstaff = Explosões absorvem parte do dano
        if (hat.id === 'helmet' && staff.id === 'boomstaff') {
            player.abilities = player.abilities || {};
            player.abilities.explosionHealing = true;
        }
        
        // Gorro Hélice + Cajado de Esmeralda = Projéteis perseguem mais agressivamente
        if (hat.id === 'propellerBeanie' && staff.id === 'emeraldStaff') {
            player.abilities = player.abilities || {};
            player.abilities.aggressiveHoming = true;
        }
    }
    
    // Salvar estado
    save() {
        return {
            equippedHat: this.equippedHat,
            equippedStaff: this.equippedStaff,
            unlockedEquipment: [...this.unlockedEquipment]
        };
    }
    
    // Carregar estado
    load(data) {
        if (data) {
            this.equippedHat = data.equippedHat || 'wizardHat';
            this.equippedStaff = data.equippedStaff || 'wizardStaff';
            this.unlockedEquipment = data.unlockedEquipment || ['wizardHat', 'wizardStaff'];
        }
    }
    
    // Métodos para integração com a loja
    getAllEquipment() {
        return {
            hats: HAT_DEFINITIONS,
            staffs: STAFF_DEFINITIONS
        };
    }
    
    getEquipment(type, itemId) {
        if (type === 'hats') {
            return HAT_DEFINITIONS[itemId];
        } else if (type === 'staffs') {
            return STAFF_DEFINITIONS[itemId];
        }
        return null;
    }
    
    applyEquipmentEffects(player, type, itemId) {
        const equipment = this.getEquipment(type, itemId);
        if (!equipment || !equipment.effects) return;
        
        console.log(`Aplicando efeitos de ${equipment.name}:`, equipment.effects);
        
        // Aplicar cada efeito
        Object.entries(equipment.effects).forEach(([effect, value]) => {
            switch(effect) {
                case 'damage':
                    player.damage += value;
                    break;
                case 'defense':
                    player.defense += value;
                    break;
                case 'speed':
                    player.speed += value;
                    break;
                case 'critChance':
                    player.critChance += value / 100; // converter porcentagem
                    break;
                case 'hp':
                case 'maxHp':
                    player.maxHp += value;
                    if (player.hp < player.maxHp) {
                        player.hp = Math.min(player.hp + value, player.maxHp);
                    }
                    break;
                case 'xpBonus':
                case 'expMultiplier':
                    player.expMultiplier = (player.expMultiplier || 1) * (1 + value / 100);
                    break;
                case 'specialCooldown':
                    // Reduzir cooldown de habilidades especiais
                    if (player.abilities) {
                        Object.keys(player.abilities).forEach(ability => {
                            if (ability.includes('Cooldown') || ability.includes('cooldown')) {
                                player.abilities[ability] *= (1 - value / 100);
                            }
                        });
                    }
                    break;
                case 'fireRate':
                case 'attackSpeed':
                    player.attackSpeed *= (1 + value / 100);
                    break;
            }
        });
    }
    
    unapplyEquipmentEffects(player, type, itemId) {
        const equipment = this.getEquipment(type, itemId);
        if (!equipment || !equipment.effects) return;
        
        console.log(`Removendo efeitos de ${equipment.name}:`, equipment.effects);
        
        // Remover cada efeito (operação inversa)
        Object.entries(equipment.effects).forEach(([effect, value]) => {
            switch(effect) {
                case 'damage':
                    player.damage -= value;
                    break;
                case 'defense':
                    player.defense -= value;
                    break;
                case 'speed':
                    player.speed -= value;
                    break;
                case 'critChance':
                    player.critChance -= value / 100;
                    break;
                case 'maxHp':
                    player.maxHp -= value;
                    if (player.hp > player.maxHp) {
                        player.hp = player.maxHp;
                    }
                    break;
                case 'xpBonus':
                case 'expMultiplier':
                    player.expMultiplier = (player.expMultiplier || 1) / (1 + value / 100);
                    break;
                case 'fireRate':
                case 'attackSpeed':
                    player.attackSpeed /= (1 + value / 100);
                    break;
            }
        });
    }
}

// Função para verificar condições de desbloqueio
function checkUnlockConditions(player, stats) {
    const unlocked = [];
    
    Object.values(EQUIPMENT_DEFINITIONS).forEach(equipment => {
        if (equipment.unlocked || equipment.unlockCondition === undefined) {
            return; // Já desbloqueado ou sem condição
        }
        
        let shouldUnlock = false;
        
        // Verificar diferentes tipos de condições
        const condition = equipment.unlockCondition.toLowerCase();
        
        if (condition.includes('damage') && condition.includes('1000')) {
            shouldUnlock = stats.totalDamageTaken >= 1000;
        } else if (condition.includes('jump') && condition.includes('500')) {
            shouldUnlock = stats.totalJumps >= 500;
        } else if (condition.includes('level') && condition.includes('50')) {
            shouldUnlock = player.level >= 50;
        } else if (condition.includes('enemies') && condition.includes('1000')) {
            shouldUnlock = stats.totalKills >= 1000;
        } else if (condition.includes('projectiles') && condition.includes('10000')) {
            shouldUnlock = stats.totalProjectilesFired >= 10000;
        } else if (condition.includes('damage') && condition.includes('50000')) {
            shouldUnlock = stats.totalDamageDealt >= 50000;
        }
        
        if (shouldUnlock) {
            unlocked.push(equipment.id);
        }
    });
    
    return unlocked;
}

// Export das funcionalidades principais
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EQUIPMENT_DEFINITIONS,
        HAT_DEFINITIONS,
        STAFF_DEFINITIONS,
        EquipmentType,
        EquipmentRarity,
        EquipmentManager,
        checkUnlockConditions
    };
}

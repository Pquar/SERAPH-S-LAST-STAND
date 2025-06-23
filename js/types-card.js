// types-card.js - Sistema completo de cartas com imagens e habilidades
// Integra o sistema de equipamentos (chapéus e cajados) com cartas de upgrade

// Enum para raridades das cartas
const CardRarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon', 
    EPIC: 'epic',
    ASCENSION: 'ascension'
};

// Enum para efeitos especiais
const CardEffectType = {
    INSTANT: 'instant',        // Efeito imediato (ex: cura)
    PASSIVE: 'passive',        // Efeito passivo permanente
    ON_HIT: 'onHit',          // Efeito quando acerta inimigo
    ON_KILL: 'onKill',        // Efeito quando mata inimigo
    ON_DAMAGE: 'onDamage',    // Efeito quando toma dano
    TIMED: 'timed'            // Efeito com tempo/intervalo
};

// Definições completas das cartas com imagens e efeitos
const CARD_DEFINITIONS = {
    // ===== CARTAS COMUNS (70% chance) =====
    catalyst: {
        id: 'catalyst',
        name: 'Catalyst',
        description: 'Dano de Projétil +2',
        image: 'img/Catalyst.jpeg',
        rarity: CardRarity.COMMON,
        stackable: true,
        maxStacks: 20,
        effectType: CardEffectType.PASSIVE,
        effects: {
            damage: 2
        },
        apply: (player, stacks = 1) => {
            player.damage += 2 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.catalyst = (player.cardStacks.catalyst || 0) + stacks;
        }
    },
    
    eyesight: {
        id: 'eyesight',
        name: 'Eyesight',
        description: 'Chance crítica +5%',
        image: 'img/Eyesight.jpeg',
        rarity: CardRarity.COMMON,
        stackable: true,
        maxStacks: 15,
        effectType: CardEffectType.PASSIVE,
        effects: {
            critChance: 0.05
        },
        apply: (player, stacks = 1) => {
            player.critChance = (player.critChance || 0) + 0.05 * stacks;
            player.critChance = Math.min(player.critChance, 0.95); // Cap em 95%
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.eyesight = (player.cardStacks.eyesight || 0) + stacks;
        }
    },
    
    growth: {
        id: 'growth',
        name: 'Growth',
        description: 'HP máximo +10',
        image: 'img/Growth.jpeg',
        rarity: CardRarity.COMMON,
        stackable: true,
        maxStacks: 30,
        effectType: CardEffectType.INSTANT,
        effects: {
            maxHp: 10
        },
        apply: (player, stacks = 1) => {
            const hpIncrease = 10 * stacks;
            player.maxHp += hpIncrease;
            player.hp += hpIncrease; // Também cura ao pegar
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.growth = (player.cardStacks.growth || 0) + stacks;
        }
    },
    
    impulse: {
        id: 'impulse',
        name: 'Impulse',
        description: 'Altura do Salto +30%',
        image: 'img/Impulse.jpeg',
        rarity: CardRarity.COMMON,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.PASSIVE,
        effects: {
            jumpSpeedMultiplier: 0.3
        },
        apply: (player, stacks = 1) => {
            player.jumpSpeed = (player.jumpSpeed || player.baseJumpSpeed) * (1 + 0.3 * stacks);
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.impulse = (player.cardStacks.impulse || 0) + stacks;
        }
    },
    
    renew: {
        id: 'renew',
        name: 'Renew',
        description: 'Cura completa instantânea',
        image: 'img/Renew.jpeg',
        rarity: CardRarity.COMMON,
        stackable: false,
        effectType: CardEffectType.INSTANT,
        effects: {
            instantHeal: true
        },
        apply: (player) => {
            player.hp = player.maxHp;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.renew = (player.cardStacks.renew || 0) + 1;
        }
    },
    
    resist: {
        id: 'resist',
        name: 'Resist',
        description: 'Redução de dano +4%',
        image: 'img/Resist.jpeg',
        rarity: CardRarity.COMMON,
        stackable: true,
        maxStacks: 20,
        effectType: CardEffectType.PASSIVE,
        effects: {
            defense: 4
        },
        apply: (player, stacks = 1) => {
            player.defense = (player.defense || 0) + 4 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.resist = (player.cardStacks.resist || 0) + stacks;
        }
    },
    
    resonance: {
        id: 'resonance',
        name: 'Resonance',
        description: 'Velocidade de Ataque +12%',
        image: 'img/Resonance.jpeg',
        rarity: CardRarity.COMMON,
        stackable: true,
        maxStacks: 15,
        effectType: CardEffectType.PASSIVE,
        effects: {
            attackSpeedMultiplier: 0.12
        },
        apply: (player, stacks = 1) => {
            player.attackSpeed = (player.attackSpeed || player.baseAttackSpeed) * (1 + 0.12 * stacks);
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.resonance = (player.cardStacks.resonance || 0) + stacks;
        }
    },
    
    souls: {
        id: 'souls',
        name: 'Souls',
        description: '+1% chance de drop de Soul Orb',
        image: 'img/Souls.jpeg',
        rarity: CardRarity.COMMON,
        stackable: true,
        maxStacks: 50,
        effectType: CardEffectType.PASSIVE,
        effects: {
            soulOrbChance: 0.01
        },
        apply: (player, stacks = 1) => {
            player.soulOrbChance = (player.soulOrbChance || 0.05) + 0.01 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.souls = (player.cardStacks.souls || 0) + stacks;
        }
    },
    
    stability: {
        id: 'stability',
        name: 'Stability',
        description: 'Projéteis atravessam +1 inimigo antes de sumir',
        image: 'img/Stability.jpeg',
        rarity: CardRarity.COMMON,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.PASSIVE,
        effects: {
            piercing: 1
        },
        apply: (player, stacks = 1) => {
            player.projectilePiercing = (player.projectilePiercing || 0) + 1 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.stability = (player.cardStacks.stability || 0) + stacks;
        }
    },
    
    swift: {
        id: 'swift',
        name: 'Swift',
        description: 'Velocidade de Movimento +20%',
        image: 'img/Swift.jpeg',
        rarity: CardRarity.COMMON,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.PASSIVE,
        effects: {
            speedMultiplier: 0.2
        },
        apply: (player, stacks = 1) => {
            player.speed = (player.speed || player.baseSpeed) * (1 + 0.2 * stacks);
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.swift = (player.cardStacks.swift || 0) + stacks;
        }
    },

    // ===== CARTAS INCOMUNS (25% chance) =====
    charge: {
        id: 'charge',
        name: 'Charge',
        description: 'Tamanho do Projétil +20%',
        image: 'img/Charge.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.PASSIVE,
        effects: {
            projectileSize: 0.2
        },
        apply: (player, stacks = 1) => {
            player.projectileSize = (player.projectileSize || 1) * (1 + 0.2 * stacks);
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.charge = (player.cardStacks.charge || 0) + stacks;
        }
    },
    
    clock: {
        id: 'clock',
        name: 'Clock',
        description: '+10% duração de invulnerabilidade pós-dano',
        image: 'img/Clock.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 15,
        effectType: CardEffectType.PASSIVE,
        effects: {
            invulnerabilityDuration: 0.1
        },
        apply: (player, stacks = 1) => {
            player.invulnerabilityDuration = (player.invulnerabilityDuration || 0.5) * (1 + 0.1 * stacks);
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.clock = (player.cardStacks.clock || 0) + stacks;
        }
    },
    
    fragmentation: {
        id: 'fragmentation',
        name: 'Fragmentation',
        description: 'Inimigos mortos liberam 2 projéteis fracos aleatórios',
        image: 'img/Fragmentation.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.ON_KILL,
        effects: {
            fragmentationProjectiles: 2
        },
        apply: (player, stacks = 1) => {
            player.onKillEffects = player.onKillEffects || [];
            player.onKillEffects.push({
                type: 'fragmentation',
                projectiles: 2 * stacks,
                damage: player.damage * 0.3
            });
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.fragmentation = (player.cardStacks.fragmentation || 0) + stacks;
        }
    },
    
    friction: {
        id: 'friction',
        name: 'Friction',
        description: 'A cada metro corrido, dispara 1 projétil explosivo para cima',
        image: 'img/Friction.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            frictionProjectiles: 1
        },
        apply: (player, stacks = 1) => {
            player.frictionEffect = {
                enabled: true,
                projectilesPerMeter: 1 * stacks,
                damage: player.damage * 0.8
            };
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.friction = (player.cardStacks.friction || 0) + stacks;
        }
    },
    
    growthPlus: {
        id: 'growthPlus',
        name: 'Growth+',
        description: 'HP máximo +20',
        image: 'img/Growth+.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 20,
        effectType: CardEffectType.INSTANT,
        effects: {
            maxHp: 20
        },
        apply: (player, stacks = 1) => {
            const hpIncrease = 20 * stacks;
            player.maxHp += hpIncrease;
            player.hp += hpIncrease;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.growthPlus = (player.cardStacks.growthPlus || 0) + stacks;
        }
    },
    
    leech: {
        id: 'leech',
        name: 'Leech',
        description: '3% de lifesteal em todo dano causado',
        image: 'img/Leech.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 15,
        effectType: CardEffectType.ON_HIT,
        effects: {
            lifesteal: 0.03
        },
        apply: (player, stacks = 1) => {
            player.lifesteal = (player.lifesteal || 0) + 0.03 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.leech = (player.cardStacks.leech || 0) + stacks;
        }
    },
    
    luck: {
        id: 'luck',
        name: 'Luck',
        description: 'Aumenta chance de cartas Incomuns+',
        image: 'img/Luck.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.PASSIVE,
        effects: {
            rarityBonus: 0.05
        },
        apply: (player, stacks = 1) => {
            player.rarityBonus = (player.rarityBonus || 0) + 0.05 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.luck = (player.cardStacks.luck || 0) + stacks;
        }
    },
    
    orb: {
        id: 'orb',
        name: 'Orb',
        description: '5% chance de inimigos droparem orbe de cura pequena',
        image: 'img/Orb.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.PASSIVE,
        effects: {
            healOrbChance: 0.05
        },
        apply: (player, stacks = 1) => {
            player.healOrbChance = (player.healOrbChance || 0) + 0.05 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.orb = (player.cardStacks.orb || 0) + stacks;
        }
    },
    
    precision: {
        id: 'precision',
        name: 'Precision',
        description: 'Dano crítico causa +50% dano extra',
        image: 'img/Precission.jpeg', // Note: nome do arquivo tem typo
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            critMultiplier: 0.5
        },
        apply: (player, stacks = 1) => {
            player.critMultiplier = (player.critMultiplier || 1.5) + 0.5 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.precision = (player.cardStacks.precision || 0) + stacks;
        }
    },
    
    regrowth: {
        id: 'regrowth',
        name: 'Regrowth',
        description: 'Regenera HP baseado no número de inimigos vivos nearby',
        image: 'img/Regrowth .jpeg', // Note: espaço no nome do arquivo
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.TIMED,
        effects: {
            regeneration: 0.5
        },
        apply: (player, stacks = 1) => {
            player.regenerationRate = (player.regenerationRate || 0) + 0.5 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.regrowth = (player.cardStacks.regrowth || 0) + stacks;
        }
    },
    
    resonancePlus: {
        id: 'resonancePlus',
        name: 'Resonance+',
        description: 'Velocidade de Ataque +24%',
        image: 'img/Resonance+.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.PASSIVE,
        effects: {
            attackSpeedMultiplier: 0.24
        },
        apply: (player, stacks = 1) => {
            player.attackSpeed = (player.attackSpeed || player.baseAttackSpeed) * (1 + 0.24 * stacks);
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.resonancePlus = (player.cardStacks.resonancePlus || 0) + stacks;
        }
    },
    
    shrink: {
        id: 'shrink',
        name: 'Shrink',
        description: 'Reduz hitbox do jogador em 10%',
        image: 'img/Shrink.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            hitboxReduction: 0.1
        },
        apply: (player, stacks = 1) => {
            player.hitboxScale = (player.hitboxScale || 1) * (1 - 0.1 * stacks);
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.shrink = (player.cardStacks.shrink || 0) + stacks;
        }
    },
    
    swiftPlus: {
        id: 'swiftPlus',
        name: 'Swift+',
        description: 'Velocidade de Movimento +40%',
        image: 'img/Swift+.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 8,
        effectType: CardEffectType.PASSIVE,
        effects: {
            speedMultiplier: 0.4
        },
        apply: (player, stacks = 1) => {
            player.speed = (player.speed || player.baseSpeed) * (1 + 0.4 * stacks);
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.swiftPlus = (player.cardStacks.swiftPlus || 0) + stacks;
        }
    },
    
    thunderbolt: {
        id: 'thunderbolt',
        name: 'Thunderbolt',
        description: 'A cada 3s, invoca 2 raios em posições aleatórias',
        image: 'img/Thunderbolt.jpeg',
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.TIMED,
        effects: {
            lightningInterval: 3000,
            lightningCount: 2
        },
        apply: (player, stacks = 1) => {
            player.lightningEffect = {
                enabled: true,
                interval: 3000,
                count: 2 * stacks,
                damage: player.damage * 2,
                lastCast: 0
            };
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.thunderbolt = (player.cardStacks.thunderbolt || 0) + stacks;
        }
    },

    // ===== CARTAS ÉPICAS (4.5% chance) =====
    appraisal: {
        id: 'appraisal',
        name: 'Appraisal',
        description: '+1 opção em todas as seleções de carta futuras',
        image: 'img/Appraisal.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            extraCardOptions: 1
        },
        apply: (player, stacks = 1) => {
            player.extraCardOptions = (player.extraCardOptions || 0) + 1 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.appraisal = (player.cardStacks.appraisal || 0) + stacks;
        }
    },
    
    barrier: {
        id: 'barrier',
        name: 'Barrier',
        description: 'Gera escudo que absorve 1 hit a cada 5s',
        image: 'img/Barrier.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.TIMED,
        effects: {
            shieldInterval: 5000,
            shieldStrength: 1
        },
        apply: (player, stacks = 1) => {
            player.barrierEffect = {
                enabled: true,
                interval: 5000,
                strength: 1 * stacks,
                currentShield: 0,
                lastGenerated: 0
            };
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.barrier = (player.cardStacks.barrier || 0) + stacks;
        }
    },
    
    cold: {
        id: 'cold',
        name: 'Cold',
        description: 'Inimigos ficam -1% velocidade por hit recebido (max -80%)',
        image: 'img/Cold.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.ON_HIT,
        effects: {
            slowEffect: 0.01,
            maxSlow: 0.8
        },
        apply: (player, stacks = 1) => {
            player.onHitEffects = player.onHitEffects || [];
            player.onHitEffects.push({
                type: 'slow',
                slowAmount: 0.01 * stacks,
                maxSlow: 0.8
            });
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.cold = (player.cardStacks.cold || 0) + stacks;
        }
    },
    
    focus: {
        id: 'focus',
        name: 'Focus',
        description: '+2% velocidade de ataque por segundo parado (reset por onda)',
        image: 'img/Focus.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.PASSIVE,
        effects: {
            focusBonus: 0.02
        },
        apply: (player, stacks = 1) => {
            player.focusEffect = {
                enabled: true,
                bonusPerSecond: 0.02 * stacks,
                currentBonus: 0,
                stationaryTime: 0
            };
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.focus = (player.cardStacks.focus || 0) + stacks;
        }
    },
    
    immortal: {
        id: 'immortal',
        name: 'Immortal',
        description: '+1 Vida extra (mata todos inimigos ao reviver) [carta única]',
        image: 'img/Immortal.jpeg',
        rarity: CardRarity.EPIC,
        stackable: false,
        unique: true,
        effectType: CardEffectType.ON_DAMAGE,
        effects: {
            extraLife: 1
        },
        apply: (player) => {
            player.extraLives = (player.extraLives || 0) + 1;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.immortal = 1;
        }
    },
    
    overheat: {
        id: 'overheat',
        name: 'Overheat',
        description: 'Corpo causa 40 de dano de contato por segundo',
        image: 'img/Overheat.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            contactDamage: 40
        },
        apply: (player, stacks = 1) => {
            player.contactDamage = (player.contactDamage || 0) + 40 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.overheat = (player.cardStacks.overheat || 0) + stacks;
        }
    },
    
    tome: {
        id: 'tome',
        name: 'Tome',
        description: 'Cartas Comuns futuras são 35% mais eficazes',
        image: 'img/Tome.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            commonCardBonus: 0.35
        },
        apply: (player, stacks = 1) => {
            player.commonCardBonus = (player.commonCardBonus || 1) * (1 + 0.35 * stacks);
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.tome = (player.cardStacks.tome || 0) + stacks;
        }
    },
    
    willOWisp: {
        id: 'willOWisp',
        name: 'Will-O-Wisp',
        description: 'Spawn wisp que orbita e ataca (50% do seu dano e velocidade)',
        image: 'img/Will-O-Wisp.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 4,
        effectType: CardEffectType.PASSIVE,
        effects: {
            wisp: true
        },
        apply: (player, stacks = 1) => {
            player.wisps = (player.wisps || 0) + 1 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.willOWisp = (player.cardStacks.willOWisp || 0) + stacks;
        }
    },
    
    wound: {
        id: 'wound',
        name: 'Wound',
        description: 'Todo dano aplica sangramento (DPS overtime)',
        image: 'img/Wound.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.ON_HIT,
        effects: {
            bleeding: true
        },
        apply: (player, stacks = 1) => {
            player.onHitEffects = player.onHitEffects || [];
            player.onHitEffects.push({
                type: 'bleeding',
                dps: player.damage * 0.2 * stacks,
                duration: 5000
            });
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.wound = (player.cardStacks.wound || 0) + stacks;
        }
    },
    
    // Novas cartas Incomuns adicionadas
    gush: {
        id: 'gush',
        name: 'Gush',
        description: '+1 Salto adicional (multi-jump)',
        image: 'img/Gush.jpeg', // Placeholder - criar esta imagem
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            extraJumps: 1
        },
        apply: (player, stacks = 1) => {
            player.maxJumps = (player.maxJumps || 1) + 1 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.gush = (player.cardStacks.gush || 0) + stacks;
        }
    },
    
    rage: {
        id: 'rage',
        name: 'Rage',
        description: '<50% HP: +1% dano para cada 1% de HP perdido (max 50%)',
        image: 'img/Rage.jpeg', // Placeholder - criar esta imagem
        rarity: CardRarity.UNCOMMON,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            rageDamageBonus: 0.01
        },
        apply: (player, stacks = 1) => {
            player.rageEffect = {
                enabled: true,
                damagePerHpLost: 0.01 * stacks,
                maxBonus: 0.5
            };
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.rage = (player.cardStacks.rage || 0) + stacks;
        }
    },
    
    // ===== CARTAS ÉPICAS (4.5% chance) =====
    appraisal: {
        id: 'appraisal',
        name: 'Appraisal',
        description: '+1 opção em todas as seleções de carta futuras',
        image: 'img/Appraisal.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            extraCardOptions: 1
        },
        apply: (player, stacks = 1) => {
            player.extraCardOptions = (player.extraCardOptions || 0) + 1 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.appraisal = (player.cardStacks.appraisal || 0) + stacks;
        }
    },
    
    barrier: {
        id: 'barrier',
        name: 'Barrier',
        description: 'Gera escudo que absorve 1 hit a cada 5s',
        image: 'img/Barrier.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.TIMED,
        effects: {
            shieldInterval: 5000,
            shieldStrength: 1
        },
        apply: (player, stacks = 1) => {
            player.barrierEffect = {
                enabled: true,
                interval: 5000,
                strength: 1 * stacks,
                currentShield: 0,
                lastGenerated: 0
            };
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.barrier = (player.cardStacks.barrier || 0) + stacks;
        }
    },
    
    cold: {
        id: 'cold',
        name: 'Cold',
        description: 'Inimigos ficam -1% velocidade por hit recebido (max -80%)',
        image: 'img/Cold.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.ON_HIT,
        effects: {
            slowEffect: 0.01,
            maxSlow: 0.8
        },
        apply: (player, stacks = 1) => {
            player.onHitEffects = player.onHitEffects || [];
            player.onHitEffects.push({
                type: 'slow',
                slowAmount: 0.01 * stacks,
                maxSlow: 0.8
            });
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.cold = (player.cardStacks.cold || 0) + stacks;
        }
    },
    
    focus: {
        id: 'focus',
        name: 'Focus',
        description: '+2% velocidade de ataque por segundo parado (reset por onda)',
        image: 'img/Focus.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.PASSIVE,
        effects: {
            focusBonus: 0.02
        },
        apply: (player, stacks = 1) => {
            player.focusEffect = {
                enabled: true,
                bonusPerSecond: 0.02 * stacks,
                currentBonus: 0,
                stationaryTime: 0
            };
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.focus = (player.cardStacks.focus || 0) + stacks;
        }
    },
    
    immortal: {
        id: 'immortal',
        name: 'Immortal',
        description: '+1 Vida extra (mata todos inimigos ao reviver) [carta única]',
        image: 'img/Immortal.jpeg',
        rarity: CardRarity.EPIC,
        stackable: false,
        unique: true,
        effectType: CardEffectType.ON_DAMAGE,
        effects: {
            extraLife: 1
        },
        apply: (player) => {
            player.extraLives = (player.extraLives || 0) + 1;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.immortal = 1;
        }
    },
    
    overheat: {
        id: 'overheat',
        name: 'Overheat',
        description: 'Corpo causa 40 de dano de contato por segundo',
        image: 'img/Overheat.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            contactDamage: 40
        },
        apply: (player, stacks = 1) => {
            player.contactDamage = (player.contactDamage || 0) + 40 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.overheat = (player.cardStacks.overheat || 0) + stacks;
        }
    },
    
    tome: {
        id: 'tome',
        name: 'Tome',
        description: 'Cartas Comuns futuras são 35% mais eficazes',
        image: 'img/Tome.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.PASSIVE,
        effects: {
            commonCardBonus: 0.35
        },
        apply: (player, stacks = 1) => {
            player.commonCardBonus = (player.commonCardBonus || 1) * (1 + 0.35 * stacks);
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.tome = (player.cardStacks.tome || 0) + stacks;
        }
    },
    
    willOWisp: {
        id: 'willOWisp',
        name: 'Will-O-Wisp',
        description: 'Spawn wisp que orbita e ataca (50% do seu dano e velocidade)',
        image: 'img/Will-O-Wisp.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 4,
        effectType: CardEffectType.PASSIVE,
        effects: {
            wisp: true
        },
        apply: (player, stacks = 1) => {
            player.wisps = (player.wisps || 0) + 1 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.willOWisp = (player.cardStacks.willOWisp || 0) + stacks;
        }
    },
    
    wound: {
        id: 'wound',
        name: 'Wound',
        description: 'Todo dano aplica sangramento (DPS overtime)',
        image: 'img/Wound.jpeg',
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.ON_HIT,
        effects: {
            bleeding: true
        },
        apply: (player, stacks = 1) => {
            player.onHitEffects = player.onHitEffects || [];
            player.onHitEffects.push({
                type: 'bleeding',
                dps: player.damage * 0.2 * stacks,
                duration: 5000
            });
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.wound = (player.cardStacks.wound || 0) + stacks;
        }
    },
    
    growthPlusPlus: {
        id: 'growthPlusPlus',
        name: 'Growth++',
        description: 'HP máximo +40',
        image: 'img/Growth++.jpeg', // Placeholder - criar esta imagem
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 15,
        effectType: CardEffectType.INSTANT,
        effects: {
            maxHp: 40
        },
        apply: (player, stacks = 1) => {
            const hpIncrease = 40 * stacks;
            player.maxHp += hpIncrease;
            player.hp += hpIncrease;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.growthPlusPlus = (player.cardStacks.growthPlusPlus || 0) + stacks;
        }
    },
    
    leechPlus: {
        id: 'leechPlus',
        name: 'Leech+',
        description: '9% lifesteal em todo dano',
        image: 'img/Leech+.jpeg', // Placeholder - criar esta imagem
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 10,
        effectType: CardEffectType.ON_HIT,
        effects: {
            lifesteal: 0.09
        },
        apply: (player, stacks = 1) => {
            player.lifesteal = (player.lifesteal || 0) + 0.09 * stacks;
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.leechPlus = (player.cardStacks.leechPlus || 0) + stacks;
        }
    },
    
    thunderboltPlus: {
        id: 'thunderboltPlus',
        name: 'Thunderbolt+',
        description: 'A cada 2s, invoca 6 raios em posições aleatórias',
        image: 'img/Thunderbolt+.jpeg', // Placeholder - criar esta imagem
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.TIMED,
        effects: {
            lightningInterval: 2000,
            lightningCount: 6
        },
        apply: (player, stacks = 1) => {
            player.lightningEffect = {
                enabled: true,
                interval: 2000,
                count: 6 * stacks,
                damage: player.damage * 2.5,
                lastCast: 0
            };
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.thunderboltPlus = (player.cardStacks.thunderboltPlus || 0) + stacks;
        }
    },
    
    fragmentationPlus: {
        id: 'fragmentationPlus',
        name: 'Fragmentation+',
        description: 'Inimigos mortos liberam 6 projéteis fracos',
        image: 'img/Fragmentation+.jpeg', // Placeholder - criar esta imagem
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 5,
        effectType: CardEffectType.ON_KILL,
        effects: {
            fragmentationProjectiles: 6
        },
        apply: (player, stacks = 1) => {
            player.onKillEffects = player.onKillEffects || [];
            player.onKillEffects.push({
                type: 'fragmentation',
                projectiles: 6 * stacks,
                damage: player.damage * 0.4
            });
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.fragmentationPlus = (player.cardStacks.fragmentationPlus || 0) + stacks;
        }
    },
    
    frictionPlus: {
        id: 'frictionPlus',
        name: 'Friction+',
        description: 'A cada metro corrido, dispara 3 projéteis explosivos para cima',
        image: 'img/Friction+.jpeg', // Placeholder - criar esta imagem
        rarity: CardRarity.EPIC,
        stackable: true,
        maxStacks: 3,
        effectType: CardEffectType.PASSIVE,
        effects: {
            frictionProjectiles: 3
        },
        apply: (player, stacks = 1) => {
            player.frictionEffect = {
                enabled: true,
                projectilesPerMeter: 3 * stacks,
                damage: player.damage * 1.2
            };
            player.cardStacks = player.cardStacks || {};
            player.cardStacks.frictionPlus = (player.cardStacks.frictionPlus || 0) + stacks;
        }
    },
};

// Função para construir pools de cartas por raridade
function buildCardPools() {
    const pools = {
        [CardRarity.COMMON]: [],
        [CardRarity.UNCOMMON]: [],
        [CardRarity.EPIC]: [],
        [CardRarity.ASCENSION]: []
    };
    
    Object.values(CARD_DEFINITIONS).forEach(card => {
        pools[card.rarity].push(card);
    });
    
    return pools;
}

// Função para obter cartas aleatórias baseado nas probabilidades
function getRandomCards(count = 3, extraOptions = 0) {
    const totalOptions = count + extraOptions;
    const cards = [];
    
    for (let i = 0; i < totalOptions; i++) {
        const rand = Math.random();
        let rarity;
        
        if (rand < 0.70) {
            rarity = CardRarity.COMMON;
        } else if (rand < 0.95) {
            rarity = CardRarity.UNCOMMON;
        } else {
            rarity = CardRarity.EPIC;
        }
        
        const pool = buildCardPools()[rarity];
        const randomCard = pool[Math.floor(Math.random() * pool.length)];
        
        // Evitar cartas duplicadas na mesma seleção
        if (!cards.find(c => c.id === randomCard.id)) {
            cards.push(randomCard);
        } else {
            i--; // Tentar novamente
        }
    }
    
    return cards;
}

// Função para aplicar efeito de uma carta ao jogador
function applyCard(player, cardId, stacks = 1) {
    const card = CARD_DEFINITIONS[cardId];
    if (!card) {
        console.warn(`Card ${cardId} not found`);
        return false;
    }
    
    // Verificar se é única e já foi aplicada
    if (card.unique && player.appliedCards && player.appliedCards.includes(cardId)) {
        return false;
    }
    
    // Verificar stacks máximos
    if (card.stackable && card.maxStacks) {
        const currentStacks = (player.cardStacks && player.cardStacks[cardId]) || 0;
        if (currentStacks >= card.maxStacks) {
            return false;
        }
        stacks = Math.min(stacks, card.maxStacks - currentStacks);
    }
    
    // Aplicar efeito
    card.apply(player, stacks);
    
    // Registrar aplicação
    if (!player.appliedCards) player.appliedCards = [];
    if (!player.cardStacks) player.cardStacks = {};
    
    if (!player.appliedCards.includes(cardId)) {
        player.appliedCards.push(cardId);
    }
    
    if (card.stackable) {
        player.cardStacks[cardId] = (player.cardStacks[cardId] || 0) + stacks;
    }
    
    return true;
}

// Função para obter informações de uma carta
function getCardInfo(cardId) {
    return CARD_DEFINITIONS[cardId] || null;
}

// Export das funcionalidades principais
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CARD_DEFINITIONS,
        CardRarity,
        buildCardPools,
        getRandomCards,
        applyCard,
        getCardInfo
    };
}

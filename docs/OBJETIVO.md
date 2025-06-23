# SERAPH'S LAST STAND
## Jogo de Tiro Incremental Roguelike Web

 This game plays as a sidescroller platformer that happens on a single screen, so no need to programm a camera. You control a character that can walk around usind A and D, and can jump using spacebar. You can shoot projectiles by aiming with your mouse and clicking (if you hold the click, you shoot automatically, respecting the cooldown time between shots). The topology of the ground is like image 1, with blocks creating steps. Flying enemies keep spawning from the top of the scene, and they stop moving when they reach 70% the height of the screen, where they instead start following your character (with a smooth delay) and shooting towards him. If you character gets shot, he loses HP, but stays invincible for about half a second (to prevent multiple shots). Enemies keep spawning non stop, and they get stronger and more numerous as the game goes. Killing enemies give your character EXP, which levels him up eventually. Create an HP bar and an EXP bar for the character on the top left of the screen. Each levels becomes a little harder to get. When your character levels up, he's presented with 3 upgrade choices, which can be any one from this list

### OBJETIVO:
Criar um jogo de tiro incremental baseado no clássico da era Flash "Heli Attack" com elementos roguelike modernos. Um jogo web HTML5 otimizado para desktop e dispositivos móveis.

### CONCEITO PRINCIPAL:
- **Plataforma**: HTML5 Canvas com JavaScript vanilla
- **Compatibilidade**: Desktop (mouse/teclado) e Mobile (touch/gyroscópio)
- **Estilo Visual**: Pixel art inspirado nos clássicos Flash games
- **Progressão**: Sistema roguelike com upgrades permanentes

## JOGABILIDADE CORE

### Controles:
**Desktop:**
- WASD ou Arrow Keys para movimento
- Mouse para mira (opcional - auto-aim disponível)
- Spacebar ou clique para habilidades especiais

**Mobile:**
- Joystick virtual para movimento
- Auto-aim inteligente
- Botões touch para habilidades
- Suporte a gestos (swipe para dash)

### Mecânicas Principais:
1. **Movimento livre em 2D** - O jogador controla um personagem que pode se mover em todas as direções
2. **Tiro automático** - Dispara continuamente no inimigo mais próximo ou na direção do movimento
3. **Sistema de ondas** - Ondas progressivamente mais difíceis de inimigos
4. **Coleta de orbes** - Orbes da alma dropados pelos inimigos mortos
5. **Timer de dificuldade** - A dificuldade aumenta gradualmente com o tempo, spawning mais inimigos e tipos mais fortes

## INTERFACE E MENUS

### Menu Principal:
- **JOGAR** - Inicia uma nova partida
- **CONTINUAR** - Retoma partida salva (localStorage)
- **LOJA** - Comprar upgrades permanentes com Soul Orbs
- **PLACAR** - Rankings locais (localStorage) e globais (opcional)
- **CONFIGURAÇÕES** - Controles, áudio, gráficos
- **COMO JOGAR** - Tutorial interativo

### Interface In-Game:
- **HP Bar** - Barra de vida do jogador
- **Soul Orbs Counter** - Contador de orbes coletados
- **Wave Counter** - Onda atual e progresso
- **Timer** - Tempo de partida atual
- **Mini-mapa** - Posição de inimigos próximos (opcional)

### Sistema de Pausa:
- **Menu de pausa** completo durante o jogo
- **Salvamento automático** a cada onda completada
- **Estatísticas da partida** em tempo real

### Responsividade Mobile:
- **Interface adaptativa** que se ajusta ao tamanho da tela
- **Botões touch otimizados** com feedback visual
- **HUD reorganizado** para dispositivos móveis
- **Suporte a orientação** portrait e landscape


## SISTEMA DE EQUIPAMENTOS

### Chapéus (Modificam gameplay):
- **Chapéu de Mago** – Clássico pontudo, efeito básico balanceado
- **Capacete** – +Armadura, -Velocidade de movimento
- **Gorro Hélice** – Salto duplo automático, altura fixa
- **Chapéu Incomum** – Força cartas apenas de raridade Incomum+
- **Chapéu do Desafiante** – 20% chance de double loot, dobra inimigos
- **Fedora** – Reroll gratuito infinito, desabilita ranking online

### Cajados (Definem padrão de tiro):
- **Cajado do Mago** – Projétil único em linha reta (padrão)
- **Cajado de Esmeralda** – Projéteis teleguiados, +velocidade de ataque, -50% dano
- **Tridente** – Disparo triplo em leque
- **Boomstaff** – Projéteis explosivos com área de dano
- **Cajado do Trovão** – Invoca raios do céu em área aleatória
- **Ponta Congelada** – Projéteis perfuram múltiplos inimigos
- **Cajado Arco-Íris** – Efeito aleatório a cada tiro

### Sistema de Desbloqueio:
- **Equipamentos iniciais** disponíveis no tutorial
- **Novos equipamentos** desbloqueados por conquistas
- **Combinações especiais** entre chapéu e cajado criam sinergias únicas

## SISTEMA DE CARTAS ROGUELIKE

### Raridades e Probabilidades:
- **Comum (Branco)**: 70% chance - Melhorias básicas essenciais
- **Incomum (Azul)**: 25% chance - Melhorias significativas com mecânicas especiais  
- **Épico (Roxo)**: 4.5% chance - Modificadores de gameplay poderosos
- **Ascensão (Dourado)**: 0.5% chance - Transformações extremas que redefinem o build

### Cartas Comuns (Base para builds):
- **Catalyst** — Dano de Projétil +2
- **Eyesight** — Chance crítica +5%
- **Growth** — HP máximo +10
- **Impulse** — Altura do Salto +30%
- **Renew** — Cura completa instantânea
- **Resist** — Redução de dano +4%
- **Resonance** — Velocidade de Ataque +12%
- **Souls** — +1% chance de drop de Soul Orb
- **Stability** — Projéteis atravessam +1 inimigo antes de sumir
- **Swift** — Velocidade de Movimento +20%

### Cartas Incomuns (Mecânicas especiais):
- **Catalyst+** — Dano de Projétil +4
- **Charge** — Tamanho do Projétil +20%
- **Clock** — +10% duração de invulnerabilidade pós-dano
- **Fragmentation** — Inimigos mortos liberam 2 projéteis fracos aleatórios
- **Friction** — A cada metro corrido, dispara 1 projétil explosivo para cima
- **Growth+** — HP máximo +20
- **Gush** — +1 Salto adicional (multi-jump)
- **Leech** — 3% de lifesteal em todo dano causado
- **Luck** — Aumenta chance de cartas Incomuns+
- **Orb** — 5% chance de inimigos droparem orbe de cura pequena
- **Precision** — Dano crítico causa +50% dano extra
- **Rage** — <50% HP: +1% dano para cada 1% de HP perdido (max 50%)
- **Regrowth** — Regenera HP baseado no número de inimigos vivos nearby
- **Resonance+** — Velocidade de Ataque +24%
- **Shrink** — Reduz hitbox do jogador em 10%
- **Swift+** — Velocidade de Movimento +40%
- **Thunderbolt** — A cada 3s, invoca 2 raios em posições aleatórias

### Cartas Épicas (Game changers):
- **Appraisal** — +1 opção em todas as seleções de carta futuras
- **Barrier** — Gera escudo que absorve 1 hit a cada 5s
- **Cold** — Inimigos ficam -1% velocidade por hit recebido (max -80%)
- **Fragmentation+** — Inimigos mortos liberam 6 projéteis fracos
- **Friction+** — A cada metro corrido, dispara 3 projéteis explosivos para cima
- **Focus** — +2% velocidade de ataque por segundo parado (reset por onda)
- **Growth++** — HP máximo +40
- **Immortal** — +1 Vida extra (mata todos inimigos ao reviver) [carta única]
- **Leech+** — 9% lifesteal em todo dano
- **Overheat** — Corpo causa 40 de dano de contato por segundo
- **Thunderbolt+** — A cada 2s, invoca 6 raios em posições aleatórias
- **Tome** — Cartas Comuns futuras são 35% mais eficazes
- **Will-O-Wisp** — Spawn wisp que orbita e ataca (50% do seu dano e velocidade)
- **Wound** — Todo dano aplica sangramento (DPS overtime)

### Cartas de Ascensão (Ultra raras - Builds extremos):
> **Requisito**: Mínimo de stacks específicos de outras cartas para desbloquear

- **Absorbent** [4x Clock] — Projéteis inimigos em invulnerabilidade curam +1 HP
- **Anti-Aircraft** [10x Friction] — Área de explosão 2x maior, dano escala com proximidade
- **Avenger** [5x Rage] — Ao morrer: mata 50% inimigos, cura 50% HP, cooldown 5 ondas
- **Blessed** [5x Luck] — +5% chance de encontrar cartas Épicas
- **Bloody Mage** [3x Wound] — Sangramento 2x mais rápido (0.5s intervals)
- **Buildozer** [8x Swift] — Empurrar inimigos com corpo é mais fácil
- **Bunker** [3x Focus] — +4 armadura/s parado (max 95% redução), reset por onda
- **Burning Man** [3x Overheat] — Dano corporal em área a cada 2s
- **Colossus** [15x Growth] — HP e tamanho do jogador dobrados
- **Comet** [5x Impulse] — Aterrissagem causa dano baseado na altura da queda
- **Dealer** [4x Appraisal] — Rerolls infinitos gratuitos
- **Desperate** [5x Renew] — HP completo no início de cada onda
- **Enchanter** [4x Will-O-Wisp] — Wisps se concentram na ponta do cajado
- **Exorcist** [6x Souls] — Soul orbs coletados disparam raio da alma
- **Freezing** [3x Cold] — Pode reduzir velocidade inimiga até 100%, 1% chance de insta-kill
- **Flying Sorcerer** [5x Gush] — Pulos infinitos
- **Gnome** [5x Shrink] — 33% chance de projéteis inimigos errarem
- **God of Thunder** [10x Thunderbolt] — Raios causam 3x dano (inclui Cajado do Trovão)
- **Hoarder** [5x Orb] — Orbes de cura dão carga extra no próximo ataque
- **Marksman** [6x Vision] — Primeiro hit sempre crítico
- **Nerd** [4x Tome] — Carta comum grátis a cada onda
- **Pac-Man** [5x Stability] — Projéteis ganham dano ao atravessar inimigos
- **Plague Spreader** [5x Regrowth] — Remove 1% HP de todos inimigos/s
- **Protector** [3x Barrier] — Escudo quebrado dispara projéteis em volta
- **RAM Destroyer** [10x Fragmentation] — Projéteis de fragmentação duram mais
- **Sadist** [6x Resistance] — Reflete dano no atacante
- **Speculator** [5x Precision] — Pode causar super-críticos
- **Streamer** [8x Resonance] — Dispara laser contínuo baseado na velocidade de ataque
- **Tryhard** [20x Catalyst] — Não faz nada especial, apenas muito dano
- **Vampire** [12x Lifesteal] — 50% de todo dano retorna como HP
- **White Dwarf** [5x Charge] — Projétil normal, mas cria buraco negro ao atingir paredes (3s duração, 1s cooldown)

## ARQUITETURA TÉCNICA WEB

### Tecnologias Base:
- **HTML5 Canvas** para renderização de gráficos
- **JavaScript ES6+** para lógica do jogo
- **Web Audio API** para efeitos sonoros e música
- **LocalStorage** para persistência de dados
- **Service Workers** para cache offline
- **CSS3** para UI responsiva

### Otimizações Mobile:
- **Touch Events** com fallback para mouse
- **RequestAnimationFrame** para smooth gameplay
- **Object Pooling** para performance
- **Sprite Batching** para reduzir draw calls
- **Audio Context** com user gesture requirement
- **Viewport meta tag** para scale adequada

### Estrutura de Arquivos Sugerida:
```
index.html
├── css/
│   ├── main.css
│   └── mobile.css
├── js/
│   ├── game.js (core game loop)
│   ├── player.js
│   ├── enemies.js  
│   ├── cards.js
│   ├── ui.js
│   ├── audio.js
│   └── utils.js
├── assets/
│   ├── sprites/
│   ├── sounds/
│   └── fonts/
└── manifest.json (PWA support)
```

### Performance Targets:
- **60 FPS** em dispositivos modernos
- **30 FPS mínimo** em dispositivos mais antigos
- **<3 segundos** tempo de carregamento inicial
- **<100MB** tamanho total dos assets
- **Compatibilidade** com navegadores dos últimos 3 anos

---

*Última atualização: Junho 2025*
*Versão do documento: 2.0*



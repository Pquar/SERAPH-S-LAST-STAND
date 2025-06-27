# SERAPH'S LAST STAND
## Jogo de Tiro Incremental Roguelike Web

## DESCRIÇÃO DO JOGO
Este jogo é um plataforma sidescroller que acontece em uma única tela, portanto não é necessário programar uma câmera. Você controla um personagem que pode andar usando as teclas A e D, e pode pular usando a barra de espaço. É possível atirar projéteis mirando com o mouse e clicando (se você segurar o clique, o personagem dispara automaticamente, respeitando o tempo de recarga entre os tiros). O terreno possui uma topologia semelhante à imagem 1, com blocos formando degraus. Inimigos voadores aparecem continuamente no topo da cena e param de se mover ao atingir 70% da altura da tela, passando então a seguir o seu personagem (com um leve atraso suave) e atirando em sua direção. Se o seu personagem for atingido, ele perde HP, mas fica invencível por cerca de meio segundo (para evitar múltiplos danos consecutivos). Os inimigos continuam surgindo sem parar, ficando mais fortes e numerosos conforme o jogo avança. Ao derrotar inimigos, seu personagem ganha EXP, que eventualmente faz com que ele suba de nível. Crie uma barra de HP e uma barra de EXP para o personagem no canto superior esquerdo da tela. Cada nível exige mais EXP para ser alcançado. Quando seu personagem sobe de nível, ele recebe 3 opções de upgrade, que podem ser escolhidas dentre a lista abaixo.

### OBJETIVO:
Criar um jogo de plataforma sidescroller incremental inspirado no clássico "Heli Attack" com elementos de upgrade roguelike modernos. Um jogo web HTML5 que acontece em uma única tela, otimizado para desktop e dispositivos móveis.

### CONCEITO PRINCIPAL:
- **Plataforma**: HTML5 Canvas com JavaScript vanilla
- **Estilo**: Sidescroller de plataforma em tela única (sem câmera)
- **Compatibilidade**: Desktop (teclado/mouse) e Mobile (touch)
- **Estilo Visual**: Pixel art inspirado nos clássicos Flash games
- **Progressão**: Sistema de níveis com upgrades por level-up

## JOGABILIDADE CORE

### Controles:
**Desktop:**
- A/D para andar (movimento horizontal apenas)
- Spacebar para pular (física de plataforma)
- Mouse para mirar e atirar (clique para disparo único, segurar para automático)

**Mobile:**
- Botões virtuais A/D para movimento horizontal
- Botão virtual de pulo (Spacebar)
- Tap/hold na tela para mirar e atirar
- Interface touch otimizada

### Mecânicas Principais:
1. **Plataforma Sidescroller** - Movimento horizontal (A/D) e pulo (Spacebar) com física de gravidade
2. **Terreno com Degraus** - Plataformas fixas formando degraus para navegação vertical
3. **Mira Manual** - Mouse controla direção dos projéteis, clique para atirar
4. **Inimigos Voadores** - Aparecem no topo, descem até 70% da tela, então seguem o jogador
5. **Sistema de Experiência** - EXP obtida por kills, níveis concedem 3 opções de upgrade
6. **Progressão Contínua** - Inimigos surgem constantemente, ficando mais fortes com o tempo

## TERRENO E PLATAFORMAS

### Design do Terreno:
- **Tela Única** - Todo o jogo acontece em uma única tela, sem necessidade de câmera
- **Degraus em Blocos** - Plataformas formam degraus para navegação vertical
- **Física de Plataforma** - Gravidade e colisão sólida com as plataformas
- **Layout Fixo** - Terreno estático que oferece vantagens táticas posicionais

### Navegação:
- **Movimento Horizontal** - Teclas A/D para andar sobre as plataformas
- **Salto Vertical** - Spacebar para pular entre níveis de degraus
- **Posicionamento Estratégico** - Altura oferece vantagem contra inimigos voadores

## INTERFACE E MENUS

### Menu Principal:
- **JOGAR** - Inicia uma nova partida
- **CONTINUAR** - Retoma partida salva (localStorage)
- **LOJA** - Comprar upgrades permanentes com Soul Orbs
- **PLACAR** - Rankings locais (localStorage) e globais (opcional)
    - **PONTUAÇÃO** - Melhores recordes de nível/tempo/kills
- **CONFIGURAÇÕES** - Controles, áudio, gráficos
- **COMO JOGAR** - Tutorial das mecânicas básicas

### Interface In-Game:
- **HP Bar** - Barra de vida no canto superior esquerdo
- **EXP Bar** - Barra de experiência no canto superior esquerdo (abaixo do HP)
- **Level Counter** - Nível atual do jogador
- **Score/Kills** - Contador de inimigos derrotados
- **Upgrade Menu** - Modal com 3 opções ao subir de nível

### Sistema de Pausa:
- **Menu de pausa** completo durante o jogo
- **Salvamento automático** periódico baseado em tempo
- **Estatísticas da partida** em tempo real (kills, tempo, nível)

### Responsividade Mobile:
- **Interface adaptativa** que se ajusta ao tamanho da tela
- **Controles virtuais** (botões A/D, pulo, área de mira/tiro)
- **HUD otimizado** com barras de HP/EXP visíveis
- **Suporte a orientação** landscape para melhor experiência
- **Feedback tátil** para ações importantes (level up, dano, etc.)


## SISTEMA DE UPGRADES

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

### Sistema de Experiência:
- **EXP por Kill** - Cada inimigo derrotado concede experiência
- **Progressão de Nível** - Cada nível exige mais EXP que o anterior
- **3 Opções por Nível** - Ao subir de nível, escolha entre 3 upgrades aleatórios
- **Invulnerabilidade Temporária** - 0.5s de invencibilidade após tomar dano

### Tipos de Upgrades Disponíveis:

## SISTEMA DE INIMIGOS

### Comportamento dos Inimigos Voadores:
1. **Spawn Contínuo** - Inimigos aparecem constantemente no topo da tela
2. **Descida Automática** - Descem verticalmente até atingir 70% da altura da tela
3. **Seguimento do Jogador** - Após atingir 70%, seguem o jogador com atraso suave
4. **Ataque Automático** - Atiram projéteis na direção do jogador
5. **Progressão de Dificuldade** - Ficam mais fortes e numerosos com o tempo

### Características dos Inimigos:
- **Tipos Variados** - Diferentes inimigos com HP, velocidade e padrões de ataque únicos
- **Escalabilidade** - Atributos aumentam gradualmente durante a partida
- **Padrões de Movimento** - Movimentação previsível mas desafiadora
- **Drop de EXP** - Todos os inimigos concedem experiência ao serem derrotados

### Tipos de Upgrades Disponíveis:

#### Upgrades Básicos (Comuns - 70% chance):
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

#### Upgrades Especiais (Incomuns - 25% chance):
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

### Cartas Épicas (Raras - 5% chance):
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

### Cartas de Ascensão
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

### Estrutura de Arquivos:
```
index.html
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



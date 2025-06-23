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


## SISTEMA DE UPGRADES POR NÍVEL

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
- **Growth** — HP máximo +10
- **Swift** — Velocidade de Movimento +15%
- **Resonance** — Velocidade de Ataque +10%
- **Impulse** — Altura do Salto +25%
- **Resist** — Redução de dano +3%
- **Precision** — Chance crítica +5%
- **Renew** — Cura completa instantânea

#### Upgrades Especiais (Incomuns - 25% chance):
- **Catalyst+** — Dano de Projétil +4
- **Growth+** — HP máximo +20
- **Swift+** — Velocidade de Movimento +30%
- **Gush** — +1 Salto adicional (multi-jump)
- **Leech** — 5% lifesteal em todo dano causado
- **Charge** — Tamanho do Projétil +25%
- **Fragmentation** — Inimigos mortos liberam 2 projéteis em direções aleatórias
- **Thunderbolt** — A cada 4s, invoca 2 raios em posições aleatórias

#### Upgrades Épicos (Raros - 5% chance):
- **Barrier** — Gera escudo que absorve 1 hit a cada 6s
- **Immortal** — +1 Vida extra (única por partida)
- **Will-O-Wisp** — Spawn wisp orbitante que ataca automaticamente
- **Overheat** — Corpo causa dano de contato aos inimigos
- **Growth++** — HP máximo +40

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
│   ├── game.js (core game loop e estados)
│   ├── player.js (movimento, pulo, tiro, física)
│   ├── enemies.js (spawn, IA, comportamento)
│   ├── upgrades.js (sistema de níveis e upgrades)
│   ├── terrain.js (plataformas e colisões)
│   ├── ui.js (HUD, menus, interface)
│   ├── audio.js (efeitos sonoros)
│   └── utils.js (utilitários gerais)
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



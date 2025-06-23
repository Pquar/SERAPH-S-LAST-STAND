# OBJETIVO:

CRIE UM jogo de tiro incremental baseado no clássico da era Flash "Heli Attack" com elementos roguelike. Derrote ondas de inimigos e escolha uma melhoria entre várias opções. Domine o jogo de todas as maneiras possíveis e concorra a um lugar no placar. A cada rodada, você fica mais forte, mas os inimigos também.

# JOGABILIDADE

O jogador controla um personagem que pode se mover e atira automaticamente. O objetivo é derrotar ondas de inimigos e coletar orbes da alma para comprar melhorias.

tem um timer que aumenta a dificuldade ao longo do tempo e invoca a próxima onda de inimigos.

# MENU

## BOTAO DE JOGAR
## PLACAS
ARMAZENAR NO LOCALSTORAGE

## COMPRAR MELHORIAS
Melhorias são melhorias de atributos que podem ser compradas com orbes da alma no menu.


# EQUIPAMENTOS:

## CHAPEUS
Chapéu de Mago – Um chapéu pontudo e bacana.
Capacete – Mais armadura. Menos velocidade de movimento.
Gorro Hélice – Tem salto duplo. Não é possível controlar a altura do salto.
Chapéu Incomum – Receba apenas cartas incomuns.
Chapéu do Desafiante – 20% de chance de obter o dobro de itens. Inimigos em dobro.
Fedora – Pode rolar novamente gratuitamente. Não entra no ranking.

## Cajados

Cajado do Mago – Atira um projétil em linha reta.
Cajado de Esmeralda – Atira projéteis teleguiados e tem maior velocidade de ataque, mas causa metade do dano.
Tridente – Atira 3 projéteis em um ângulo.
Boomstaff – Atira projéteis explosivos.
Cajado do Trovão – Invoca um raio de cima.
Ponta Congelada – Projéteis perfuram os inimigos.
Cajado Arco-Íris – Atira projéteis aleatórios.

# CARTAS

## Comum
Catalisador — Dano de Projétil +2
Visão — Chance crítica +5%
Crescimento — HP máx. +10
Impulso — Altura do Salto +30%
Renovar — Curar até o máximo de HP
Resistência — Defesa +4%
Ressonância — Velocidade de Ataque +12%
Almas — Chance de dropar orbe de alma 1%
Estabilidade — O projétil recebe +1 de acerto antes de explodir
Veloz — Velocidade de Movimento +20%
## Incomum
Catalisador+ — Dano de Projétil +4
Carga — Tamanho do Projétil +20%
Manto – Invulnerabilidade após receber dano +10% de duração
Fragmentação – Ao serem mortos, os inimigos liberam 2 projéteis mais fracos em direções aleatórias
Atrito – Para cada metro que você corre, 1 projétil explosivo é lançado para cima
Crescimento+ — HP máx. +20
Gush — Adiciona +1 Salto
Sanguessuga — Roubo de Vida de 3% de Dano
Sorte — Maior chance de rolar itens incomuns
Orbe — Inimigos mortos têm 5% de chance de derrubar um orbe de cura
Precisão — Crítico causa +50% de dano
Fúria — Se tiver menos de 50% de HP, aumenta o dano do projétil e do corpo de acordo (até 50%)
Recrescimento — Regenera HP% com base no número de inimigos vivos
Ressonância+ — Velocidade de Ataque +24%
Encolher — Torna você 10% menor
Swift+ — Velocidade de Movimento +40%
Thunderbolt — Chama 2 raios dos céus a cada poucos segundos
## Épico
Avaliação — +1 escolha de item a partir de agora
Barreira — Cria um escudo que bloqueia o dano uma vez a cada poucos segundos
Frio — Os inimigos ficam 1% mais lentos cada vez que recebem dano (até 80%)
Fragmentação+ – Ao serem mortos, os inimigos liberam 6 projéteis mais fracos em direções aleatórias
Friction+ – Para cada metro que você corre, 3 projéteis explosivos são lançados para cima
Foco — Ganha velocidade de ataque a cada segundo que você não se move. Reinicia a cada onda
Crescimento++ — HP máx. +40
Imortal — +1 Reviver (mata todos os inimigos ao reviver) - carta removida do jogo
Leech+ — Roubo de Vida de 9% de Dano
Superaquecimento — Seu corpo causa 40 de dano ao contato
Thunderbolt+ — Chama 6 raios dos céus a cada poucos segundos
Tome — Novos itens comuns (brancos) que você pega são 35% mais eficazes
Will-O-Wisp — Invoca um fogo-fátuo que herda metade do seu dano de ataque e velocidade
Ferimento — Causar dano aplica sangramento ao inimigo

### Ascensão
Absorvente — Cada projétil que te atinge quando invulnerável te cura em 1 PV. Receba 4 acúmulos de Camuflagem
Antiaéreo — Maior área de explosão de projéteis de fricção. Obtenha 10 acúmulos de Fricção.
Vingador — Se você for morrer, mate metade dos inimigos e cure metade dos seus pontos de vida. Tem um tempo de recarga de 5 ondas. Receba 5 acúmulos de Fúria.
Abençoado — 5% de chance de encontrar itens épicos. Ganhe 5 acúmulos de Sorte.
Mago Sangrento — Sangramento causa dano mais rápido. Obtenha 3 acúmulos de Ferimento.
Trator de esteira — Empurrar inimigos com o corpo ficou mais fácil. Ganhe 8 acúmulos de Veloz.
Bunker — Ganha +4 de armadura a cada segundo que você não se move, até 95. Reinicia a cada onda. Ganhe 3 acúmulos de Foco.
Burning Man — Causa dano corporal a cada 2 segundos em um círculo ao seu redor. Obtenha 3 acúmulos de Superaquecimento.
Colosso — Seus PV e tamanho são dobrados. Obtenha 15 acúmulos de Crescimento.
Cometa — Após cair de um salto, causa dano em área com base na distância da sua queda. Ganhe 5 acúmulos de Impulso.
Dealer — Você pode rolar novamente de graça. Ganhe 4 acúmulos de Avaliação.
Desesperado — Recupera todo o HP no início de cada onda. Escolha Renovar 5 vezes.
Encantador — Fogos-fátuos agora se concentram perto da ponta do seu cajado e atiram na direção que você mira. Ganhe 4 acúmulos de Fogo-fátuo.
Exorcista — Um raio de alma é liberado quando você pega um orbe de alma. Receba 6 acúmulos de Almas.
Congelante — Agora pode desacelerar inimigos em até 100%. Quando isso acontece, o dano de qualquer fonte tem 1% de chance de matar o inimigo instantaneamente. Receba 3 acúmulos de Frio.
Feiticeiro Voador — Você pode pular o quanto quiser. Ganhe 5 acúmulos de Gush.
Gnomo — Projéteis inimigos têm 33% de chance de errar. Obtenha 5 acúmulos de Encolher
Deus do Trovão — Seus raios causam 3x mais dano, incluindo o raio invocado pelo Cajado do Trovão. Obtenha 10 acúmulos de Raio do Trovão.
Acumulador — Os orbes de cura que você coleta concedem uma carga ao seu próximo ataque (pode acumular). Obtenha 5 acúmulos de Orbe.
Atirador — Seu primeiro acerto é sempre crítico. Obtenha 6 acúmulos de Visão.
Nerd — Receba uma carta comum aleatória a cada onda. Ganhe 4 pilhas de Tomo.
Pac-Man — Aumente o dano de um projétil inimigo sempre que seus projéteis passarem por ele. Ganhe 5 acúmulos de Estabilidade.
Espalhador de Pragas — Remove 1% de PV de todos os seus inimigos a cada 1 segundo. Obtenha 5 acúmulos de Recrescimento.
Protetor — Quando seu escudo quebrar, atire projéteis ao seu redor. Ganhe 3 acúmulos de Barreira.
Destruidor de RAM — Balas de fragmentação decaem menos. Obtenha 10 acúmulos de Fragmentação.
Sádico — Causa dano nas costas do agressor. Recebe 6 acúmulos de Resistência.
Especulador — Pode causar acertos supercríticos. Obtenha 5 acúmulos de Precisão.
Streamer — Dispara um raio do seu cajado que causa dano com base na velocidade de ataque. Obtenha 8 acúmulos de Ressonância.
Tryhard — Não faz absolutamente nada. Obtenha 20 acúmulos de Catalisador.
Vampiro — Metade de todo o seu dano retorna como PV. Obtenha 12 acúmulos de Drenagem.
Anão Branco — O tamanho do seu projétil retorna ao normal. Se um projétil atingir o chão ou as paredes, ele se torna um buraco negro. Obtenha 5 acúmulos de Carga.

Obrigatório	Ascensão	Efeito
4 Manto	Absorvente	Cada projétil que atinge você quando está invulnerável recupera 1 PV. Não funciona para dano corpo a corpo revivido de inimigos.
Antiaéreo	A área de explosão dos projéteis de fricção é dobrada. Projéteis explosivos causam mais dano aos inimigos quanto mais próximos eles estiverem do centro da explosão.
5 Sorte	Abençoado	Agora você tem +5% de chance de encontrar itens épicos em cada rolagem.
3 Ferida	Mago Sangrento	O efeito de sangramento agora ocorre a cada 0,5 segundos em vez de a cada 1 segundo.
3 Foco	Bunker	Ganha +4 de armadura a cada segundo que você não se move, até 95, o que significa 95% de redução de dano. Reinicia a cada onda.
Homem em Chamas	
15 Crescimento	Colosso	
Cometa	
3 Avaliação	Distribuidor	Você pode recarregar gratuitamente.
5 Renovar	Desesperado	Recupera o HP máximo no início de cada onda.
6 Almas	Exorcista	
Feiticeiro Voador	
3 Frio	Freezer	Agora pode desacelerar inimigos em até 100%. Quando isso acontece, todo dano de qualquer fonte tem 1% de chance de matar o inimigo instantaneamente.
5 Encolher	Gnomo	Cada projétil que atinge você tem 33% de chance de errar.
10 Raio	Deus do Trovão	Seus raios causam 3x mais dano, incluindo os raios invocados pelo Cajado do Trovão.
Acumulador	
Atirador	
4 Tomo	Nerd	Receba uma carta comum a cada onda.
Pac-Man	
5 Recrescimento	Espalhador de pragas	Remove 1% de HP de todos os inimigos a cada 1 segundo.
Protetor	
6 Resist	Sádico	
Especulador	
20 Catalisador	Tryhard	Não faz nada.
Destruidor de RAM	
12 Sanguessuga	Vampiro	
5 Carga	Anã Branca	O tamanho do seu projétil retorna ao normal. Se um projétil atingir o chão ou paredes, ele se transforma em um buraco negro, que dura 3 segundos e atrai todos os inimigos para si. Buracos negros têm um tempo de recarga de 1 segundo.



// ranking.js - Sistema de ranking e leaderboard

class RankingSystem extends EventEmitter {
    constructor() {
        super();
        
        this.storageKey = 'seraphsLastStand_ranking';
        this.maxRankingEntries = 10; // Top 10
        this.rankings = this.loadRankings();
    }
    
    // Carregar rankings do localStorage
    loadRankings() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Erro ao carregar rankings:', error);
            return [];
        }
    }
    
    // Salvar rankings no localStorage
    saveRankings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.rankings));
            this.emit('rankingsSaved');
        } catch (error) {
            console.error('Erro ao salvar rankings:', error);
        }
    }
    
    // Adicionar nova entrada no ranking
    addScore(stats) {
        const entry = {
            playerName: stats.playerName || 'Anonymous',
            score: stats.score || 0,
            level: stats.level || 1,
            enemiesKilled: stats.enemiesKilled || 0,
            survivalTime: stats.survivalTime || 0,
            accuracy: stats.accuracy || 0,
            criticalHits: stats.criticalHits || 0,
            totalDamageDealt: stats.totalDamageDealt || 0,
            soulOrbs: stats.soulOrbs || 0,
            build: stats.build || [], // Armazenar build (cartas escolhidas)
            timestamp: stats.timestamp || Date.now(),
            date: new Date(stats.timestamp || Date.now()).toLocaleDateString()
        };
        
        // Adicionar à lista
        this.rankings.push(entry);
        
        // Ordenar por pontuação (maior primeiro)
        this.rankings.sort((a, b) => b.score - a.score);
        
        // Manter apenas o top 10
        this.rankings = this.rankings.slice(0, this.maxRankingEntries);
        
        // Salvar
        this.saveRankings();
        
        // Verificar se entrou no ranking
        const position = this.rankings.findIndex(r => 
            r.timestamp === entry.timestamp && r.playerName === entry.playerName
        );
        
        if (position !== -1) {
            this.emit('newRecord', entry, position + 1);
            return position + 1;
        }
        
        return -1;
    }
    
    // Obter rankings
    getRankings() {
        return [...this.rankings]; // Retornar cópia
    }
    
    // Verificar se pontuação entraria no ranking
    wouldMakeRanking(score) {
        if (this.rankings.length < this.maxRankingEntries) {
            return true;
        }
        
        const lowestScore = this.rankings[this.rankings.length - 1].score;
        return score > lowestScore;
    }
    
    // Obter posição que uma pontuação teria
    getScorePosition(score) {
        let position = 1;
        for (let entry of this.rankings) {
            if (score > entry.score) {
                break;
            }
            position++;
        }
        return position;
    }
    
    // Limpar rankings
    clearRankings() {
        this.rankings = [];
        this.saveRankings();
        this.emit('rankingsCleared');
    }
    
    // Obter estatísticas gerais
    getOverallStats() {
        if (this.rankings.length === 0) {
            return {
                totalGames: 0,
                highestScore: 0,
                totalEnemiesKilled: 0,
                bestAccuracy: 0,
                longestSurvival: 0
            };
        }
        
        return {
            totalGames: this.rankings.length,
            highestScore: Math.max(...this.rankings.map(r => r.score)),
            totalEnemiesKilled: this.rankings.reduce((sum, r) => sum + r.enemiesKilled, 0),
            bestAccuracy: Math.max(...this.rankings.map(r => r.accuracy)),
            longestSurvival: Math.max(...this.rankings.map(r => r.survivalTime))
        };
    }
    
    // Formatar tempo de sobrevivência
    static formatSurvivalTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${remainingSeconds}s`;
    }
    
    // Formatar pontuação
    static formatScore(score) {
        if (score >= 1000000) {
            return `${(score / 1000000).toFixed(1)}M`;
        } else if (score >= 1000) {
            return `${(score / 1000).toFixed(1)}K`;
        }
        return score.toString();
    }
}

// Sistema de prompt para nome do jogador
class PlayerNamePrompt extends EventEmitter {
    constructor() {
        super();
        
        this.isOpen = false;
        this.playerName = this.loadPlayerName();
    }
     // Carregar nome salvo
    loadPlayerName() {
        try {
            const name = localStorage.getItem('seraphsLastStand_playerName') || '';
            console.log('Nome carregado do localStorage:', name); // Debug
            return name;
        } catch (error) {
            console.error('Erro ao carregar nome do jogador:', error);
            return '';
        }
    }

    // Salvar nome
    savePlayerName(name) {
        try {
            const trimmedName = name.trim() || 'Player';
            localStorage.setItem('seraphsLastStand_playerName', trimmedName);
            this.playerName = trimmedName;
            console.log('Nome salvo no localStorage:', trimmedName); // Debug
        } catch (error) {
            console.warn('Erro ao salvar nome do jogador:', error);
        }
    }
    
    // Mostrar prompt para nome
    showNamePrompt(callback) {
        if (this.playerName) {
            // Se já tem nome salvo, perguntar se quer manter
            const keepName = confirm(`Usar o nome "${this.playerName}"?\nClique Cancel para inserir um novo nome.`);
            if (keepName) {
                callback(this.playerName);
                return;
            }
        }
        
        // Mostrar prompt para novo nome
        const name = prompt('Digite seu nome para o ranking:', this.playerName || 'Player');
        
        if (name !== null) {
            const trimmedName = name.trim() || 'Player';
            this.savePlayerName(trimmedName);
            callback(trimmedName);
        } else {
            callback(this.playerName || 'Player');
        }
    }
    
    // Mostrar prompt de configurações
    showSettingsPrompt() {
        const newName = prompt('Digite seu nome:', this.playerName || 'Player');
        
        if (newName !== null) {
            const trimmedName = newName.trim() || 'Player';
            this.savePlayerName(trimmedName);
            this.emit('nameChanged', trimmedName);
            return trimmedName;
        }
        
        return this.playerName;
    }
    
    // Obter nome atual
    getCurrentName() {
        return this.playerName || 'Player';
    }
}

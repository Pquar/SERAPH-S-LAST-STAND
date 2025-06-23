// utils.js - Funções utilitárias para o jogo

// Utilitários matemáticos
const Math2D = {
    // Distância entre dois pontos
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    // Ângulo entre dois pontos
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    // Normalizar ângulo para 0-2π
    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },

    // Interpolar entre dois valores
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    // Clampar valor entre min e max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Número aleatório entre min e max
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Número aleatório inteiro
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// Utilitários de colisão
const Collision = {
    // Colisão círculo-círculo
    circleCircle(x1, y1, r1, x2, y2, r2) {
        const distance = Math2D.distance(x1, y1, x2, y2);
        return distance < r1 + r2;
    },

    // Colisão ponto-círculo
    pointCircle(px, py, cx, cy, r) {
        const distance = Math2D.distance(px, py, cx, cy);
        return distance < r;
    },

    // Colisão retângulo-retângulo
    rectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    },

    // Colisão círculo-retângulo
    circleRect(cx, cy, r, rx, ry, rw, rh) {
        const xDist = Math.abs(cx - (rx + rw / 2));
        const yDist = Math.abs(cy - (ry + rh / 2));

        if (xDist > (rw / 2 + r) || yDist > (rh / 2 + r)) {
            return false;
        }

        if (xDist <= (rw / 2) || yDist <= (rh / 2)) {
            return true;
        }

        const cornerDist = (xDist - rw / 2) ** 2 + (yDist - rh / 2) ** 2;
        return cornerDist <= r ** 2;
    }
};

// Utilitários de canvas
const CanvasUtils = {
    // Desenhar círculo
    drawCircle(ctx, x, y, radius, color, fill = true) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    },

    // Desenhar retângulo
    drawRect(ctx, x, y, width, height, color, fill = true) {
        if (fill) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        } else {
            ctx.strokeStyle = color;
            ctx.strokeRect(x, y, width, height);
        }
    },

    // Desenhar linha
    drawLine(ctx, x1, y1, x2, y2, color, width = 1) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    },

    // Desenhar texto
    drawText(ctx, text, x, y, color, font = '16px Arial', align = 'left') {
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
    },

    // Desenhar texto com contorno
    drawTextOutlined(ctx, text, x, y, fillColor, strokeColor, font = '16px Arial', strokeWidth = 2) {
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = fillColor;
        ctx.fillText(text, x, y);
    }
};

// Utilitários de tempo
const TimeUtils = {
    // Converter milissegundos para string de tempo
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Utilitários de localStorage
const Storage = {
    // Salvar dados
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Erro ao salvar dados:', e);
            return false;
        }
    },

    // Carregar dados
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.warn('Erro ao carregar dados:', e);
            return defaultValue;
        }
    },

    // Remover dados
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('Erro ao remover dados:', e);
            return false;
        }
    }
};

// Utilitários de dispositivo
const DeviceUtils = {
    // Verificar se é dispositivo móvel
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Verificar se é tablet
    isTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
    },

    // Verificar se suporte a touch
    hasTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Get viewport size
    getViewportSize() {
        return {
            width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        };
    }
};

// Pool de objetos para performance
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        
        // Pré-criar objetos
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }

    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }

    clear() {
        this.pool.length = 0;
    }
}

// Sistema de eventos simples
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(...args));
    }

    once(event, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

// Exportar utilitários globalmente
window.Math2D = Math2D;
window.Collision = Collision;
window.CanvasUtils = CanvasUtils;
window.TimeUtils = TimeUtils;
window.Storage = Storage;
window.DeviceUtils = DeviceUtils;
window.ObjectPool = ObjectPool;
window.EventEmitter = EventEmitter;

// ui.js - Sistema de interface do usuário

class UI extends EventEmitter {
    constructor() {
        super();
        
        this.elements = {
            gameHUD: document.getElementById('gameHUD'),
            hpFill: document.getElementById('hpFill'),
            hpText: document.getElementById('hpText'),
            waveText: document.getElementById('waveText'),
            timerText: document.getElementById('timerText'),
            soulOrbsText: document.getElementById('soulOrbsText'),
            
            // Menus
            mainMenu: document.getElementById('mainMenu'),
            pauseMenu: document.getElementById('pauseMenu'),
            
            // Mobile controls
            mobileControls: document.getElementById('mobileControls'),
            joystick: document.getElementById('movementJoystick'),
            joystickKnob: document.getElementById('joystickKnob')
        };
        
        this.setupMobileControls();
        this.setupAnimations();
    }
    
    setupMobileControls() {
        if (!DeviceUtils.hasTouch()) return;
        
        // Joystick virtual
        this.setupVirtualJoystick();
        
        // Botões de ação
        this.setupActionButtons();
    }
    
    setupVirtualJoystick() {
        const joystick = this.elements.joystick;
        const knob = this.elements.joystickKnob;
        
        let isDragging = false;
        let joystickRect;
        let centerX, centerY;
        const maxDistance = 50; // Raio máximo do joystick
        
        const updateJoystickRect = () => {
            joystickRect = joystick.getBoundingClientRect();
            centerX = joystickRect.width / 2;
            centerY = joystickRect.height / 2;
        };
        
        const handleStart = (e) => {
            e.preventDefault();
            isDragging = true;
            updateJoystickRect();
            joystick.style.opacity = '1';
        };
        
        const handleMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            // Obter posição do toque relativa ao joystick
            const touch = e.touches ? e.touches[0] : e;
            const rect = joystickRect;
            const x = touch.clientX - rect.left - centerX;
            const y = touch.clientY - rect.top - centerY;
            
            // Calcular distância do centro
            const distance = Math.sqrt(x * x + y * y);
            
            // Limitar à área do joystick
            let finalX = x;
            let finalY = y;
            
            if (distance > maxDistance) {
                finalX = (x / distance) * maxDistance;
                finalY = (y / distance) * maxDistance;
            }
            
            // Atualizar posição do knob
            knob.style.transform = `translate(${finalX}px, ${finalY}px)`;
            
            // Normalizar valores para -1 a 1
            const normalizedX = finalX / maxDistance;
            const normalizedY = finalY / maxDistance;
            
            // Emitir evento
            this.emit('joystickMove', normalizedX, normalizedY);
        };
        
        const handleEnd = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            isDragging = false;
            
            // Resetar posição do knob
            knob.style.transform = 'translate(0px, 0px)';
            joystick.style.opacity = '0.7';
            
            // Emitir evento de parada
            this.emit('joystickStop');
        };
        
        // Event listeners para touch
        joystick.addEventListener('touchstart', handleStart, { passive: false });
        joystick.addEventListener('touchmove', handleMove, { passive: false });
        joystick.addEventListener('touchend', handleEnd, { passive: false });
        joystick.addEventListener('touchcancel', handleEnd, { passive: false });
        
        // Event listeners para mouse (para teste em desktop)
        joystick.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        
        // Inicializar
        updateJoystickRect();
        window.addEventListener('resize', updateJoystickRect);
    }
    
    setupActionButtons() {
        const specialBtn = document.getElementById('specialBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        // Botão especial
        const handleSpecialPress = (e) => {
            e.preventDefault();
            this.emit('specialPress');
            specialBtn.style.transform = 'scale(0.9)';
        };
        
        const handleSpecialRelease = (e) => {
            e.preventDefault();
            this.emit('specialRelease');
            specialBtn.style.transform = 'scale(1)';
        };
        
        specialBtn.addEventListener('touchstart', handleSpecialPress, { passive: false });
        specialBtn.addEventListener('touchend', handleSpecialRelease, { passive: false });
        specialBtn.addEventListener('mousedown', handleSpecialPress);
        specialBtn.addEventListener('mouseup', handleSpecialRelease);
        
        // Botão de pausa
        pauseBtn.addEventListener('click', () => {
            this.emit('pausePress');
        });
    }
    
    setupAnimations() {
        // Animações suaves para mudanças de HP
        this.lastHpPercentage = 100;
        
        // Animação de pulso para soul orbs
        this.setupSoulOrbPulse();
        
        // Animação de shake para dano
        this.setupDamageShake();
    }
    
    setupSoulOrbPulse() {
        const soulOrbsElement = this.elements.soulOrbsText;
        let lastCount = 0;
        
        this.on('soulOrbCollected', (count) => {
            if (count > lastCount) {
                // Animação de pulso
                soulOrbsElement.style.transform = 'scale(1.2)';
                soulOrbsElement.style.color = '#66ffff';
                
                setTimeout(() => {
                    soulOrbsElement.style.transform = 'scale(1)';
                    soulOrbsElement.style.color = '';
                }, 200);
            }
            lastCount = count;
        });
    }
    
    setupDamageShake() {
        const hudElement = this.elements.gameHUD;
        
        this.on('playerDamaged', () => {
            // Shake effect
            hudElement.style.animation = 'shake 0.5s ease-in-out';
            
            setTimeout(() => {
                hudElement.style.animation = '';
            }, 500);
        });
    }
    
    updateHP(hp, maxHp) {
        const percentage = (hp / maxHp) * 100;
        const hpFill = this.elements.hpFill;
        const hpText = this.elements.hpText;
        
        // Animação suave da barra de HP
        hpFill.style.transition = 'width 0.3s ease';
        hpFill.style.width = percentage + '%';
        
        // Atualizar texto
        hpText.textContent = `${Math.ceil(hp)}/${maxHp}`;
        
        // Cores baseadas na porcentagem
        if (percentage > 60) {
            hpFill.style.background = 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 50%, #4CAF50 100%)';
        } else if (percentage > 30) {
            hpFill.style.background = 'linear-gradient(90deg, #FF9800 0%, #FFB74D 50%, #FF9800 100%)';
        } else {
            hpFill.style.background = 'linear-gradient(90deg, #F44336 0%, #EF5350 50%, #F44336 100%)';
            
            // Piscar quando HP baixo
            if (percentage < 20) {
                hpFill.style.animation = 'pulse 1s infinite';
            } else {
                hpFill.style.animation = '';
            }
        }
        
        // Trigger shake se HP diminuiu significativamente
        if (percentage < this.lastHpPercentage - 10) {
            this.emit('playerDamaged');
        }
        
        this.lastHpPercentage = percentage;
    }
    
    updateWave(wave) {
        const waveText = this.elements.waveText;
        waveText.textContent = `Onda: ${wave}`;
        
        // Animação ao trocar de onda
        waveText.style.transform = 'scale(1.3)';
        waveText.style.color = '#66ffff';
        
        setTimeout(() => {
            waveText.style.transform = 'scale(1)';
            waveText.style.color = '';
        }, 1000);
    }
    
    updateTimer(gameTime) {
        const timerText = this.elements.timerText;
        timerText.textContent = TimeUtils.formatTime(gameTime);
    }
    
    updateSoulOrbs(count) {
        const soulOrbsText = this.elements.soulOrbsText;
        const oldCount = parseInt(soulOrbsText.textContent.replace('Orbes: ', '')) || 0;
        
        soulOrbsText.textContent = `Orbes: ${count}`;
        
        if (count > oldCount) {
            this.emit('soulOrbCollected', count);
        }
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '1000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        // Cores baseadas no tipo
        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Adicionar ao DOM
        document.body.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remover após duração
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    showWaveStartNotification(wave) {
        this.showNotification(`Onda ${wave} iniciada!`, 'info', 2000);
    }
    
    showWaveCompleteNotification(wave) {
        this.showNotification(`Onda ${wave} completa!`, 'success', 2000);
    }
    
    showCriticalHitNotification() {
        // Criar efeito visual de crítico
        const criticalEffect = document.createElement('div');
        criticalEffect.textContent = 'CRÍTICO!';
        criticalEffect.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2em;
            font-weight: bold;
            color: #ffff00;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            pointer-events: none;
            z-index: 1000;
            animation: criticalHit 1s ease-out forwards;
        `;
        
        document.body.appendChild(criticalEffect);
        
        setTimeout(() => {
            if (criticalEffect.parentNode) {
                criticalEffect.parentNode.removeChild(criticalEffect);
            }
        }, 1000);
    }
    
    // Utility methods para show/hide elementos
    show(elementId) {
        const element = document.getElementById(elementId) || this.elements[elementId];
        if (element) {
            element.classList.remove('hidden');
            element.style.display = '';
        }
    }
    
    hide(elementId) {
        const element = document.getElementById(elementId) || this.elements[elementId];
        if (element) {
            element.classList.add('hidden');
            element.style.display = 'none';
        }
    }
    
    toggle(elementId) {
        const element = document.getElementById(elementId) || this.elements[elementId];
        if (element) {
            element.classList.toggle('hidden');
        }
    }
    
    // Responsividade
    updateForMobile() {
        if (DeviceUtils.isMobile()) {
            this.show('mobileControls');
            
            // Ajustar tamanhos para mobile
            const hud = this.elements.gameHUD;
            hud.style.fontSize = '0.9em';
            
            // Reorganizar elementos para landscape/portrait
            this.adjustForOrientation();
        } else {
            this.hide('mobileControls');
        }
    }
    
    adjustForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const mobileControls = this.elements.mobileControls;
        
        if (isLandscape) {
            mobileControls.classList.add('landscape');
        } else {
            mobileControls.classList.remove('landscape');
        }
    }
    
    // Renderizar HUD diretamente no canvas
    renderHUD(ctx, player) {
        if (!player) return;
        
        const margin = 20;
        const barWidth = 200;
        const barHeight = 20;
        const spacing = 5;
        
        // Barra de HP
        const hpX = margin;
        const hpY = margin;
        
        // Background da barra de HP
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(hpX - 2, hpY - 2, barWidth + 4, barHeight + 4);
        
        // Fundo da barra
        ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
        ctx.fillRect(hpX, hpY, barWidth, barHeight);
        
        // Preenchimento da barra de HP
        const hpPercent = player.hp / player.maxHp;
        const hpFillWidth = barWidth * hpPercent;
        const hpColor = hpPercent > 0.6 ? '#4CAF50' : hpPercent > 0.3 ? '#FF9800' : '#F44336';
        
        ctx.fillStyle = hpColor;
        ctx.fillRect(hpX, hpY, hpFillWidth, barHeight);
        
        // Texto da HP
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, hpX + barWidth/2, hpY + barHeight/2 + 5);
        
        // Barra de EXP
        const expX = margin;
        const expY = hpY + barHeight + spacing;
        
        // Background da barra de EXP
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(expX - 2, expY - 2, barWidth + 4, barHeight + 4);
        
        // Fundo da barra
        ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
        ctx.fillRect(expX, expY, barWidth, barHeight);
        
        // Preenchimento da barra de EXP
        const expPercent = player.exp / player.expToNext;
        const expFillWidth = barWidth * expPercent;
        
        ctx.fillStyle = '#66ccff';
        ctx.fillRect(expX, expY, expFillWidth, barHeight);
        
        // Texto da EXP
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`LVL ${player.level} - EXP: ${player.exp}/${player.expToNext}`, expX + barWidth/2, expY + barHeight/2 + 5);
        
        // Reset text align
        ctx.textAlign = 'left';
    }
}

// Input Manager - Gerencia todos os tipos de input
class InputManager extends EventEmitter {
    constructor() {
        super();
        
        this.keys = {};
        this.setupKeyboardInput();
        this.setupTouchInput();
    }
    
    setupKeyboardInput() {
        document.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keys[e.code] = true;
                this.emit('keyDown', e.code);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.emit('keyUp', e.code);
        });
        
        // Prevenir ações padrão em certas teclas
        document.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    setupTouchInput() {
        // Prevenir zoom duplo toque
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Prevenir scroll em dispositivos móveis
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }
    
    // Métodos de conveniência
    isMovingLeft() {
        return this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft');
    }
    
    isMovingRight() {
        return this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight');
    }
    
    isMovingUp() {
        return this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp');
    }
    
    isMovingDown() {
        return this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown');
    }
    
    isJumping() {
        return this.isKeyPressed('Space');
    }
}

// Adicionar estilos CSS para animações via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    @keyframes criticalHit {
        0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
        }
    }
    
    .landscape .mobile-buttons {
        flex-direction: row !important;
        gap: 10px !important;
    }
`;

document.head.appendChild(style);

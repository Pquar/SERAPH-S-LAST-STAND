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
        
        // APENAS ativar o joystick em dispositivos móveis
        if (!DeviceUtils.isMobile()) {
            console.log('Desktop detected - disabling virtual joystick');
            if (joystick) {
                joystick.style.display = 'none';
            }
            return; // Sair completamente se não for mobile
        }
        
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
            console.log('Joystick drag started (mobile only)');
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
            
            console.log('Joystick move (mobile):', { normalizedX, normalizedY });
            
            // Emitir evento APENAS se for dispositivo móvel
            this.emit('joystickMove', normalizedX, normalizedY);
        };
        
        const handleEnd = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            isDragging = false;
            
            // Resetar posição do knob
            knob.style.transform = 'translate(0px, 0px)';
            joystick.style.opacity = '0.7';
            
            console.log('Joystick drag ended (mobile only)');
            
            // Emitir evento de parada APENAS se for dispositivo móvel
            this.emit('joystickStop');
        };
        
        // Event listeners APENAS para touch (não mouse)
        joystick.addEventListener('touchstart', handleStart, { passive: false });
        joystick.addEventListener('touchmove', handleMove, { passive: false });
        joystick.addEventListener('touchend', handleEnd, { passive: false });
        joystick.addEventListener('touchcancel', handleEnd, { passive: false });
        
        // REMOVER completamente os event listeners de mouse
        // joystick.addEventListener('mousedown', handleStart);
        // document.addEventListener('mousemove', handleMove);
        // document.addEventListener('mouseup', handleEnd);
        
        // Inicializar
        updateJoystickRect();
        window.addEventListener('resize', updateJoystickRect);
    }
    
    setupActionButtons() {
        const shootBtn = document.getElementById('shootBtn');
        const jumpBtn = document.getElementById('jumpBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        // Botão de tiro
        if (shootBtn) {
            const handleShootPress = (e) => {
                console.log('Shoot button pressed');
                e.preventDefault();
                e.stopPropagation();
                this.emit('mobileShootStart');
                shootBtn.style.transform = 'scale(0.9)';
                shootBtn.style.background = 'linear-gradient(135deg, #ff4444 0%, #ff6666 100%)';
                shootBtn.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.6)';
            };
            
            const handleShootRelease = (e) => {
                console.log('Shoot button released');
                e.preventDefault();
                e.stopPropagation();
                this.emit('mobileShootStop');
                shootBtn.style.transform = 'scale(1)';
                shootBtn.style.background = '';
                shootBtn.style.boxShadow = '';
            };
            
            shootBtn.addEventListener('touchstart', handleShootPress, { passive: false });
            shootBtn.addEventListener('touchend', handleShootRelease, { passive: false });
            shootBtn.addEventListener('touchcancel', handleShootRelease, { passive: false });
            shootBtn.addEventListener('mousedown', handleShootPress);
            shootBtn.addEventListener('mouseup', handleShootRelease);
            shootBtn.addEventListener('mouseleave', handleShootRelease);
        }
        
        // Botão de pulo
        if (jumpBtn) {
            const handleJumpPress = (e) => {
                console.log('Jump button pressed');
                e.preventDefault();
                e.stopPropagation();
                this.emit('mobileJump');
                jumpBtn.style.transform = 'scale(0.9)';
                jumpBtn.style.background = 'linear-gradient(135deg, #66ff66 0%, #88ff88 100%)';
                jumpBtn.style.boxShadow = '0 0 20px rgba(102, 255, 102, 0.6)';
            };
            
            const handleJumpRelease = (e) => {
                console.log('Jump button released');
                e.preventDefault();
                e.stopPropagation();
                jumpBtn.style.transform = 'scale(1)';
                jumpBtn.style.background = '';
                jumpBtn.style.boxShadow = '';
            };
            
            jumpBtn.addEventListener('touchstart', handleJumpPress, { passive: false });
            jumpBtn.addEventListener('touchend', handleJumpRelease, { passive: false });
            jumpBtn.addEventListener('touchcancel', handleJumpRelease, { passive: false });
            jumpBtn.addEventListener('mousedown', handleJumpPress);
            jumpBtn.addEventListener('mouseup', handleJumpRelease);
            jumpBtn.addEventListener('mouseleave', handleJumpRelease);
        }
        
        // Botão de pausa
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.emit('pausePress');
            });
        }
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
    
    // Criar modal base
    createModal(id, title) {
        // Remover modal existente se houver
        const existingModal = document.getElementById(id);
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal-overlay';
        
        // Garantir que seja visível com estilos inline
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 1;
            visibility: visible;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: #1a1a1a;
                border: 2px solid #333;
                border-radius: 10px;
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                color: white;
                position: relative;
                z-index: 10001;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #333;
                ">
                    <h2 style="margin: 0; color: white;">${title}</h2>
                    <button class="modal-close" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        padding: 5px;
                        line-height: 1;
                    ">&times;</button>
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        
        // Adicionar modal ao DOM
        document.body.appendChild(modal);
        
        // Fechar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(id);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(id);
            }
        });
        
        console.log('Modal criado e adicionado ao DOM:', id); // Debug
        
        return modal.querySelector('.modal-body');
    }
    
    // Fechar modal
    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.remove();
        }
    }
    
    // Sistema de Ranking
    showRankingModal(rankings) {
        console.log('showRankingModal chamado com:', rankings); // Debug
        
        // CSS para o ranking PRIMEIRO
        this.addRankingStyles();
        
        const modalBody = this.createModal('ranking-modal', 'Ranking - Top 10');
        
        const content = document.createElement('div');
        content.className = 'ranking-content';
        content.style.cssText = `
            padding: 20px;
            color: white;
            min-height: 200px;
        `;
        
        if (rankings.length === 0) {
            content.innerHTML = `
                <div class="no-rankings">
                    <p>Nenhuma pontuação registrada ainda.</p>
                    <p>Jogue para aparecer no ranking!</p>
                </div>
            `;
        } else {
            const rankingList = document.createElement('div');
            rankingList.className = 'ranking-list';
            
            rankings.forEach((entry, index) => {
                const rankItem = document.createElement('div');
                rankItem.className = `rank-item ${index < 3 ? 'top-three' : ''}`;
                
                // Gerar HTML das cartas da build
                let buildHtml = '';
                if (entry.build && entry.build.length > 0) {
                    buildHtml = `
                        <div class="rank-build">
                            <span class="build-label">Build:</span>
                            <div class="build-cards">
                                ${entry.build.map(card => `
                                    <span class="build-card ${card.rarity}" title="${card.description}">
                                        ${card.name}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `;
                } else {
                    buildHtml = `
                        <div class="rank-build">
                            <span class="build-label">Build:</span>
                            <span class="no-build">Nenhuma carta escolhida</span>
                        </div>
                    `;
                }
                
                rankItem.innerHTML = `
                    <div class="rank-position">#${index + 1}</div>
                    <div class="rank-info">
                        <div class="rank-name">${entry.playerName}</div>
                        <div class="rank-stats">
                            <span class="score">${RankingSystem.formatScore(entry.score)} pts</span>
                            <span class="level">Nível ${entry.level}</span>
                            <span class="kills">${entry.enemiesKilled} mortes</span>
                            <span class="time">${RankingSystem.formatSurvivalTime(entry.survivalTime)}</span>
                        </div>
                        ${buildHtml}
                        <div class="rank-date">${entry.date}</div>
                    </div>
                `;
                rankingList.appendChild(rankItem);
            });
            
            content.appendChild(rankingList);
        }
        
        // Botões
        const buttons = document.createElement('div');
        buttons.className = 'modal-buttons';
        buttons.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
            padding: 20px;
        `;
        buttons.innerHTML = `
            <button id="clearRankingBtn" class="btn-secondary" style="
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                background: #757575;
                color: white;
            ">Limpar Ranking</button>
            <button id="closeRankingBtn" class="btn-primary" style="
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                background: #4CAF50;
                color: white;
            ">Fechar</button>
        `;
        
        content.appendChild(buttons);
        modalBody.appendChild(content);
        
        // Event listeners
        document.getElementById('clearRankingBtn').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar o ranking? Esta ação não pode ser desfeita.')) {
                this.emit('clearRanking');
                this.closeModal('ranking-modal');
            }
        });
        
        document.getElementById('closeRankingBtn').addEventListener('click', () => {
            this.closeModal('ranking-modal');
        });
    }
    
    // Sistema de Configurações
    showSettingsModal(settings) {
        console.log('showSettingsModal chamado com:', settings); // Debug
        
        // Validar e garantir valores padrão
        const validSettings = {
            playerName: settings.playerName || 'Player',
            audioEnabled: settings.audioEnabled !== false,
            masterVolume: isNaN(settings.masterVolume) ? 0.7 : Math.max(0, Math.min(1, settings.masterVolume)),
            sfxVolume: isNaN(settings.sfxVolume) ? 0.8 : Math.max(0, Math.min(1, settings.sfxVolume)),
            xpMultiplier: isNaN(settings.xpMultiplier) ? 1.0 : Math.max(0.5, Math.min(5.0, settings.xpMultiplier))
        };
        
        console.log('Settings validados:', validSettings); // Debug
        
        // CSS para as configurações PRIMEIRO
        this.addSettingsStyles();
        
        const modalBody = this.createModal('settings-modal', 'Configurações');
        
        const content = document.createElement('div');
        content.className = 'settings-content';
        content.style.cssText = `
            padding: 20px;
            min-width: 400px;
            color: white;
        `;
        content.innerHTML = `
            <div class="setting-group">
                <label for="playerNameInput">Nome do Jogador:</label>
                <input type="text" id="playerNameInput" value="${validSettings.playerName}" maxlength="20" />
            </div>
            
            <div class="setting-group">
                <label for="audioToggle">Áudio:</label>
                <button id="audioToggle" class="toggle-btn ${validSettings.audioEnabled ? 'enabled' : 'disabled'}">
                    ${validSettings.audioEnabled ? 'ATIVADO' : 'DESATIVADO'}
                </button>
            </div>
            
            <div class="setting-group">
                <label for="masterVolumeSlider">Volume Geral:</label>
                <div class="slider-container">
                    <input type="range" id="masterVolumeSlider" min="0" max="1" step="0.1" value="${validSettings.masterVolume}" />
                    <span id="masterVolumeValue">${Math.round(validSettings.masterVolume * 100)}%</span>
                </div>
            </div>
            
            <div class="setting-group">
                <label for="sfxVolumeSlider">Volume dos Efeitos:</label>
                <div class="slider-container">
                    <input type="range" id="sfxVolumeSlider" min="0" max="1" step="0.1" value="${validSettings.sfxVolume}" />
                    <span id="sfxVolumeValue">${Math.round(validSettings.sfxVolume * 100)}%</span>
                </div>
            </div>
            
            <div class="setting-group">
                <label for="xpMultiplierSlider">Multiplicador de XP:</label>
                <div class="slider-container">
                    <input type="range" id="xpMultiplierSlider" min="0.5" max="5.0" step="0.5" value="${validSettings.xpMultiplier}" />
                    <span id="xpMultiplierValue">${validSettings.xpMultiplier}x</span>
                </div>
                <small class="setting-help">Aumenta a velocidade de ganho de experiência</small>
            </div>
        `;
        
        // Botões
        const buttons = document.createElement('div');
        buttons.className = 'modal-buttons';
        buttons.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
            padding: 20px;
        `;
        buttons.innerHTML = `
            <button id="resetSettingsBtn" class="btn-secondary" style="
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                background: #757575;
                color: white;
            ">Restaurar Padrão</button>
            <button id="saveSettingsBtn" class="btn-primary" style="
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                background: #4CAF50;
                color: white;
            ">Salvar</button>
            <button id="cancelSettingsBtn" class="btn-secondary" style="
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                background: #757575;
                color: white;
            ">Cancelar</button>
        `;
        
        content.appendChild(buttons);
        modalBody.appendChild(content);
        
        // Event listeners para controles
        this.setupSettingsControls(validSettings);
    }
     setupSettingsControls(originalSettings) {
        const currentSettings = { ...originalSettings };
        
        console.log('setupSettingsControls chamado com:', currentSettings); // Debug
        
        // Toggle de áudio
        const audioToggle = document.getElementById('audioToggle');
        audioToggle.addEventListener('click', () => {
            currentSettings.audioEnabled = !currentSettings.audioEnabled;
            audioToggle.textContent = currentSettings.audioEnabled ? 'ATIVADO' : 'DESATIVADO';
            audioToggle.className = `toggle-btn ${currentSettings.audioEnabled ? 'enabled' : 'disabled'}`;
            
            // Aplicar mudança imediatamente
            this.emit('audioToggled', currentSettings.audioEnabled);
        });
        
        // Sliders de volume
        const masterSlider = document.getElementById('masterVolumeSlider');
        const masterValue = document.getElementById('masterVolumeValue');
        masterSlider.addEventListener('input', () => {
            const value = parseFloat(masterSlider.value);
            if (!isNaN(value)) {
                currentSettings.masterVolume = value;
                masterValue.textContent = Math.round(value * 100) + '%';
                this.emit('masterVolumeChanged', value);
            }
        });
        
        const sfxSlider = document.getElementById('sfxVolumeSlider');
        const sfxValue = document.getElementById('sfxVolumeValue');
        sfxSlider.addEventListener('input', () => {
            const value = parseFloat(sfxSlider.value);
            if (!isNaN(value)) {
                currentSettings.sfxVolume = value;
                sfxValue.textContent = Math.round(value * 100) + '%';
                this.emit('sfxVolumeChanged', value);
            }
        });
        
        // Slider de multiplicador XP
        const xpSlider = document.getElementById('xpMultiplierSlider');
        const xpValue = document.getElementById('xpMultiplierValue');
        xpSlider.addEventListener('input', () => {
            const value = parseFloat(xpSlider.value);
            if (!isNaN(value)) {
                currentSettings.xpMultiplier = value;
                xpValue.textContent = value + 'x';
            }
        });
        
        // Botões
        document.getElementById('resetSettingsBtn').addEventListener('click', () => {
            if (confirm('Restaurar todas as configurações para o padrão?')) {
                // Valores padrão
                const defaultSettings = {
                    playerName: 'Player',
                    audioEnabled: true,
                    masterVolume: 0.7,
                    sfxVolume: 0.8,
                    xpMultiplier: 1.0
                };
                
                // Aplicar imediatamente
                this.emit('audioToggled', defaultSettings.audioEnabled);
                this.emit('masterVolumeChanged', defaultSettings.masterVolume);
                this.emit('sfxVolumeChanged', defaultSettings.sfxVolume);
                
                // Atualizar interface
                document.getElementById('playerNameInput').value = defaultSettings.playerName;
                document.getElementById('masterVolumeSlider').value = defaultSettings.masterVolume;
                document.getElementById('masterVolumeValue').textContent = Math.round(defaultSettings.masterVolume * 100) + '%';
                document.getElementById('sfxVolumeSlider').value = defaultSettings.sfxVolume;
                document.getElementById('sfxVolumeValue').textContent = Math.round(defaultSettings.sfxVolume * 100) + '%';
                document.getElementById('xpMultiplierSlider').value = defaultSettings.xpMultiplier;
                document.getElementById('xpMultiplierValue').textContent = defaultSettings.xpMultiplier + 'x';
                
                audioToggle.textContent = 'ATIVADO';
                audioToggle.className = 'toggle-btn enabled';
                
                this.emit('resetSettings');
                this.closeModal('settings-modal');
            }
        });

        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            // Atualizar nome do jogador
            const newName = document.getElementById('playerNameInput').value.trim() || 'Player';
            currentSettings.playerName = newName;
            
            console.log('Salvando configurações:', currentSettings); // Debug
            
            this.emit('settingsSaved', currentSettings);
            this.closeModal('settings-modal');
        });

        document.getElementById('cancelSettingsBtn').addEventListener('click', () => {
            this.closeModal('settings-modal');
        });
    }
    
    // Adicionar estilos do ranking
    addRankingStyles() {
        if (document.getElementById('ranking-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ranking-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .modal-content {
                background: #1a1a1a;
                border: 2px solid #333;
                border-radius: 10px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                color: white;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #333;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            }
            
            .ranking-content {
                padding: 20px;
            }
            
            .ranking-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .rank-item {
                display: flex;
                align-items: center;
                padding: 15px;
                background: #222;
                border-radius: 8px;
                gap: 15px;
            }
            
            .rank-item.top-three {
                background: linear-gradient(135deg, #333, #444);
                border: 1px solid #555;
            }
            
            .rank-position {
                font-size: 24px;
                font-weight: bold;
                min-width: 40px;
                text-align: center;
            }
            
            .rank-item:nth-child(1) .rank-position { color: #ffd700; }
            .rank-item:nth-child(2) .rank-position { color: #c0c0c0; }
            .rank-item:nth-child(3) .rank-position { color: #cd7f32; }
            
            .rank-info {
                flex: 1;
            }
            
            .rank-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .rank-stats {
                display: flex;
                gap: 15px;
                font-size: 14px;
                color: #ccc;
            }
            
            .rank-date {
                font-size: 12px;
                color: #888;
                margin-top: 5px;
            }
            
            .score { color: #4CAF50; }
            .level { color: #2196F3; }
            .kills { color: #FF5722; }
            .time { color: #FF9800; }
            
            .no-rankings {
                text-align: center;
                padding: 40px;
                color: #888;
            }
            
            .modal-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 20px;
            }
            
            .btn-primary, .btn-secondary {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            }
            
            .btn-primary {
                background: #4CAF50;
                color: white;
            }
            
            .btn-secondary {
                background: #757575;
                color: white;
            }
            
            .new-record-popup {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
                border: 3px solid #ffd700;
                border-radius: 15px;
                padding: 30px;
                text-align: center;
                color: white;
                z-index: 1001;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
                animation: recordPopup 0.5s ease-out;
            }
            
            @keyframes recordPopup {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            
            .record-content h2 {
                color: #ffd700;
                margin-bottom: 20px;
                font-size: 32px;
            }
            
            .record-position {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #4CAF50;
            }
            
            .record-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .stat {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .stat-label {
                font-size: 14px;
                color: #ccc;
                margin-bottom: 5px;
            }
            
            .stat-value {
                font-size: 20px;
                font-weight: bold;
                color: white;
            }
            
            /* Estilos para Build/Cartas */
            .rank-build {
                margin-top: 8px;
                margin-bottom: 5px;
            }
            
            .build-label {
                font-size: 12px;
                color: #aaa;
                margin-right: 8px;
            }
            
            .build-cards {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                margin-top: 4px;
            }
            
            .build-card {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
                color: white;
                border: 1px solid transparent;
                cursor: help;
            }
            
            /* Cores por raridade das cartas */
            .build-card.common {
                background: #666;
                border-color: #888;
            }
            
            .build-card.uncommon {
                background: #2a7d32;
                border-color: #4caf50;
            }
            
            .build-card.epic {
                background: #7b1fa2;
                border-color: #9c27b0;
            }
            
            .build-card.legendary {
                background: #e65100;
                border-color: #ff9800;
            }
            
            .no-build {
                font-size: 11px;
                color: #666;
                font-style: italic;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Adicionar estilos das configurações
    addSettingsStyles() {
        if (document.getElementById('settings-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'settings-styles';
        style.textContent = `
            .settings-content {
                padding: 20px;
                min-width: 400px;
            }
            
            .setting-group {
                margin-bottom: 20px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .setting-group label {
                font-weight: bold;
                color: #fff;
                font-size: 14px;
            }
            
            .setting-group input[type="text"] {
                padding: 8px 12px;
                border: 2px solid #333;
                border-radius: 5px;
                background: #222;
                color: white;
                font-size: 16px;
            }
            
            .setting-group input[type="text"]:focus {
                outline: none;
                border-color: #4CAF50;
            }
            
            .toggle-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
            }
            
            .toggle-btn.enabled {
                background: #4CAF50;
                color: white;
            }
            
            .toggle-btn.disabled {
                background: #757575;
                color: white;
            }
            
            .slider-container {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .slider-container input[type="range"] {
                flex: 1;
                height: 6px;
                border-radius: 3px;
                background: #333;
                outline: none;
                -webkit-appearance: none;
            }
            
            .slider-container input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #4CAF50;
                cursor: pointer;
            }
            
            .slider-container input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #4CAF50;
                cursor: pointer;
                border: none;
            }
            
            .slider-container span {
                min-width: 50px;
                text-align: right;
                color: #4CAF50;
                font-weight: bold;
            }
            
            .setting-help {
                color: #888;
                font-size: 12px;
                margin-top: 4px;
            }
            
            @media (max-width: 600px) {
                .settings-content {
                    min-width: 300px;
                    padding: 15px;
                }
                
                .slider-container {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 8px;
                }
                
                .slider-container span {
                    text-align: center;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Sistema de Loja de Equipamentos
    showShopModal(playerData, equipmentData) {
        console.log('showShopModal chamado com:', { playerData, equipmentData }); // Debug
        console.log('Equipamentos de cajados:', equipmentData ? equipmentData.staffs : 'equipmentData é null'); // Debug específico
        
        // Verificar se os dados necessários existem
        if (!equipmentData || !equipmentData.hats || !equipmentData.staffs) {
            console.error('Dados de equipamentos inválidos:', equipmentData);
            alert('Erro: Dados da loja não disponíveis. Tente novamente.');
            return;
        }
        
        // CSS para a loja PRIMEIRO
        this.addShopStyles();
        
        const modalBody = this.createModal('shop-modal', 'Loja de Equipamentos');
        
        const content = document.createElement('div');
        content.className = 'shop-content';
        content.style.cssText = `
            padding: 20px;
            min-width: 600px;
            max-width: 1000px;
            color: white;
        `;
        
        // Header com Soul Orbs
        const shopHeader = document.createElement('div');
        shopHeader.className = 'shop-header';
        shopHeader.innerHTML = `
            <div class="soul-orbs-display">
                <span class="soul-orbs-icon">💎</span>
                <span class="soul-orbs-count">${playerData.soulOrbs || 0}</span>
                <span class="soul-orbs-label">Soul Orbs</span>
            </div>
        `;
        content.appendChild(shopHeader);
        
        // Abas da loja
        const shopTabs = document.createElement('div');
        shopTabs.className = 'shop-tabs';
        shopTabs.innerHTML = `
            <button class="shop-tab active" data-tab="hats">🎩 Chapéus</button>
            <button class="shop-tab" data-tab="staffs">🔮 Cajados</button>
        `;
        content.appendChild(shopTabs);
        
        // Conteúdo das abas
        const shopTabsContent = document.createElement('div');
        shopTabsContent.className = 'shop-tabs-content';
        
        // Aba de Chapéus
        const hatsTab = document.createElement('div');
        hatsTab.className = 'shop-tab-content active';
        hatsTab.id = 'hats-tab';
        hatsTab.appendChild(this.createEquipmentGrid('hats', equipmentData.hats, playerData));
        
        // Aba de Cajados
        const staffsTab = document.createElement('div');
        staffsTab.className = 'shop-tab-content';
        staffsTab.id = 'staffs-tab';
        staffsTab.appendChild(this.createEquipmentGrid('staffs', equipmentData.staffs, playerData));
        
        shopTabsContent.appendChild(hatsTab);
        shopTabsContent.appendChild(staffsTab);
        content.appendChild(shopTabsContent);
        
        // Botões
        const buttons = document.createElement('div');
        buttons.className = 'modal-buttons';
        buttons.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
            padding: 20px;
        `;
        buttons.innerHTML = `
            <button id="closeShopBtn" class="btn-primary" style="
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                background: #4CAF50;
                color: white;
            ">Fechar Loja</button>
        `;
        content.appendChild(buttons);
        
        modalBody.appendChild(content);
        
        // Event listeners
        this.setupShopControls(playerData, equipmentData);
    }
    
    createEquipmentGrid(type, equipment, playerData) {
        const grid = document.createElement('div');
        grid.className = 'equipment-grid';
        
        // Verificar se os dados de equipamentos existem
        if (!equipment || typeof equipment !== 'object') {
            console.warn('Dados de equipamentos inválidos para tipo:', type);
            const noDataMsg = document.createElement('div');
            noDataMsg.style.cssText = `
                padding: 40px;
                text-align: center;
                color: #888;
                font-size: 16px;
            `;
            noDataMsg.textContent = `Nenhum equipamento ${type} disponível.`;
            grid.appendChild(noDataMsg);
            return grid;
        }
        
        Object.entries(equipment).forEach(([itemId, item]) => {
            // Verificar se o item tem os dados necessários
            if (!item || !item.name || !item.cost) {
                console.warn('Item de equipamento inválido:', itemId, item);
                return;
            }
            
            const isOwned = playerData.ownedEquipment && playerData.ownedEquipment[type] && 
                           playerData.ownedEquipment[type].includes(itemId);
            const isEquipped = playerData.equippedEquipment && playerData.equippedEquipment[type] === itemId;
            const canAfford = (playerData.soulOrbs || 0) >= item.cost;
            
            const itemElement = document.createElement('div');
            itemElement.className = `equipment-item ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`;
            itemElement.innerHTML = `
                <div class="equipment-image">
                    <img src="${item.image || 'img/2.jpeg'}" alt="${item.name}" style="
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        border-radius: 4px;
                    " onload="this.style.opacity='1'" onerror="this.src='img/2.jpeg'; this.onerror=null;">
                    ${isEquipped ? '<div class="equipped-badge">EQUIPADO</div>' : ''}
                </div>
                <div class="equipment-info">
                    <h3 class="equipment-name">${item.name}</h3>
                    <p class="equipment-description">${item.description || 'Sem descrição'}</p>
                    <div class="equipment-effects">
                        ${this.formatEquipmentEffects(item.effects || {})}
                    </div>
                    <div class="equipment-cost">
                        <span class="cost-icon">💎</span>
                        <span class="cost-value">${item.cost}</span>
                    </div>
                </div>
                <div class="equipment-actions">
                    ${this.createEquipmentActionButton(itemId, type, item, isOwned, isEquipped, canAfford)}
                </div>
            `;
            
            grid.appendChild(itemElement);
        });
        
        return grid;
    }
    
    formatEquipmentEffects(effects) {
        const effectsHTML = [];
        
        Object.entries(effects).forEach(([key, value]) => {
            let effectText = '';
            let effectClass = '';
            
            switch(key) {
                case 'damage':
                    effectText = `+${value}% Dano`;
                    effectClass = 'damage-effect';
                    break;
                case 'defense':
                    effectText = `+${value}% Defesa`;
                    effectClass = 'defense-effect';
                    break;
                case 'speed':
                    effectText = `+${value}% Velocidade`;
                    effectClass = 'speed-effect';
                    break;
                case 'critChance':
                    effectText = `+${value}% Chance Crítica`;
                    effectClass = 'crit-effect';
                    break;
                case 'hp':
                    effectText = `+${value} HP`;
                    effectClass = 'hp-effect';
                    break;
                case 'xpBonus':
                    effectText = `+${value}% XP`;
                    effectClass = 'xp-effect';
                    break;
                case 'specialCooldown':
                    effectText = `-${value}% Cooldown Especial`;
                    effectClass = 'cooldown-effect';
                    break;
                case 'fireRate':
                    effectText = `+${value}% Taxa de Tiro`;
                    effectClass = 'firerate-effect';
                    break;
                default:
                    effectText = `${key}: ${value}`;
                    effectClass = 'generic-effect';
            }
            
            effectsHTML.push(`<div class="effect ${effectClass}">${effectText}</div>`);
        });
        
        return effectsHTML.join('');
    }
    
    createEquipmentActionButton(itemId, type, item, isOwned, isEquipped, canAfford) {
        if (isEquipped) {
            return `<button class="equipment-btn equipped-btn" disabled>EQUIPADO</button>`;
        } else if (isOwned) {
            return `<button class="equipment-btn equip-btn" data-action="equip" data-type="${type}" data-id="${itemId}">EQUIPAR</button>`;
        } else if (canAfford) {
            return `<button class="equipment-btn buy-btn" data-action="buy" data-type="${type}" data-id="${itemId}">COMPRAR</button>`;
        } else {
            return `<button class="equipment-btn disabled-btn" disabled>SEM ORBS</button>`;
        }
    }
    
    setupShopControls(playerData, equipmentData) {
        // Controle das abas
        const tabButtons = document.querySelectorAll('.shop-tab');
        const tabContents = document.querySelectorAll('.shop-tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Remover classe active de todas as abas
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Ativar aba selecionada
                button.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
        
        // Controles de compra e equipar
        const equipmentButtons = document.querySelectorAll('.equipment-btn');
        equipmentButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const type = e.target.dataset.type;
                const itemId = e.target.dataset.id;
                
                if (action === 'buy') {
                    this.emit('buyEquipment', { type, itemId });
                } else if (action === 'equip') {
                    this.emit('equipItem', { type, itemId });
                }
            });
        });
        
        // Botão fechar
        document.getElementById('closeShopBtn').addEventListener('click', () => {
            this.closeModal('shop-modal');
        });
    }
    
    // Atualizar loja após compra ou equipar
    updateShop(playerData, equipmentData) {
        const shopModal = document.getElementById('shop-modal');
        if (!shopModal) return;
        
        // Atualizar contador de Soul Orbs
        const soulOrbsCount = shopModal.querySelector('.soul-orbs-count');
        if (soulOrbsCount) {
            soulOrbsCount.textContent = playerData.soulOrbs || 0;
        }
        
        // Recriar grids de equipamentos
        const hatsTab = document.getElementById('hats-tab');
        const staffsTab = document.getElementById('staffs-tab');
        
        if (hatsTab) {
            hatsTab.innerHTML = '';
            hatsTab.appendChild(this.createEquipmentGrid('hats', equipmentData.hats, playerData));
        }
        
        if (staffsTab) {
            staffsTab.innerHTML = '';
            staffsTab.appendChild(this.createEquipmentGrid('staffs', equipmentData.staffs, playerData));
        }
        
        // Reconfigurar event listeners
        this.setupShopControls(playerData, equipmentData);
    }
    
    // Adicionar estilos da loja
    addShopStyles() {
        if (document.getElementById('shop-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'shop-styles';
        style.textContent = `
            .shop-content {
                padding: 20px;
                min-width: 800px;
                max-width: 1000px;
            }
            
            .shop-header {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
                padding: 15px;
                background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
                border-radius: 10px;
                border: 2px solid #333;
            }
            
            .soul-orbs-display {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 18px;
                font-weight: bold;
            }
            
            .soul-orbs-icon {
                font-size: 24px;
                filter: drop-shadow(0 0 5px rgba(102, 255, 255, 0.5));
            }
            
            .soul-orbs-count {
                color: #66ffff;
                font-size: 24px;
            }
            
            .soul-orbs-label {
                color: #ccc;
            }
            
            .shop-tabs {
                display: flex;
                gap: 5px;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
            }
            
            .shop-tab {
                padding: 12px 24px;
                background: #222;
                border: none;
                border-radius: 8px 8px 0 0;
                color: #ccc;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .shop-tab:hover {
                background: #333;
                color: white;
            }
            
            .shop-tab.active {
                background: #4CAF50;
                color: white;
                border-bottom: 2px solid #4CAF50;
            }
            
            .shop-tabs-content {
                min-height: 400px;
            }
            
            .shop-tab-content {
                display: none;
            }
            
            .shop-tab-content.active {
                display: block;
            }
            
            .equipment-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
                padding: 20px;
            }
            
            .equipment-item {
                background: #222;
                border: 2px solid #333;
                border-radius: 12px;
                padding: 15px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .equipment-item:hover {
                border-color: #555;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .equipment-item.owned {
                border-color: #4CAF50;
                background: linear-gradient(135deg, #222, #2a2a2a);
            }
            
            .equipment-item.equipped {
                border-color: #ffd700;
                background: linear-gradient(135deg, #2a2a2a, #333);
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
            }
            
            .equipment-image {
                position: relative;
                width: 100%;
                height: 120px;
                margin-bottom: 15px;
                background: #1a1a1a;
                border-radius: 8px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .equipment-image img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 4px;
            }
            
            .equipped-badge {
                position: absolute;
                top: 5px;
                right: 5px;
                background: #ffd700;
                color: #000;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
            }
            
            .equipment-info {
                margin-bottom: 15px;
            }
            
            .equipment-name {
                font-size: 18px;
                font-weight: bold;
                color: white;
                margin-bottom: 8px;
            }
            
            .equipment-description {
                font-size: 14px;
                color: #ccc;
                margin-bottom: 12px;
                line-height: 1.4;
            }
            
            .equipment-effects {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-bottom: 12px;
            }
            
            .effect {
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: bold;
            }
            
            .damage-effect { background: #f44336; color: white; }
            .defense-effect { background: #2196f3; color: white; }
            .speed-effect { background: #4caf50; color: white; }
            .crit-effect { background: #ff9800; color: white; }
            .hp-effect { background: #e91e63; color: white; }
            .xp-effect { background: #9c27b0; color: white; }
            .cooldown-effect { background: #00bcd4; color: white; }
            .firerate-effect { background: #795548; color: white; }
            .generic-effect { background: #607d8b; color: white; }
            
            .equipment-cost {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 16px;
                font-weight: bold;
                color: #66ffff;
                margin-bottom: 15px;
            }
            
            .cost-icon {
                font-size: 18px;
            }
            
            .equipment-actions {
                display: flex;
                justify-content: center;
            }
            
            .equipment-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                min-width: 100px;
            }
            
            .buy-btn {
                background: #4CAF50;
                color: white;
            }
            
            .buy-btn:hover {
                background: #45a049;
                transform: scale(1.05);
            }
            
            .equip-btn {
                background: #2196F3;
                color: white;
            }
            
            .equip-btn:hover {
                background: #1976D2;
                transform: scale(1.05);
            }
            
            .equipped-btn {
                background: #ffd700;
                color: #000;
                cursor: default;
            }
            
            .disabled-btn {
                background: #666;
                color: #999;
                cursor: not-allowed;
            }
            
            @media (max-width: 1000px) {
                .shop-content {
                    min-width: 600px;
                    padding: 15px;
                }
                
                .equipment-grid {
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 15px;
                    padding: 15px;
                }
            }
            
            @media (max-width: 700px) {
                .shop-content {
                    min-width: 400px;
                    padding: 10px;
                }
                
                .equipment-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                    padding: 10px;
                }
                
                .shop-tabs {
                    justify-content: center;
                }
                
                .shop-tab {
                    padding: 10px 16px;
                    font-size: 14px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Hide the game UI elements (HUD, mobile controls, etc.)
    hideUI() {
        if (this.elements.gameHUD) {
            this.elements.gameHUD.style.display = 'none';
        }
        if (this.elements.mobileControls) {
            this.elements.mobileControls.style.display = 'none';
        }
    }
    
    // Show the game UI elements (HUD, mobile controls, etc.)
    showUI() {
        if (this.elements.gameHUD) {
            this.elements.gameHUD.style.display = 'block';
        }
        if (this.elements.mobileControls) {
            // Verificar se é dispositivo móvel de forma simples
            const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (isMobile) {
                this.elements.mobileControls.style.display = 'flex';
            }
        }
    }
    
    // Show new record popup notification
    showNewRecordPopup(position, entry) {
        const popup = document.createElement('div');
        popup.className = 'new-record-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h3>🏆 NOVO RECORDE! 🏆</h3>
                <p>Posição #${position} no ranking!</p>
                <p><strong>${entry.playerName}</strong></p>
                <p>Pontuação: ${RankingSystem.formatScore(entry.score)}</p>
                <button class="popup-close-btn">OK</button>
            </div>
        `;
        
        // Adicionar estilos inline
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-in;
        `;
        
        const popupContent = popup.querySelector('.popup-content');
        popupContent.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 3px solid #FFD700;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            color: white;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
            max-width: 400px;
            animation: popIn 0.5s ease-out;
        `;
        
        // Adicionar estilos para animação se não existir
        if (!document.getElementById('popup-animations')) {
            const style = document.createElement('style');
            style.id = 'popup-animations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes popIn {
                    0% { transform: scale(0.7) translateY(-50px); opacity: 0; }
                    50% { transform: scale(1.05) translateY(0); opacity: 1; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                .popup-close-btn {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    margin-top: 15px;
                    transition: all 0.3s ease;
                }
                .popup-close-btn:hover {
                    background: linear-gradient(135deg, #45a049, #4CAF50);
                    transform: translateY(-2px);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Adicionar ao DOM
        document.body.appendChild(popup);
        
        // Event listener para fechar
        popup.querySelector('.popup-close-btn').addEventListener('click', () => {
            popup.remove();
        });
        
        // Fechar automaticamente após 5 segundos
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 5000);
        
        console.log('New record popup mostrado:', { position, entry });
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
            if (!this.keys[e.key]) {
                this.keys[e.key] = true;
                this.emit('keyDown', e.key);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.emit('keyUp', e.key);
        });
        
        // Prevenir ações padrão em certas teclas
        document.addEventListener('keydown', (e) => {
            if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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
        return this.isKeyPressed('a') || this.isKeyPressed('A') || this.isKeyPressed('ArrowLeft');
    }
    
    isMovingRight() {
        return this.isKeyPressed('d') || this.isKeyPressed('D') || this.isKeyPressed('ArrowRight');
    }
    
    isMovingUp() {
        return this.isKeyPressed('w') || this.isKeyPressed('W') || this.isKeyPressed('ArrowUp');
    }
    
    isMovingDown() {
        return this.isKeyPressed('s') || this.isKeyPressed('S') || this.isKeyPressed('ArrowDown');
    }
    
    isJumping() {
        return this.isKeyPressed(' ');
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
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: #1a1a1a;
        border: 2px solid #333;
        border-radius: 10px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        color: white;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #333;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    
    .ranking-content {
        padding: 20px;
    }
    
    .ranking-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .rank-item {
        display: flex;
        align-items: center;
        padding: 15px;
        background: #222;
        border-radius: 8px;
        gap: 15px;
    }
    
    .rank-item.top-three {
        background: linear-gradient(135deg, #333, #444);
        border: 1px solid #555;
    }
    
    .rank-position {
        font-size: 24px;
        font-weight: bold;
        min-width: 40px;
        text-align: center;
    }
    
    .rank-item:nth-child(1) .rank-position { color: #ffd700; }
    .rank-item:nth-child(2) .rank-position { color: #c0c0c0; }
    .rank-item:nth-child(3) .rank-position { color: #cd7f32; }
    
    .rank-info {
        flex: 1;
    }
    
    .rank-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
    }
    
    .rank-stats {
        display: flex;
        gap: 15px;
        font-size: 14px;
        color: #ccc;
    }
    
    .rank-date {
        font-size: 12px;
        color: #888;
        margin-top: 5px;
    }
    
    .score { color: #4CAF50; }
    .level { color: #2196F3; }
    .kills { color: #FF5722; }
    .time { color: #FF9800; }
    
    .no-rankings {
        text-align: center;
        padding: 40px;
        color: #888;
    }
    
    .modal-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
    }
    
    .btn-primary, .btn-secondary {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    }
    
    .btn-primary {
        background: #4CAF50;
        color: white;
    }
    
    .btn-secondary {
        background: #757575;
        color: white;
    }
    
    .new-record-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
        border: 3px solid #ffd700;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        color: white;
        z-index: 1001;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
        animation: recordPopup 0.5s ease-out;
    }
    
    @keyframes recordPopup {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    .record-content h2 {
        color: #ffd700;
        margin-bottom: 20px;
        font-size: 32px;
    }
    
    .record-position {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #4CAF50;
    }
    
    .record-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 30px;
    }
    
    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .stat-label {
        font-size: 14px;
        color: #ccc;
        margin-bottom: 5px;
    }
    
    .stat-value {
        font-size: 20px;
        font-weight: bold;
        color: white;
    }
    
    .settings-content {
        padding: 20px;
        min-width: 400px;
    }
    
    .setting-group {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .setting-group label {
        font-weight: bold;
        color: #fff;
        font-size: 14px;
    }
    
    .setting-group input[type="text"] {
        padding: 8px 12px;
        border: 2px solid #333;
        border-radius: 5px;
        background: #222;
        color: white;
        font-size: 16px;
    }
    
    .setting-group input[type="text"]:focus {
        outline: none;
        border-color: #4CAF50;
    }
    
    .toggle-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
    }
    
    .toggle-btn.enabled {
        background: #4CAF50;
        color: white;
    }
    
    .toggle-btn.disabled {
        background: #757575;
        color: white;
    }
    
    .slider-container {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .slider-container input[type="range"] {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: #333;
        outline: none;
        -webkit-appearance: none;
    }
    
    .slider-container input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #4CAF50;
        cursor: pointer;
    }
    
    .slider-container input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #4CAF50;
        cursor: pointer;
        border: none;
    }
    
    .slider-container span {
        min-width: 50px;
        text-align: right;
        color: #4CAF50;
        font-weight: bold;
    }
    
    .setting-help {
        color: #888;
        font-size: 12px;
        margin-top: 4px;
    }
    
    @media (max-width: 600px) {
        .settings-content {
            min-width: 300px;
            padding: 15px;
        }
        
        .slider-container {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
        }
        
        .slider-container span {
            text-align: center;
        }
    }
    
    .shop-content {
        padding: 20px;
        min-width: 800px;
        max-width: 1000px;
    }
    
    .shop-header {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
        border-radius: 10px;
        border: 2px solid #333;
    }
    
    .soul-orbs-display {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 18px;
        font-weight: bold;
    }
    
    .soul-orbs-icon {
        font-size: 24px;
        filter: drop-shadow(0 0 5px rgba(102, 255, 255, 0.5));
    }
    
    .soul-orbs-count {
        color: #66ffff;
        font-size: 24px;
    }
    
    .soul-orbs-label {
        color: #ccc;
    }
    
    .shop-tabs {
        display: flex;
        gap: 5px;
        margin-bottom: 20px;
        border-bottom: 2px solid #333;
    }
    
    .shop-tab {
        padding: 12px 24px;
        background: #222;
        border: none;
        border-radius: 8px 8px 0 0;
        color: #ccc;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    
    .shop-tab:hover {
        background: #333;
        color: white;
    }
    
    .shop-tab.active {
        background: #4CAF50;
        color: white;
        border-bottom: 2px solid #4CAF50;
    }
    
    .shop-tabs-content {
        min-height: 400px;
    }
    
    .shop-tab-content {
        display: none;
    }
    
    .shop-tab-content.active {
        display: block;
    }
    
    .equipment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        padding: 20px;
    }
    
    .equipment-item {
        background: #222;
        border: 2px solid #333;
        border-radius: 12px;
        padding: 15px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .equipment-item:hover {
        border-color: #555;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .equipment-item.owned {
        border-color: #4CAF50;
        background: linear-gradient(135deg, #222, #2a2a2a);
    }
    
    .equipment-item.equipped {
        border-color: #ffd700;
        background: linear-gradient(135deg, #2a2a2a, #333);
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
    }
    
    .equipment-image {
        position: relative;
        width: 100%;
        height: 120px;
        margin-bottom: 15px;
        background: #1a1a1a;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .equipment-image img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 4px;
    }
    
    .equipped-badge {
        position: absolute;
        top: 5px;
        right: 5px;
        background: #ffd700;
        color: #000;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
    }
    
    .equipment-info {
        margin-bottom: 15px;
    }
    
    .equipment-name {
        font-size: 18px;
        font-weight: bold;
        color: white;
        margin-bottom: 8px;
    }
    
    .equipment-description {
        font-size: 14px;
        color: #ccc;
        margin-bottom: 12px;
        line-height: 1.4;
    }
    
    .equipment-effects {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 12px;
    }
    
    .effect {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: bold;
    }
    
    .damage-effect { background: #f44336; color: white; }
    .defense-effect { background: #2196f3; color: white; }
    .speed-effect { background: #4caf50; color: white; }
    .crit-effect { background: #ff9800; color: white; }
    .hp-effect { background: #e91e63; color: white; }
    .xp-effect { background: #9c27b0; color: white; }
    .cooldown-effect { background: #00bcd4; color: white; }
    .firerate-effect { background: #795548; color: white; }
    .generic-effect { background: #607d8b; color: white; }
    
    .equipment-cost {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 16px;
        font-weight: bold;
        color: #66ffff;
        margin-bottom: 15px;
    }
    
    .cost-icon {
        font-size: 18px;
    }
    
    .equipment-actions {
        display: flex;
        justify-content: center;
    }
    
    .equipment-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        min-width: 100px;
    }
    
    .buy-btn {
        background: #4CAF50;
        color: white;
    }
    
    .buy-btn:hover {
        background: #45a049;
        transform: scale(1.05);
    }
    
    .equip-btn {
        background: #2196F3;
        color: white;
    }
    
    .equip-btn:hover {
        background: #1976D2;
        transform: scale(1.05);
    }
    
    .equipped-btn {
        background: #ffd700;
        color: #000;
        cursor: default;
    }
    
    .disabled-btn {
        background: #666;
        color: #999;
        cursor: not-allowed;
    }
    
    @media (max-width: 1000px) {
        .shop-content {
            min-width: 600px;
            padding: 15px;
        }
        
        .equipment-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px,  1fr));
            gap: 15px;
            padding: 15px;
        }
    }
    
    @media (max-width: 700px) {
        .shop-content {
            min-width: 400px;
            padding: 10px;
        }
        
        .equipment-grid {
            grid-template-columns: 1fr;
            gap: 15px;
            padding: 10px;
        }
        
        .shop-tabs {
            justify-content: center;
        }
        
        .shop-tab {
            padding: 10px 16px;
            font-size: 14px;
        }
    }
`;

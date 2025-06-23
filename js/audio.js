// audio.js - Sistema de áudio e efeitos sonoros

class AudioSystem extends EventEmitter {
    constructor() {
        super();
        
        this.context = null;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        
        this.sounds = {};
        this.music = null;
        this.currentMusic = null;
        
        this.initialized = false;
        this.muted = false;
        
        // Tentar inicializar (requer interação do usuário)
        this.init();
    }
    
    async init() {
        try {
            // AudioContext requer interação do usuário
            document.addEventListener('click', () => this.initializeAudioContext(), { once: true });
            document.addEventListener('touchstart', () => this.initializeAudioContext(), { once: true });
            document.addEventListener('keydown', () => this.initializeAudioContext(), { once: true });
            
            // Pré-carregar sons básicos
            this.preloadSounds();
            
        } catch (error) {
            console.warn('Erro ao inicializar sistema de áudio:', error);
        }
    }
    
    async initializeAudioContext() {
        if (this.initialized) return;
        
        try {
            // Criar AudioContext
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resolver estado suspended
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
            
            this.initialized = true;
            this.emit('initialized');
            
            console.log('Sistema de áudio inicializado');
            
        } catch (error) {
            console.warn('Erro ao inicializar AudioContext:', error);
        }
    }
    
    preloadSounds() {
        // Criar sons procedurais básicos
        this.createProceduralSounds();
    }
    
    createProceduralSounds() {
        // Definições de sons procedurais
        const soundDefinitions = {
            shot: {
                type: 'noise',
                frequency: 800,
                duration: 0.1,
                volume: 0.3,
                fadeOut: true
            },
            hit: {
                type: 'tone',
                frequency: 400,
                duration: 0.15,
                volume: 0.4,
                distortion: true
            },
            enemyDeath: {
                type: 'sweep',
                startFreq: 800,
                endFreq: 200,
                duration: 0.3,
                volume: 0.5
            },
            soulOrb: {
                type: 'chime',
                frequency: 660,
                duration: 0.4,
                volume: 0.6,
                echo: true
            },
            playerDamage: {
                type: 'noise',
                frequency: 200,
                duration: 0.2,
                volume: 0.7,
                lowpass: true
            },
            waveStart: {
                type: 'fanfare',
                frequencies: [523, 659, 784], // C, E, G
                duration: 1.0,
                volume: 0.4
            },
            waveComplete: {
                type: 'success',
                frequencies: [523, 659, 784, 1047], // C, E, G, C
                duration: 1.2,
                volume: 0.5
            },
            critical: {
                type: 'sparkle',
                frequency: 1200,
                duration: 0.3,
                volume: 0.6,
                shimmer: true
            }
        };
        
        // Armazenar definições para criação sob demanda
        this.soundDefinitions = soundDefinitions;
    }
    
    // Criar som procedural
    createSound(definition) {
        if (!this.context) return null;
        
        const { type, duration, volume } = definition;
        
        switch (type) {
            case 'tone':
                return this.createTone(definition);
            case 'noise':
                return this.createNoise(definition);
            case 'sweep':
                return this.createSweep(definition);
            case 'chime':
                return this.createChime(definition);
            case 'fanfare':
                return this.createFanfare(definition);
            case 'success':
                return this.createSuccess(definition);
            case 'sparkle':
                return this.createSparkle(definition);
            default:
                return this.createTone(definition);
        }
    }
    
    createTone(def) {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        
        const volume = (def.volume || 0.5) * this.sfxVolume * this.masterVolume;
        gainNode.gain.setValueAtTime(volume, this.context.currentTime);
        
        if (def.fadeOut) {
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + def.duration);
        } else {
            gainNode.gain.setValueAtTime(0, this.context.currentTime + def.duration);
        }
        
        return { oscillator, gainNode };
    }
    
    createNoise(def) {
        const bufferSize = this.context.sampleRate * def.duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Gerar ruído filtrado
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.sin(i / bufferSize * Math.PI);
        }
        
        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        filter.Q.setValueAtTime(10, this.context.currentTime);
        
        const volume = (def.volume || 0.5) * this.sfxVolume * this.masterVolume;
        gainNode.gain.setValueAtTime(volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + def.duration);
        
        return { source, gainNode, filter };
    }
    
    createSweep(def) {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(def.startFreq, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(def.endFreq, this.context.currentTime + def.duration);
        
        const volume = (def.volume || 0.5) * this.sfxVolume * this.masterVolume;
        gainNode.gain.setValueAtTime(volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + def.duration);
        
        return { oscillator, gainNode };
    }
    
    createChime(def) {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        
        const volume = (def.volume || 0.5) * this.sfxVolume * this.masterVolume;
        gainNode.gain.setValueAtTime(0, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + def.duration);
        
        return { oscillator, gainNode };
    }
    
    createFanfare(def) {
        const nodes = [];
        
        def.frequencies.forEach((freq, index) => {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, this.context.currentTime);
            
            const volume = (def.volume || 0.5) * this.sfxVolume * this.masterVolume / def.frequencies.length;
            const delay = index * 0.1;
            
            gainNode.gain.setValueAtTime(0, this.context.currentTime + delay);
            gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + delay + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + def.duration);
            
            nodes.push({ oscillator, gainNode, delay });
        });
        
        return { nodes };
    }
    
    createSuccess(def) {
        return this.createFanfare(def);
    }
    
    createSparkle(def) {
        const nodes = [];
        const sparkleCount = 5;
        
        for (let i = 0; i < sparkleCount; i++) {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.type = 'sine';
            const freq = def.frequency + (Math.random() - 0.5) * 400;
            oscillator.frequency.setValueAtTime(freq, this.context.currentTime);
            
            const volume = (def.volume || 0.5) * this.sfxVolume * this.masterVolume / sparkleCount;
            const delay = Math.random() * 0.2;
            
            gainNode.gain.setValueAtTime(0, this.context.currentTime + delay);
            gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + delay + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + delay + 0.2);
            
            nodes.push({ oscillator, gainNode, delay });
        }
        
        return { nodes };
    }
    
    // Tocar som
    playSound(soundName) {
        if (!this.initialized || this.muted) return;
        
        const definition = this.soundDefinitions[soundName];
        if (!definition) {
            console.warn(`Som não encontrado: ${soundName}`);
            return;
        }
        
        try {
            const sound = this.createSound(definition);
            if (!sound) return;
            
            const startTime = this.context.currentTime;
            
            if (sound.nodes) {
                // Som com múltiplos nós (fanfare, sparkle)
                sound.nodes.forEach(node => {
                    node.oscillator.start(startTime + node.delay);
                    node.oscillator.stop(startTime + definition.duration);
                });
            } else if (sound.source) {
                // Som baseado em buffer (noise)
                sound.source.start(startTime);
            } else if (sound.oscillator) {
                // Som simples (tone, sweep, chime)
                sound.oscillator.start(startTime);
                sound.oscillator.stop(startTime + definition.duration);
            }
            
        } catch (error) {
            console.warn(`Erro ao tocar som ${soundName}:`, error);
        }
    }
    
    // Música de fundo (placeholder para implementação futura)
    playMusic(musicName) {
        if (!this.initialized || this.muted) return;
        
        // TODO: Implementar música procedural ou carregar arquivos
        console.log(`Tocando música: ${musicName}`);
    }
    
    stopMusic() {
        if (this.currentMusic) {
            // TODO: Parar música atual
            this.currentMusic = null;
        }
    }
    
    // Controles de volume
    setMasterVolume(volume) {
        this.masterVolume = Math2D.clamp(volume, 0, 1);
        this.emit('volumeChanged', 'master', this.masterVolume);
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math2D.clamp(volume, 0, 1);
        this.emit('volumeChanged', 'sfx', this.sfxVolume);
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math2D.clamp(volume, 0, 1);
        this.emit('volumeChanged', 'music', this.musicVolume);
    }
    
    // Mute/Unmute
    mute() {
        this.muted = true;
        this.emit('muted');
    }
    
    unmute() {
        this.muted = false;
        this.emit('unmuted');
    }
    
    toggleMute() {
        if (this.muted) {
            this.unmute();
        } else {
            this.mute();
        }
    }
    
    // Getters
    isMuted() {
        return this.muted;
    }
    
    isInitialized() {
        return this.initialized;
    }
    
    getVolumes() {
        return {
            master: this.masterVolume,
            sfx: this.sfxVolume,
            music: this.musicVolume
        };
    }
    
    // Carregar configurações do localStorage
    loadSettings() {
        const settings = Storage.load('seraphsLastStand_audio', {});
        
        if (settings.masterVolume !== undefined) {
            this.setMasterVolume(settings.masterVolume);
        }
        
        if (settings.sfxVolume !== undefined) {
            this.setSfxVolume(settings.sfxVolume);
        }
        
        if (settings.musicVolume !== undefined) {
            this.setMusicVolume(settings.musicVolume);
        }
        
        if (settings.muted !== undefined) {
            this.muted = settings.muted;
        }
    }
    
    // Salvar configurações no localStorage
    saveSettings() {
        const settings = {
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            muted: this.muted
        };
        
        Storage.save('seraphsLastStand_audio', settings);
    }
    
    // Cleanup
    destroy() {
        if (this.context) {
            this.context.close();
        }
        
        this.sounds = {};
        this.currentMusic = null;
        this.initialized = false;
    }
}

// Sistema de música procedural simples (para implementação futura)
class ProceduralMusic extends EventEmitter {
    constructor(audioContext) {
        super();
        
        this.context = audioContext;
        this.isPlaying = false;
        this.currentPattern = null;
        this.bpm = 120;
        this.nextNoteTime = 0;
        this.noteIndex = 0;
        
        // Escalas musicais
        this.scales = {
            minor: [0, 2, 3, 5, 7, 8, 10], // A minor
            major: [0, 2, 4, 5, 7, 9, 11], // C major
            pentatonic: [0, 2, 5, 7, 9] // Pentatonic
        };
        
        this.baseFreq = 220; // A3
    }
    
    start(intensity = 1) {
        if (!this.context || this.isPlaying) return;
        
        this.isPlaying = true;
        this.nextNoteTime = this.context.currentTime;
        this.generatePattern(intensity);
        this.scheduleNotes();
    }
    
    stop() {
        this.isPlaying = false;
        this.currentPattern = null;
    }
    
    generatePattern(intensity) {
        const scale = this.scales.minor;
        const pattern = [];
        
        // Gerar padrão baseado na intensidade
        const noteCount = Math.floor(8 + intensity * 8);
        
        for (let i = 0; i < noteCount; i++) {
            const noteIndex = Math.floor(Math.random() * scale.length);
            const octave = Math.floor(Math.random() * 2) + 1;
            const duration = 0.5 + Math.random() * 0.5;
            
            pattern.push({
                note: scale[noteIndex],
                octave: octave,
                duration: duration,
                volume: 0.1 + Math.random() * 0.2
            });
        }
        
        this.currentPattern = pattern;
    }
    
    scheduleNotes() {
        if (!this.isPlaying || !this.currentPattern) return;
        
        const secondsPerBeat = 60.0 / this.bpm;
        
        while (this.nextNoteTime < this.context.currentTime + 0.1) {
            const note = this.currentPattern[this.noteIndex];
            
            if (note) {
                this.playNote(note, this.nextNoteTime);
            }
            
            this.nextNoteTime += secondsPerBeat;
            this.noteIndex = (this.noteIndex + 1) % this.currentPattern.length;
        }
        
        if (this.isPlaying) {
            requestAnimationFrame(() => this.scheduleNotes());
        }
    }
    
    playNote(note, time) {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        // Calcular frequência
        const frequency = this.baseFreq * Math.pow(2, note.octave + note.note / 12);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, time);
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(note.volume, time + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
        
        oscillator.start(time);
        oscillator.stop(time + note.duration);
    }
}

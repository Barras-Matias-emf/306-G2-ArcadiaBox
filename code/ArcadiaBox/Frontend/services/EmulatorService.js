export class EmulatorService {
    constructor() {
        this.emulator = null;
        this.canvas = null;
        this.ctx = null;
        this.jsnes = null;
    }

    async init(container, onFrameCallback) {
        // Charger JSNES
        const jsnesModule = await import('https://cdn.jsdelivr.net/npm/jsnes@1.2.1/+esm');
        this.jsnes = jsnesModule.default;

        // Créer l'émulateur
        this.emulator = new this.jsnes.NES({
            onFrame: (frameBuffer) => {
                this.updateCanvas(frameBuffer);
                if (onFrameCallback) {
                    onFrameCallback();
                }
            },
            onAudioSample: (left, right) => {
                // Gérer l'audio si nécessaire
            }
        });

        // Créer le canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = 256;
        this.canvas.height = 240;
        this.ctx = this.canvas.getContext('2d');
        container.innerHTML = '';
        container.appendChild(this.canvas);

        // Charger la ROM
        await this.loadROM();

        // Démarrer la boucle de jeu
        this.startGameLoop();

        // Configurer les contrôles
        this.setupControls();
    }

    async loadROM() {
        // Le bon chemin basé sur l'URL actuelle
        const romPath = '../roms/mario.nes';
        
        try {
            const response = await fetch(romPath);
            
            if (!response.ok) {
                throw new Error(`ROM non trouvée (${response.status})`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const romData = new Uint8Array(arrayBuffer);
            
            // Vérification détaillée de l'en-tête iNES
            if (romData.length < 16) {
                throw new Error('ROM trop petite (< 16 octets)');
            }
            
            // Vérifier la signature iNES: 'NES' + 0x1A
            const signature = [romData[0], romData[1], romData[2], romData[3]];
            
            if (signature[0] !== 0x4E || signature[1] !== 0x45 || signature[2] !== 0x53 || signature[3] !== 0x1A) {
                throw new Error(`Signature iNES invalide. Attendu: [0x4E, 0x45, 0x53, 0x1A], Reçu: [${signature.map(b => '0x' + b.toString(16)).join(', ')}]`);
            }
            
            // Informations sur la ROM
            const prgRomPages = romData[4];
            const chrRomPages = romData[5];
            
            // Tenter de charger la ROM
            try {
                this.emulator.loadROM(romData);
            } catch (emulatorError) {
                
                // Si c'est un problème de format, essayer de nettoyer la ROM
                // Parfois il y a des données supplémentaires au début
                if (romData.length > 16 && emulatorError.message.includes('Not a valid NES ROM')) {
                    
                    // Chercher la vraie signature iNES dans les premiers octets
                    for (let offset = 0; offset < Math.min(512, romData.length - 16); offset++) {
                        if (romData[offset] === 0x4E && 
                            romData[offset + 1] === 0x45 && 
                            romData[offset + 2] === 0x53 && 
                            romData[offset + 3] === 0x1A) {
                            
                            const cleanedRom = romData.slice(offset);
                            this.emulator.loadROM(cleanedRom);
                            return;
                        }
                    }
                }
                
                throw emulatorError;
            }
            
        } catch (error) {
            console.error('Erreur lors du chargement de la ROM:', error);
            throw new Error(`Impossible de charger mario.nes: ${error.message}. 
                
Suggestions:
1. Vérifiez que le fichier est bien dans Frontend/roms/mario.nes
2. Assurez-vous que c'est une ROM iNES valide (format .nes)
3. La ROM doit commencer par les octets: 4E 45 53 1A
4. Essayez avec une autre ROM Super Mario Bros
5. Si c'est une ROM homebrew, vérifiez qu'elle est au format iNES v1`);
        }
    }

    updateCanvas(frameBuffer) {
        if (!this.ctx) return;

        const imageData = this.ctx.createImageData(256, 240);

        for (let i = 0; i < frameBuffer.length; i++) {
            imageData.data[i] = frameBuffer[i];
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    startGameLoop() {
        const frame = () => {
            if (this.emulator) {
                this.emulator.frame();
            }
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }

    setupControls() {
        if (!this.jsnes) return;

        const keyMap = {
            'ArrowUp': this.jsnes.Controller.BUTTON_UP,
            'ArrowDown': this.jsnes.Controller.BUTTON_DOWN,
            'ArrowLeft': this.jsnes.Controller.BUTTON_LEFT,
            'ArrowRight': this.jsnes.Controller.BUTTON_RIGHT,
            'z': this.jsnes.Controller.BUTTON_A,
            'x': this.jsnes.Controller.BUTTON_B,
            'Enter': this.jsnes.Controller.BUTTON_START,
            'Shift': this.jsnes.Controller.BUTTON_SELECT
        };

        document.addEventListener('keydown', (e) => {
            const button = keyMap[e.key];
            if (button !== undefined && this.emulator) {
                this.emulator.buttonDown(1, button);
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            const button = keyMap[e.key];
            if (button !== undefined && this.emulator) {
                this.emulator.buttonUp(1, button);
                e.preventDefault();
            }
        });
    }

    getMemoryReader() {
        return (address) => {
            if (!this.emulator || !this.emulator.cpu || !this.emulator.cpu.mem) return 0;
            return this.emulator.cpu.mem[address] || 0;
        };
    }

    async start(romPath, gameConfig) {
        try {
            this.gameConfig = gameConfig;
            
            const rom = await fetch(romPath).then(r => r.arrayBuffer());
            
            this.nostalgist = await Nostalgist.nes(rom, {
                // ...existing code...
            });

            this.memoryScanner = new MemoryScanner(this.nostalgist, gameConfig);
            this.startMonitoring();
            
            return this.nostalgist;

        } catch (error) {
            console.error('❌ Erreur lors du démarrage:', error);
            throw error;
        }
    }

    startMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(() => {
            if (!this.memoryScanner) return;

            const gameState = this.memoryScanner.getGameState();

            if (this.gameConfig.callbacks?.onScoreUpdate) {
                this.gameConfig.callbacks.onScoreUpdate(gameState.score);
            }

            if (this.gameConfig.callbacks?.onLivesUpdate) {
                this.gameConfig.callbacks.onLivesUpdate(gameState.lives);
            }

            if (gameState.isGameOver && !this.gameOverHandled) {
                this.gameOverHandled = true;
                if (this.gameConfig.callbacks?.onGameOver) {
                    this.gameConfig.callbacks.onGameOver(gameState.score);
                }
            }

            if (!gameState.isGameOver && this.gameOverHandled) {
                this.gameOverHandled = false;
            }

        }, this.gameConfig.monitoringInterval || 100);
    }
}

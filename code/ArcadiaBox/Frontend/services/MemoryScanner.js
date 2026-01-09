/**
 * Scanner mémoire générique pour jeux NES
 */
export class MemoryScanner {
    constructor(nostalgistInstance, gameConfig) {
        console.log('🔧 [SCANNER] Construction');
        
        this.nostalgist = nostalgistInstance;
        this.config = gameConfig.memoryAddresses;
        this.wasmMemory = null;
        
        // ✅ Détection du mode d'adressage (Mario vs Galaga)
        this.useDirectOffsets = this.config.useDirectOffsets || false;
        
        console.log('✅ [SCANNER] Scanner créé');
        console.log('📍 [SCANNER] Mode:', this.useDirectOffsets ? 'Offsets directs (Galaga)' : 'Adresses NES + Offset (Mario)');
    }

    getWasmMemory() {
        if (this.wasmMemory) {
            return this.wasmMemory;
        }

        try {
            const paths = [
                () => this.nostalgist.Module?.HEAPU8,
                () => this.nostalgist.emulator?.emscripten?.Module?.HEAPU8,
                () => this.nostalgist.getEmulator()?.Module?.HEAPU8,
                () => window.Module?.HEAPU8
            ];

            for (const getPath of paths) {
                try {
                    const memory = getPath();
                    if (memory && memory.length > 0) {
                        this.wasmMemory = memory;
                        return memory;
                    }
                } catch (e) {}
            }

            return null;

        } catch (error) {
            console.error('❌ [SCANNER] Erreur mémoire WASM:', error);
            return null;
        }
    }

    readNESMemory(address, specificOffset) {
        const memory = this.getWasmMemory();
        if (!memory) return 0;

        // ✅ Si mode direct (Galaga), utiliser l'adresse telle quelle
        if (this.useDirectOffsets) {
            if (address < 0 || address >= memory.length) {
                return 0;
            }
            return memory[address];
        }

        // ✅ Sinon, mode classique (Mario): adresse NES + offset
        const offset = specificOffset !== undefined ? specificOffset : this.config.scoreOffset;
        const finalAddress = address + offset;

        if (finalAddress < 0 || finalAddress >= memory.length) {
            return 0;
        }

        return memory[finalAddress];
    }

    getScore() {
        const memory = this.getWasmMemory();
        if (!memory) return 0;

        try {
            const digits = [];

            for (let addressOrOffset of this.config.score) {
                const rawByte = this.readNESMemory(addressOrOffset);
                const digit = rawByte & 0x0F;
                
                if (digit > 9) {
                    if (this.useDirectOffsets) {
                        digits.push(0);
                        continue;
                    }
                    return 0;
                }
                
                digits.push(digit);
            }

            // ✅ Reconstruire le score
            // Pour Mario (6 digits): [0][1][2][3][4][5] → 012345
            // Pour Galaga (7 digits): [0][1][2][3][4][5][6] → 0123456
            
            if (digits.length === 7) {
                // Galaga: 7 digits (max 9,999,999)
                const score = digits[0] * 1000000 +
                             digits[1] * 100000 +
                             digits[2] * 10000 +
                             digits[3] * 1000 +
                             digits[4] * 100 +
                             digits[5] * 10 +
                             digits[6];
                return score;
            } else {
                // Mario: 6 digits (max 999,999)
                const score = digits[0] * 100000 +
                             digits[1] * 10000 +
                             digits[2] * 1000 +
                             digits[3] * 100 +
                             digits[4] * 10 +
                             digits[5];
                return score;
            }

        } catch (error) {
            console.error('❌ [SCANNER] Erreur lecture score:', error);
            return 0;
        }
    }

    getLives() {
        // ✅ Pour Galaga avec adresse des vies configurée
        if (this.useDirectOffsets) {
            const livesRaw = this.readNESMemory(this.config.lives);
            
            // ✅ Galaga: 0 vies = Game Over
            if (livesRaw === 0 || livesRaw === 255) {
                return -1; // Game Over
            }
            
            // ✅ Retourner le nombre de vies directement
            return livesRaw;
        }
        
        // ✅ Pour Mario (mode classique)
        const livesRaw = this.readNESMemory(this.config.lives, this.config.livesOffset);
        
        if (livesRaw === 255) return -1;
        
        return livesRaw + 1;
    }

    isGameOver() {
        return this.getLives() === -1;
    }

    getGameState() {
        const lives = this.getLives();
        
        return {
            score: this.getScore(),
            lives: lives,
            isGameOver: lives === -1,
            debugData: this.getDebugData()
        };
    }

    getDebugData() {
        const memory = this.getWasmMemory();
        if (!memory) return {};

        const debugData = {};
        
        for (let i = 0; i < this.config.score.length; i++) {
            const addressOrOffset = this.config.score[i];
            const rawByte = this.readNESMemory(addressOrOffset);
            
            // ✅ Label différent selon le mode
            const label = this.useDirectOffsets 
                ? `OFFSET_${addressOrOffset}` 
                : addressOrOffset.toString(16).toUpperCase();
            
            debugData[label] = rawByte;
        }
        
        // ✅ Debug des vies (seulement si configuré)
        if (this.config.lives !== 0x0000) {
            const livesRaw = this.readNESMemory(this.config.lives, this.config.livesOffset);
            const livesLabel = this.useDirectOffsets
                ? `LIVES_OFFSET_${this.config.lives}`
                : this.config.lives.toString(16).toUpperCase() + '_LIVES';
            debugData[livesLabel] = livesRaw;
        }

        return debugData;
    }
}

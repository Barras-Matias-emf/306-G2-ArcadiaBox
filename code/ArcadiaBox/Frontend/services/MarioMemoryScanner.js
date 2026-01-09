/**
 * Scanner mémoire pour Super Mario Bros (NES)
 * Gestion des offsets distincts pour Score et Vies
 */
export class MarioMemoryScanner {
    constructor(nostalgistInstance) {
        console.log('🔧 [SCANNER] Construction du scanner');
        console.log('📦 [SCANNER] Instance Nostalgist:', nostalgistInstance);
        
        this.nostalgist = nostalgistInstance;
        
        // ✅ Adresses mémoire NES
        this.scoreAddresses = [0x07DE, 0x07DF, 0x07E0, 0x07E1, 0x07E2, 0x07E3];
        this.livesAddress = 0x075A;
        
        // ✅ Offsets distincts pour accéder à la RAM NES dans HEAPU8
        this.scoreOffset = 2744362; // Offset pour le score
        this.livesOffset = 2744368; // Offset pour les vies (décalage de +6)
        
        // Cache pour la mémoire WASM
        this.wasmMemory = null;
        
        console.log('✅ [SCANNER] Scanner construit');
        console.log('📍 [SCANNER] Adresses Score:', this.scoreAddresses.map(a => '0x' + a.toString(16).toUpperCase()));
        console.log('💀 [SCANNER] Adresse Vies: 0x' + this.livesAddress.toString(16).toUpperCase());
        console.log('🔢 [SCANNER] Score Offset:', this.scoreOffset);
        console.log('🔢 [SCANNER] Lives Offset:', this.livesOffset, `(+${this.livesOffset - this.scoreOffset} bytes)`);
    }

    /**
     * Vérifie et récupère la mémoire WebAssembly (HEAPU8)
     * @returns {Uint8Array|null} - Mémoire WASM ou null
     */
    getWasmMemory() {
        if (this.wasmMemory) {
            return this.wasmMemory;
        }

        try {
            // Essayer plusieurs chemins d'accès à HEAPU8
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
                        console.log('✅ [SCANNER] Mémoire WASM trouvée, taille:', memory.length, 'octets');
                        this.wasmMemory = memory;
                        return memory;
                    }
                } catch (e) {
                    // Chemin non disponible, continuer
                }
            }

            return null;

        } catch (error) {
            console.error('❌ [SCANNER] Erreur accès mémoire WASM:', error);
            return null;
        }
    }

    /**
     * ✅ Lit un octet de la RAM NES avec offset spécifique
     * @param {number} address - Adresse NES (0x0000 - 0x07FF)
     * @param {number} [specificOffset] - Offset spécifique (optionnel)
     * @returns {number} - Valeur de l'octet (0-255)
     */
    readNESMemory(address, specificOffset) {
        const memory = this.getWasmMemory();
        if (!memory) {
            return 0;
        }

        // ✅ Utiliser l'offset fourni ou l'offset par défaut (scoreOffset)
        const offset = specificOffset !== undefined ? specificOffset : this.scoreOffset;
        
        // Calculer l'adresse finale dans HEAPU8
        const finalAddress = address + offset;

        // Vérifier que l'adresse est dans les limites
        if (finalAddress < 0 || finalAddress >= memory.length) {
            return 0;
        }

        return memory[finalAddress];
    }

    /**
     * ✅ Extrait le score en lisant les 6 octets BCD
     * @returns {number} - Score (0-999999)
     */
    getScore() {
        const memory = this.getWasmMemory();
        if (!memory) {
            return 0;
        }

        try {
            const digits = [];

            // Lire les 6 octets du score (utilise this.scoreOffset par défaut)
            for (let nesAddr of this.scoreAddresses) {
                const rawByte = this.readNESMemory(nesAddr); // Pas besoin de passer l'offset
                
                // Extraire le nibble bas (BCD: 0-9)
                const digit = rawByte & 0x0F;
                
                // Validation stricte: un chiffre BCD doit être entre 0 et 9
                if (digit > 9) {
                    return 0; // Score non initialisé
                }
                
                digits.push(digit);
            }

            // Reconstruire le score : [0,0,1,2,5,0] → 001250
            const score = digits[0] * 100000 +
                         digits[1] * 10000 +
                         digits[2] * 1000 +
                         digits[3] * 100 +
                         digits[4] * 10 +
                         digits[5];

            return score;

        } catch (error) {
            console.error('❌ [SCANNER] Erreur lecture score:', error);
            return 0;
        }
    }

    /**
     * ✅ Récupère le nombre de vies restantes
     * @returns {number} - Nombre de vies (-1 si Game Over)
     */
    getLives() {
        // ✅ Lire l'adresse des vies avec l'offset spécifique
        const livesRaw = this.readNESMemory(this.livesAddress, this.livesOffset);
        
        // ✅ Si 255 (0xFF), c'est un Game Over
        if (livesRaw === 255) {
            return -1;
        }
        
        // ✅ Sinon, retourner le nombre de vies + 1
        // (Dans Super Mario Bros, 0x00 = 1 vie, 0x01 = 2 vies, etc.)
        return livesRaw + 1;
    }

    /**
     * ✅ Vérifie si le Game Over est actif
     * @returns {boolean} - true si Game Over
     */
    isGameOver() {
        return this.getLives() === -1;
    }

    /**
     * ✅ Récupère l'état complet du jeu
     * @returns {Object} - { score, lives, isGameOver, debugData }
     */
    getGameState() {
        const lives = this.getLives();
        
        return {
            score: this.getScore(),
            lives: lives,
            isGameOver: lives === -1,
            debugData: this.getDebugData()
        };
    }

    /**
     * Récupère les données de debug (valeurs brutes)
     * @returns {Object} - Mapping adresse → valeur
     */
    getDebugData() {
        const memory = this.getWasmMemory();
        if (!memory) {
            return {};
        }

        const debugData = {};
        
        // Debug score addresses
        for (let nesAddr of this.scoreAddresses) {
            const rawByte = this.readNESMemory(nesAddr);
            const addrHex = nesAddr.toString(16).toUpperCase();
            debugData[addrHex] = rawByte;
        }
        
        // ✅ Debug lives address
        const livesRaw = this.readNESMemory(this.livesAddress, this.livesOffset);
        debugData[this.livesAddress.toString(16).toUpperCase() + '_LIVES'] = livesRaw;

        return debugData;
    }

    /**
     * Recherche les adresses contenant un score attendu
     * @param {number} expectedScore - Score à rechercher
     * @returns {Array} - Liste d'adresses candidates
     */
    findScoreAddresses(expectedScore) {
        const memory = this.getWasmMemory();
        if (!memory) {
            return [];
        }

        const scoreStr = expectedScore.toString().padStart(6, '0');
        const matches = [];
        
        // Scanner la RAM NES (0x0000 à 0x07FF)
        for (let baseAddr = 0x0000; baseAddr <= 0x07FF - 5; baseAddr++) {
            const bytes = [];
            let validBCD = true;

            // Lire 6 octets consécutifs
            for (let i = 0; i < 6; i++) {
                const byte = this.readNESMemory(baseAddr + i);
                const digit = byte & 0x0F;
                
                if (digit > 9) {
                    validBCD = false;
                    break;
                }
                
                bytes.push(digit);
            }

            // Si BCD valide, calculer le score
            if (validBCD) {
                const score = bytes[0] * 100000 +
                             bytes[1] * 10000 +
                             bytes[2] * 1000 +
                             bytes[3] * 100 +
                             bytes[4] * 10 +
                             bytes[5];

                if (score === expectedScore) {
                    matches.push({
                        address: baseAddr,
                        addressHex: '0x' + baseAddr.toString(16).toUpperCase(),
                        bytes: bytes,
                        score: score
                    });
                }
            }
        }

        return matches;
    }

    /**
     * Scan live pour trouver les offsets RAM
     * @returns {Object} - { scoreOffset, livesOffset }
     */
    scanForOffsets() {
        console.log('🔬 [SCANNER] Scan pour trouver les offsets RAM...');
        
        const memory = this.getWasmMemory();
        if (!memory) {
            console.error('❌ [SCANNER] Mémoire non disponible');
            return null;
        }

        const candidates = [];

        // Chercher des séquences de 6 chiffres BCD valides
        for (let offset = 0; offset < memory.length - 0x0800; offset += 100) {
            let validCount = 0;
            
            for (let i = 0; i < 6; i++) {
                const addr = 0x07DE + offset + i;
                if (addr >= memory.length) break;
                
                const byte = memory[addr];
                const digit = byte & 0x0F;
                
                if (digit <= 9) {
                    validCount++;
                }
            }

            if (validCount === 6) {
                const testScore = [];
                for (let i = 0; i < 6; i++) {
                    testScore.push(memory[0x07DE + offset + i] & 0x0F);
                }
                
                candidates.push({
                    offset: offset,
                    score: testScore.join('')
                });
                
                console.log(`🎯 [SCANNER] Offset candidat: ${offset} → Score: ${testScore.join('')}`);
            }
        }

        return candidates;
    }
}

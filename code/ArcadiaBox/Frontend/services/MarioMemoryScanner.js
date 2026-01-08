export class MarioMemoryScanner {
    constructor(nostalgistInstance) {
        console.log('🔧 [SCANNER] Construction du scanner');
        console.log('📦 [SCANNER] Instance Nostalgist:', nostalgistInstance);
        
        this.nostalgist = nostalgistInstance;
        // Adresses mémoire du score dans Super Mario Bros
        this.scoreAddresses = [0x07DD, 0x07DE, 0x07DF, 0x07E0, 0x07E1, 0x07E2];
        
        console.log('✅ [SCANNER] Scanner construit avec adresses:', this.scoreAddresses.map(a => '0x' + a.toString(16).toUpperCase()));
    }

    getScore() {
        if (!this.nostalgist) {
            console.warn('⚠️ [SCANNER] Nostalgist non disponible');
            return 0;
        }

        if (!this.nostalgist.getEmulator) {
            console.warn('⚠️ [SCANNER] getEmulator() non disponible');
            return 0;
        }

        try {
            const emu = this.nostalgist.getEmulator();
            if (!emu || !emu.cpu || !emu.cpu.mem) {
                console.warn('⚠️ [SCANNER] Mémoire CPU non disponible');
                return 0;
            }

            let scoreString = '';
            for (let addr of this.scoreAddresses) {
                const value = emu.cpu.mem[addr] || 0;
                // Convertir de BCD en décimal
                const digit = ((value >> 4) * 10) + (value & 0x0F);
                scoreString += digit.toString().padStart(2, '0');
            }

            const score = parseInt(scoreString, 10);
            return score;
        } catch (error) {
            console.error('❌ [SCANNER] Erreur lecture score:', error);
            return 0;
        }
    }

    getDebugData() {
        if (!this.nostalgist || !this.nostalgist.getEmulator) {
            console.warn('⚠️ [SCANNER] Impossible d\'obtenir les données de debug');
            return {};
        }

        try {
            const emu = this.nostalgist.getEmulator();
            if (!emu || !emu.cpu || !emu.cpu.mem) {
                return {};
            }

            const debugData = {};
            for (let addr of this.scoreAddresses) {
                debugData[addr.toString(16).toUpperCase()] = emu.cpu.mem[addr] || 0;
            }
            return debugData;
        } catch (error) {
            console.error('❌ [SCANNER] Erreur debug:', error);
            return {};
        }
    }

    findScoreAddresses(expectedScore) {
        console.log(`🔍 [SCANNER] Recherche des adresses pour le score: ${expectedScore}`);
        const matches = [];
        // Logique de recherche des adresses mémoire
        // À implémenter selon vos besoins
        console.log('⚠️ [SCANNER] findScoreAddresses() non implémenté');
        return matches;
    }
}

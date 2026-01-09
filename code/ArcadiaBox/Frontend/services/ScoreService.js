export class ScoreService {
    constructor() {
        // Adresses mémoire du score dans Super Mario Bros
        this.scoreAddresses = [0x07DD, 0x07DE, 0x07DF, 0x07E0, 0x07E1, 0x07E2];
    }

    extractScore(memoryReader) {
        let scoreString = '';

        for (let addr of this.scoreAddresses) {
            const value = memoryReader(addr);
            // Convertir de BCD en décimal
            const digit = ((value >> 4) * 10) + (value & 0x0F);
            scoreString += digit.toString().padStart(2, '0');
        }

        return parseInt(scoreString, 10);
    }

    formatScore(score) {
        return score.toString().padStart(6, '0');
    }
}

/**
 * Configuration centralisée pour tous les jeux émulés
 */
export const GAMES_CONFIG = {
    'mario': {
        name: 'Super Mario Bros',
        title: '🍄 SUPER MARIO BROS 🍄',
        romPath: '../roms/mario.nes',
        core: 'fceumm',
        memoryAddresses: {
            score: [0x07DE, 0x07DF, 0x07E0, 0x07E1, 0x07E2, 0x07E3],
            lives: 0x075A,
            scoreOffset: 2744362,
            livesOffset: 2744368
        },
        controls: {
            instructions: '⌨️ Touches : ← → ↑ ↓ | Z = A | X = B | Enter = Start | Shift = Select'
        },
        apiGameName: 'Super Mario Bros'
    },
    'galaga': {
        name: 'Galaga',
        title: '🚀 GALAGA 🚀',
        romPath: '../roms/galaga.nes',
        core: 'fceumm',
        memoryAddresses: {
            // ✅ Adresses HEAPU8 pour le score (7 digits: 0-9999999)
            score: [
                2744592, // Centaines de Milliers (100,000)
                2744593, // Dizaines de Milliers (10,000)
                2744594, // Milliers (1,000)
                2744595, // Centaines (100)
                2744596, // Dizaines (10)
                2744597, // Unités (1)
                2744598  // Placeholder
            ],
            // ✅ Adresse des vies (offset direct HEAPU8)
            lives: 2745525,
            scoreOffset: 0,
            livesOffset: 0,
            useDirectOffsets: true
        },
        controls: {
            instructions: '⌨️ Touches : ← → | Z = Tirer | Enter = Start | Shift = Select'
        },
        apiGameName: 'Galaga'
    }
};

/**
 * Détecte automatiquement le jeu en fonction de l'URL de la page
 * @returns {string} - ID du jeu ('mario' ou 'galaga')
 */
export function detectGameFromURL() {
    const pathname = window.location.pathname.toLowerCase();
    
    if (pathname.includes('mario')) {
        return 'mario';
    } else if (pathname.includes('galaga')) {
        return 'galaga';
    }
    
    // Par défaut, Mario
    console.warn('⚠️ [CONFIG] Impossible de détecter le jeu, utilisation de Mario par défaut');
    return 'mario';
}

/**
 * Récupère la configuration d'un jeu
 * @param {string} gameId - ID du jeu
 * @returns {Object} - Configuration du jeu
 */
export function getGameConfig(gameId) {
    const config = GAMES_CONFIG[gameId];
    
    if (!config) {
        throw new Error(`Configuration introuvable pour le jeu: ${gameId}`);
    }
    
    return config;
}

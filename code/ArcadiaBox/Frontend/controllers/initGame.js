import { GameController } from './GameController.js';
import { detectGameFromURL, getGameConfig } from '../config/gamesConfig.js';

/**
 * Fonction principale d'initialisation (générique pour tous les jeux)
 */
async function initGame() {
    try {
        // ✅ 1. Détecter automatiquement le jeu
        const gameId = detectGameFromURL();
        const gameConfig = getGameConfig(gameId);
        
        // ✅ 2. Charger Nostalgist
        const { Nostalgist } = await import('https://cdn.jsdelivr.net/npm/nostalgist@latest/dist/nostalgist.js');
        
        // ✅ 3. Récupérer les éléments DOM
        const emulatorContainer = document.getElementById('emulator-container');
        const liveScore = document.getElementById('live-score');
        const debugTable = document.getElementById('debug-table');
        const sessionIdElement = document.getElementById('session-id');
        const gameTitle = document.getElementById('game-title');
        const gameInstructions = document.getElementById('game-instructions');
        
        if (!emulatorContainer || !liveScore) {
            throw new Error('❌ Éléments DOM essentiels introuvables');
        }
        
        // ✅ 4. Mettre à jour le titre et les instructions
        if (gameTitle) {
            gameTitle.textContent = gameConfig.title;
        }
        if (gameInstructions) {
            const instructions = gameConfig.controls.instructions;
            gameInstructions.innerHTML = `
                ${instructions}
                <br>
                📊 Score tracké en temps réel | 💾 Sauvegarde automatique au Game Over
            `;
        }
        
        // ✅ 5. Afficher le message de chargement
        emulatorContainer.innerHTML = '<div class="loading">🎮 Chargement de la ROM...</div>';
        
        // ✅ 6. Charger la ROM
        const romPath = gameConfig.romPath;
        const romResponse = await fetch(romPath);
        
        if (!romResponse.ok) {
            throw new Error(`Impossible de charger la ROM depuis ${romPath} (${romResponse.status})`);
        }
        
        const romBlob = await romResponse.blob();
        const romFile = new File([romBlob], `${gameId}.nes`, { type: 'application/octet-stream' });
        
        // ✅ 7. Lancer l'émulateur
        const nostalgist = await Nostalgist.nes(romFile, {
            core: gameConfig.core,
            resizeCanvas: false,
            shader: 'crt',
        });
        
        // ✅ 8. Récupérer et injecter le canvas
        const canvas = nostalgist.getCanvas();
        
        if (!canvas) {
            throw new Error('❌ Impossible de récupérer le canvas');
        }
        
        emulatorContainer.innerHTML = '';
        emulatorContainer.appendChild(canvas);
        
        // Forcer les styles du canvas
        function forceCanvasStyles() {
            canvas.removeAttribute('style');
            canvas.className = 'nes-canvas';
            canvas.style.cssText = `
                position: static !important;
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                object-fit: contain !important;
                display: block !important;
                margin: 0 auto !important;
                top: auto !important;
                left: auto !important;
                right: auto !important;
                bottom: auto !important;
                transform: none !important;
            `;
        }
        
        forceCanvasStyles();
        setTimeout(forceCanvasStyles, 100);
        setTimeout(forceCanvasStyles, 500);
        setTimeout(forceCanvasStyles, 1000);
        
        const observer = new MutationObserver(() => {
            if (canvas.style.cssText.includes('position: absolute')) {
                forceCanvasStyles();
            }
        });
        observer.observe(canvas, { attributes: true, attributeFilter: ['style'] });
        
        // ✅ 9. Créer le contrôleur générique
        const controller = new GameController(nostalgist, gameConfig, {
            liveScore: liveScore,
            gameContainer: emulatorContainer,
            debugTable: debugTable
        });
        
        if (sessionIdElement) {
            sessionIdElement.textContent = controller.sessionId.substring(0, 12) + '...';
        }
        
        // Timer de jeu
        let startTime = Date.now();
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            const playTimeElement = document.getElementById('play-time');
            if (playTimeElement) {
                playTimeElement.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
        
        // ✅ 10. Initialiser le scanner (après 3 secondes)
        setTimeout(async () => {
            try {
                await controller.initScanner();
                controller.startMonitoring(100);
            } catch (error) {
                console.error('❌ Échec initialisation scanner:', error);
            }
        }, 3000);
        
        // ✅ 11. Exposer le contrôleur globalement
        window.GAME_CONTROLLER = controller;
        
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        
        const emulatorContainer = document.getElementById('emulator-container');
        if (emulatorContainer) {
            emulatorContainer.innerHTML = `
                <div class="loading" style="color: red;">
                    ❌ Erreur: ${error.message}
                    <br><br>
                    Vérifiez la console pour plus de détails
                </div>
            `;
        }
    }
}

// Lancer l'initialisation au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

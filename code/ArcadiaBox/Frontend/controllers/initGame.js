import { GameController } from './GameController.js';
import { detectGameFromURL, getGameConfig } from '../config/gamesConfig.js';

console.log('🚀 [INIT] Démarrage de l\'initialisation du jeu...');

/**
 * Fonction principale d'initialisation (générique pour tous les jeux)
 */
async function initGame() {
    console.log('🎮 [INIT] === DÉBUT INITIALISATION JEU ===');
    
    try {
        // ✅ 1. Détecter automatiquement le jeu
        const gameId = detectGameFromURL();
        const gameConfig = getGameConfig(gameId);
        console.log('🎯 [INIT] Jeu détecté:', gameId);
        console.log('⚙️ [INIT] Configuration:', gameConfig);
        
        // ✅ 2. Charger Nostalgist
        console.log('📦 [INIT] Chargement de Nostalgist...');
        const { Nostalgist } = await import('https://cdn.jsdelivr.net/npm/nostalgist@latest/dist/nostalgist.js');
        console.log('✅ [INIT] Nostalgist chargé:', Nostalgist);
        
        // ✅ 3. Récupérer les éléments DOM
        console.log('🖼️ [INIT] Récupération des éléments DOM...');
        const emulatorContainer = document.getElementById('emulator-container');
        const liveScore = document.getElementById('live-score');
        const debugTable = document.getElementById('debug-table');
        const sessionIdElement = document.getElementById('session-id');
        const gameTitle = document.getElementById('game-title');
        const gameInstructions = document.getElementById('game-instructions');
        
        if (!emulatorContainer || !liveScore) {
            throw new Error('❌ Éléments DOM essentiels introuvables');
        }
        
        console.log('✅ [INIT] Éléments DOM trouvés');
        
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
        console.log('📝 [INIT] Message de chargement affiché');
        
        // ✅ 6. Charger la ROM
        console.log('📁 [INIT] Chargement du fichier ROM...');
        const romPath = gameConfig.romPath;
        console.log('📂 [INIT] Chemin ROM:', romPath);
        
        const romResponse = await fetch(romPath);
        console.log('📡 [INIT] Réponse fetch:', romResponse.status, romResponse.statusText);
        
        if (!romResponse.ok) {
            throw new Error(`Impossible de charger la ROM depuis ${romPath} (${romResponse.status})`);
        }
        
        const romBlob = await romResponse.blob();
        console.log('📦 [INIT] Blob créé:', romBlob.size, 'octets');
        
        const romFile = new File([romBlob], `${gameId}.nes`, { type: 'application/octet-stream' });
        console.log('✅ [INIT] ROM chargée:', romFile.size, 'octets');
        
        // ✅ 7. Lancer l'émulateur
        console.log('🎮 [INIT] Lancement de l\'émulateur...');
        const nostalgist = await Nostalgist.nes(romFile, {
            core: gameConfig.core,
            resizeCanvas: false,
            shader: 'crt',
        });
        
        console.log('✅ [INIT] Émulateur lancé:', nostalgist);
        
        // ✅ 8. Récupérer et injecter le canvas
        console.log('🖼️ [INIT] Récupération du canvas...');
        const canvas = nostalgist.getCanvas();
        
        if (!canvas) {
            throw new Error('❌ Impossible de récupérer le canvas');
        }
        
        console.log('✅ [INIT] Canvas récupéré');
        
        emulatorContainer.innerHTML = '';
        emulatorContainer.appendChild(canvas);
        console.log('✅ [INIT] Canvas injecté');
        
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
        console.log('🎛️ [INIT] Création du contrôleur...');
        const controller = new GameController(nostalgist, gameConfig, {
            liveScore: liveScore,
            gameContainer: emulatorContainer,
            debugTable: debugTable
        });
        
        console.log('✅ [INIT] Contrôleur créé');
        
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
                console.log('⏳ [INIT] Initialisation du scanner...');
                await controller.initScanner();
                console.log('✅ [INIT] Scanner initialisé');
                
                controller.startMonitoring(100);
                console.log('✅ [INIT] Monitoring activé (100ms)');
                
            } catch (error) {
                console.error('❌ [INIT] Échec initialisation scanner:', error);
            }
        }, 3000);
        
        // ✅ 11. Exposer le contrôleur globalement
        window.GAME_CONTROLLER = controller;
        console.log('🌍 [INIT] Contrôleur exposé: window.GAME_CONTROLLER');
        
        console.log('🎉 [INIT] === INITIALISATION TERMINÉE ===');
        
    } catch (error) {
        console.error('❌ [INIT] ERREUR:', error);
        
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

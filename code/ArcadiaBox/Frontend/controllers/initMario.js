import { MarioGameController } from './MarioGameController.js';

console.log('🚀 [INIT] Démarrage de l\'initialisation de Mario...');

// Fonction principale d'initialisation
async function initMario() {
    console.log('🎮 [INIT] === DÉBUT INITIALISATION MARIO ===');
    
    try {
        // 1. Charger Nostalgist
        console.log('📦 [INIT] Chargement de Nostalgist...');
        const { Nostalgist } = await import('https://cdn.jsdelivr.net/npm/nostalgist@latest/dist/nostalgist.js');
        console.log('✅ [INIT] Nostalgist chargé:', Nostalgist);
        
        // 2. Récupérer les éléments DOM
        console.log('🖼️ [INIT] Récupération des éléments DOM...');
        const emulatorContainer = document.getElementById('emulator-container');
        const liveScore = document.getElementById('live-score');
        const debugTable = document.getElementById('debug-table');
        const sessionIdElement = document.getElementById('session-id');
        
        if (!emulatorContainer) {
            throw new Error('❌ emulator-container non trouvé');
        }
        if (!liveScore) {
            throw new Error('❌ live-score non trouvé');
        }
        
        console.log('✅ [INIT] Éléments DOM trouvés');
        
        // 3. Afficher le message de chargement
        emulatorContainer.innerHTML = '<div class="loading">🎮 Chargement de la ROM...</div>';
        console.log('📝 [INIT] Message de chargement affiché');
        
        // 4. Charger la ROM en tant que fichier local
        console.log('📁 [INIT] Chargement du fichier ROM local...');
        const romPath = '../roms/mario.nes';
        console.log('📂 [INIT] Chemin ROM relatif:', romPath);
        
        const romResponse = await fetch(romPath);
        console.log('📡 [INIT] Réponse fetch:', romResponse.status, romResponse.statusText);
        
        if (!romResponse.ok) {
            throw new Error(`Impossible de charger la ROM depuis ${romPath} (${romResponse.status})`);
        }
        
        const romBlob = await romResponse.blob();
        console.log('📦 [INIT] Blob créé:', romBlob.size, 'octets, type:', romBlob.type);
        
        const romFile = new File([romBlob], 'mario.nes', { type: 'application/octet-stream' });
        console.log('✅ [INIT] ROM chargée:', romFile.size, 'octets');
        
        // 5. Lancer l'émulateur SANS spécifier d'élément
        console.log('🎮 [INIT] Lancement de l\'émulateur (sans élément DOM)...');
        const nostalgist = await Nostalgist.nes(romFile, {
            core: 'fceumm',
            // Ne pas spécifier 'element' ici
            // Désactiver la gestion automatique de l'affichage
            resizeCanvas: false,
            shader: 'crt',
        });
        
        console.log('✅ [INIT] Émulateur lancé:', nostalgist);
        
        // 6. Récupérer le canvas et l'injecter manuellement
        console.log('🖼️ [INIT] Récupération du canvas...');
        const canvas = nostalgist.getCanvas();
        
        if (!canvas) {
            throw new Error('❌ Impossible de récupérer le canvas de l\'émulateur');
        }
        
        console.log('✅ [INIT] Canvas récupéré:', canvas);
        console.log('📏 [INIT] Dimensions canvas:', canvas.width, 'x', canvas.height);
        console.log('🎨 [INIT] Style canvas avant modification:', canvas.style.cssText);
        
        // Vider le conteneur et injecter le canvas
        emulatorContainer.innerHTML = '';
        emulatorContainer.appendChild(canvas);
        console.log('✅ [INIT] Canvas injecté dans #emulator-container');
        
        // FORCER les styles au canvas de manière agressive
        function forceCanvasStyles() {
            // Supprimer TOUS les styles inline existants
            canvas.removeAttribute('style');
            
            // Appliquer les nouveaux styles avec !important via une classe
            canvas.className = 'nes-canvas';
            
            // Forcer les styles en inline aussi (double sécurité)
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
            
            console.log('✅ [INIT] Styles forcés appliqués');
            console.log('🎨 [INIT] Style canvas après modification:', canvas.style.cssText);
        }
        
        // Appliquer immédiatement
        forceCanvasStyles();
        
        // Réappliquer après un court délai (Nostalgist peut modifier après)
        setTimeout(forceCanvasStyles, 100);
        setTimeout(forceCanvasStyles, 500);
        setTimeout(forceCanvasStyles, 1000);
        
        // Observer les changements et les réinitialiser
        const observer = new MutationObserver(() => {
            const currentStyle = canvas.style.cssText;
            if (currentStyle.includes('position: absolute') || 
                currentStyle.includes('position: fixed') ||
                !currentStyle.includes('position: static')) {
                console.warn('⚠️ [INIT] Nostalgist a modifié les styles, réapplication...');
                forceCanvasStyles();
            }
        });
        
        observer.observe(canvas, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
        
        console.log('👁️ [INIT] Observer de style activé');
        
        // 7. Créer le contrôleur
        console.log('🎛️ [INIT] Création du contrôleur...');
        const controller = new MarioGameController(nostalgist, {
            liveScore: liveScore,
            gameContainer: emulatorContainer,
            debugTable: debugTable
        });
        
        console.log('✅ [INIT] Contrôleur créé');
        
        // Afficher le session ID
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
        
        // 8. DÉSACTIVÉ TEMPORAIREMENT - Le scanner de mémoire ne fonctionne pas avec Nostalgist
        console.warn('⚠️ [INIT] Scanner de mémoire désactivé (incompatible avec Nostalgist/RetroArch)');
        console.warn('⚠️ [INIT] Le tracking du score nécessite une approche différente (OCR ou hooks)');
        
        // Si vous voulez quand même essayer (ça va timeout) :
        // await controller.initScanner();
        // controller.startMonitoring(500);
        
        // 9. Exposer le contrôleur globalement
        window.MARIO_CONTROLLER = controller;
        console.log('🌍 [INIT] Contrôleur exposé globalement: window.MARIO_CONTROLLER');
        
        console.log('🎉 [INIT] === INITIALISATION TERMINÉE AVEC SUCCÈS ===');
        console.log('🎮 [INIT] Le jeu est jouable mais le score n\'est pas tracké');
        console.log('💡 [INIT] Pour tracker le score, il faudra implémenter l\'OCR ou utiliser un autre émulateur');
        
    } catch (error) {
        console.error('❌ [INIT] ERREUR LORS DE L\'INITIALISATION:', error);
        console.error('📋 [INIT] Stack trace:', error.stack);
        
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

// Lancer l'initialisation au chargement de la page
console.log('⏳ [INIT] Attente du chargement du DOM...');
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ [INIT] DOM chargé, lancement de l\'initialisation');
        initMario();
    });
} else {
    console.log('✅ [INIT] DOM déjà chargé, lancement immédiat');
    initMario();
}

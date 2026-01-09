import { MarioMemoryScanner } from '../services/MarioMemoryScanner.js';

// ✅ Export de la classe pour utilisation externe
export class MarioGameController {
    // ✅ Constructor modifié pour accepter Nostalgist et DOM externes
    constructor(nostalgistInstance, domElements) {
        console.log('🎮 [CONSTRUCTOR] Initialisation MarioGameController');
        console.log('📦 [CONSTRUCTOR] Nostalgist instance:', nostalgistInstance);
        console.log('🖼️ [CONSTRUCTOR] DOM elements:', domElements);
        
        this.nostalgist = nostalgistInstance;
        this.dom = domElements;
        this.scanner = null;
        this.monitoringInterval = null;
        this.lastScore = 0;
        this.sessionId = this.generateSessionId();
        
        // ✅ État du Game Over (SANS scoreAlreadySent)
        this.wasGameOver = false;
        this.playerPseudo = null; // À définir par l'utilisateur
        
        console.log('✅ [CONSTRUCTOR] Controller créé avec sessionId:', this.sessionId);
    }

    // ✅ Nouvelle méthode pour initialiser le scanner
    async initScanner() {
        console.log('🎮 [INIT] Initialisation du scanner de mémoire...');
        
        try {
            // Attendre que la mémoire soit prête
            console.log('⏳ [INIT] Attente de l\'initialisation de la mémoire...');
            await this.waitForMemoryInit();
            console.log('✅ [INIT] Mémoire initialisée');
            
            // Exposer l'émulateur pour debug
            window.DEBUG_EMU = this.nostalgist;
            console.log('🐛 [INIT] DEBUG_EMU disponible dans la console');
            
            // Créer le scanner
            console.log('🔧 [INIT] Création du scanner...');
            this.scanner = new MarioMemoryScanner(this.nostalgist);
            console.log('✅ [INIT] Scanner créé:', this.scanner);
            
            // Debug après 5 secondes
            setTimeout(() => {
                console.log('🔍 [DEBUG] Lancement du debug mémoire...');
                this.debugMemoryInfo();
            }, 5000);
            
        } catch (error) {
            console.error('❌ [INIT] Erreur lors de l\'initialisation du scanner:', error);
            throw error;
        }
    }

    /**
     * Attend que la mémoire de l'émulateur soit initialisée
     */
    async waitForMemoryInit() {
        console.log('⏳ [MEMORY] Attente de l\'initialisation de la mémoire WASM...');
        
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // Réduit à 50 (5 secondes max)
            
            const checkMemory = setInterval(() => {
                attempts++;
                
                try {
                    // Essayer plusieurs chemins pour accéder à HEAPU8
                    const paths = [
                        () => this.nostalgist?.Module?.HEAPU8,
                        () => this.nostalgist?.emulator?.emscripten?.Module?.HEAPU8,
                        () => this.nostalgist?.getEmulator?.()?.Module?.HEAPU8,
                        () => window.Module?.HEAPU8
                    ];

                    for (const getPath of paths) {
                        try {
                            const memory = getPath();
                            if (memory && memory.length > 0) {
                                clearInterval(checkMemory);
                                resolve();
                                return;
                            }
                        } catch (e) {
                            // Continuer
                        }
                    }
                    
                } catch (error) {
                    console.error('❌ [MEMORY] Erreur lors de la vérification:', error);
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkMemory);
                    reject(new Error('WASM Memory initialization timeout'));
                }
            }, 100);
        });
    }

    /**
     * Démarre le monitoring du score
     */
    startMonitoring(intervalMs = 100) {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // ✅ Réinitialiser les états (SANS scoreAlreadySent)
        this.lastScore = -1;
        this.wasGameOver = false;
        
        this.monitoringInterval = setInterval(() => {
            this.monitoringLoop();
        }, intervalMs);
    }

    /**
     * Boucle de monitoring
     */
    monitoringLoop() {
        if (!this.scanner) {
            return;
        }
        
        try {
            // ✅ Récupérer l'état complet du jeu
            const gameState = this.scanner.getGameState();
            const currentScore = gameState.score;
            const isGameOver = gameState.isGameOver;
            
            // ✅ Détection du Game Over (TOUJOURS déclenché)
            if (isGameOver && !this.wasGameOver) {
                console.log('💀 [GAME OVER] Game Over détecté !');
                console.log('🎯 [GAME OVER] Score final:', currentScore);
                this.handleGameOver(currentScore);
            }
            
            // ✅ Mise à jour du flag Game Over
            this.wasGameOver = isGameOver;
            
            // ✅ Mise à jour du score (détection des changements)
            if (currentScore !== this.lastScore) {
                console.log(`📊 Score: ${this.lastScore} → ${currentScore}`);
                this.handleScoreChange(currentScore);
            } else {
                // Mise à jour silencieuse de l'UI (SANS LOG)
                this.updateScoreAndDebug(currentScore);
            }
            
        } catch (error) {
            console.error('❌ [LOOP] Erreur:', error);
        }
    }

    /**
     * Gère le changement de score
     */
    handleScoreChange(newScore) {
        // ✅ Détection spécifique du reset à 0 (SANS scoreAlreadySent)
        if (newScore === 0 && this.lastScore > 0) {
            console.log('🔄 Reset du score (nouveau jeu)');
            this.wasGameOver = false; // Réinitialiser seulement wasGameOver
        }
        
        // ✅ Détection des augmentations (LOG seulement pour gains importants)
        if (newScore > this.lastScore && this.lastScore >= 0) {
            const gain = newScore - this.lastScore;
            if (gain >= 100) { // Log seulement si gain >= 100 points
                console.log(`📈 +${gain} points`);
            }
        }
        
        this.lastScore = newScore;
        this.updateScoreAndDebug(newScore);
    }

    // ✅ Méthode SANS LOGS pour mise à jour UI
    updateScoreAndDebug(score) {
        const formatted = score.toString().padStart(6, '0');
        
        // Mise à jour du score live (SANS LOG)
        if (this.dom.liveScore) {
            this.dom.liveScore.textContent = formatted;
        }
        
        // Mise à jour du score display (SANS LOG)
        if (this.dom.scoreDisplay) {
            this.dom.scoreDisplay.textContent = `Score: ${formatted}`;
        }
        
        // Mise à jour du tableau de debug (SANS LOG)
        if (this.dom.debugTable && this.scanner) {
            const debugData = this.scanner.getDebugData();
            let html = '';
            
            for (const addr in debugData) {
                const value = debugData[addr];
                html += `<tr>
                    <td>0x${addr}</td>
                    <td>0x${value.toString(16).padStart(2, '0')}</td>
                    <td>${value}</td>
                </tr>`;
            }
            
            this.dom.debugTable.innerHTML = html;
        }
    }

    /**
     * ✅ Envoie le score au backend via /addscore
     * @param {string} pseudo - Pseudo du joueur
     * @param {number} score - Score final (optionnel, sinon lu depuis mémoire)
     * @returns {Promise<Object>} - Réponse du serveur
     */
    async sendScoreToDB(pseudo, score = null) {
        try {
            // Utiliser le score fourni ou le lire depuis la mémoire
            const finalScore = score !== null ? score : this.scanner.getScore();
            
            // ✅ Requête POST vers /addscore
            const response = await fetch('http://localhost:3000/api/score/addscore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pseudo: pseudo,
                    score: finalScore,
                    game: 'Super Mario Bros'
                })
            });

            // Vérifier le statut HTTP
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
            }

            // Parser la réponse JSON
            const data = await response.json();
            
            return data;
            
        } catch (error) {
            throw error;
        }
    }

    getCurrentScore() {
        return this.scanner ? this.scanner.getScore() : 0;
    }

    getDebugData() {
        return this.scanner ? this.scanner.getDebugData() : null;
    }

    findScore(expectedScore) {
        if (!this.scanner) {
            return [];
        }
        return this.scanner.findScoreAddresses(expectedScore);
    }

    /**
     * Affiche les informations de debug sur la mémoire
     */
    debugMemoryInfo() {
        if (!this.nostalgist) {
            return;
        }
        
        // Vérifier l'accès HEAPU8
        const memory = this.scanner?.getWasmMemory();
        if (memory) {
            const gameState = this.scanner.getGameState();
        }
    }

    /**
     * Arrête le monitoring
     */
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    /**
     * Génère un ID de session unique
     */
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const sessionId = `mario_${timestamp}_${random}`;
        return sessionId;
    }

    /**
     * ✅ Définir le pseudo du joueur
     * @param {string} pseudo - Pseudo du joueur
     */
    setPlayerPseudo(pseudo) {
        this.playerPseudo = pseudo;
    }

    /**
     * ✅ Gère le Game Over (SANS vérification de scoreAlreadySent)
     * @param {number} finalScore - Score final
     */
    async handleGameOver(finalScore) {
        console.log('💀 [GAME OVER] Traitement du Game Over...');
        console.log('🎯 [GAME OVER] Score à enregistrer:', finalScore);
        
        // ✅ POPUP pour demander le pseudo (TOUJOURS affiché)
        const pseudo = prompt(
            '💀 GAME OVER !\n\n' +
            `🎯 Votre score final : ${finalScore.toString().padStart(6, '0')}\n\n` +
            '👤 Entrez votre pseudo pour sauvegarder ce score dans le classement :',
            this.playerPseudo || 'Player1'
        );
        
        // Vérifier si l'utilisateur a annulé ou laissé vide
        if (!pseudo || pseudo.trim() === '') {
            console.log('⚠️ [GAME OVER] Pseudo non fourni, score ignoré');
            alert('❌ Score non sauvegardé.\n\nLe pseudo est obligatoire pour enregistrer votre score !');
            return;
        }
        
        // Nettoyer le pseudo
        const cleanPseudo = pseudo.trim();
        console.log('👤 [GAME OVER] Pseudo saisi:', cleanPseudo);
        
        // Sauvegarder pour la prochaine fois
        this.playerPseudo = cleanPseudo;
        
        // ✅ Envoyer le score au backend (TOUJOURS, sans vérification)
        try {
            console.log('📤 [GAME OVER] Envoi vers /addscore...');
            
            const result = await this.sendScoreToDB(cleanPseudo, finalScore);
            
            console.log('✅ [GAME OVER] Score enregistré avec succès !', result);
            
            // ✅ Notification de succès
            alert(
                '🎉 SCORE SAUVEGARDÉ !\n\n' +
                `👤 Joueur : ${cleanPseudo}\n` +
                `🎯 Score : ${finalScore.toString().padStart(6, '0')}\n` +
                `🎮 Jeu : Super Mario Bros\n\n` +
                '✅ Votre score a été ajouté au classement !'
            );
            
        } catch (error) {
            console.error('❌ [GAME OVER] Échec envoi:', error);
            
            // Notification d'erreur
            alert(
                '❌ ERREUR DE SAUVEGARDE\n\n' +
                `Impossible d'enregistrer le score.\n\n` +
                `Détails : ${error.message}\n\n` +
                `Vérifiez que le serveur backend est démarré !`
            );
        }
    }
}

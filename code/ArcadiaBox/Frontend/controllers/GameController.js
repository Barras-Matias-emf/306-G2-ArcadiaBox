import { MemoryScanner } from '../services/MemoryScanner.js';

/**
 * Contrôleur générique pour gérer tous les jeux NES
 */
export class GameController {
    constructor(nostalgistInstance, gameConfig, domElements) {
        console.log('🎮 [CONSTRUCTOR] Initialisation GameController');
        console.log('📦 [CONSTRUCTOR] Nostalgist:', nostalgistInstance);
        console.log('⚙️ [CONSTRUCTOR] Config:', gameConfig);
        console.log('🖼️ [CONSTRUCTOR] DOM:', domElements);
        
        this.nostalgist = nostalgistInstance;
        this.gameConfig = gameConfig;
        this.dom = domElements;
        this.scanner = null;
        this.monitoringInterval = null;
        this.lastScore = 0;
        this.sessionId = this.generateSessionId(gameConfig.name);
        
        this.wasGameOver = false;
        this.playerPseudo = null;
        
        console.log('✅ [CONSTRUCTOR] Controller créé');
    }

    async initScanner() {
        console.log('🎮 [INIT] Initialisation du scanner...');
        
        try {
            await this.waitForMemoryInit();
            console.log('✅ [INIT] Mémoire initialisée');
            
            window.DEBUG_EMU = this.nostalgist;
            
            this.scanner = new MemoryScanner(this.nostalgist, this.gameConfig);
            console.log('✅ [INIT] Scanner créé');
            
        } catch (error) {
            console.error('❌ [INIT] Erreur scanner:', error);
            throw error;
        }
    }

    async waitForMemoryInit() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkMemory = setInterval(() => {
                attempts++;
                
                try {
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
                        } catch (e) {}
                    }
                } catch (error) {
                    console.error('❌ [MEMORY] Erreur:', error);
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkMemory);
                    reject(new Error('WASM Memory timeout'));
                }
            }, 100);
        });
    }

    startMonitoring(intervalMs = 100) {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        this.lastScore = -1;
        this.wasGameOver = false;
        
        this.monitoringInterval = setInterval(() => {
            this.monitoringLoop();
        }, intervalMs);
    }

    monitoringLoop() {
        if (!this.scanner) return;
        
        try {
            const gameState = this.scanner.getGameState();
            const currentScore = gameState.score;
            const isGameOver = gameState.isGameOver;
            
            if (isGameOver && !this.wasGameOver) {
                console.log('💀 [GAME OVER] Détecté !');
                this.handleGameOver(currentScore);
            }
            
            this.wasGameOver = isGameOver;
            
            if (currentScore !== this.lastScore) {
                this.handleScoreChange(currentScore);
            } else {
                this.updateScoreAndDebug(currentScore);
            }
            
        } catch (error) {
            console.error('❌ [LOOP] Erreur:', error);
        }
    }

    handleScoreChange(newScore) {
        if (newScore === 0 && this.lastScore > 0) {
            console.log('🔄 Reset du score');
            this.wasGameOver = false;
        }
        
        this.lastScore = newScore;
        this.updateScoreAndDebug(newScore);
    }

    updateScoreAndDebug(score) {
        const formatted = score.toString().padStart(6, '0');
        
        if (this.dom.liveScore) {
            this.dom.liveScore.textContent = formatted;
        }
        
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

    async sendScoreToDB(pseudo, score = null) {
        try {
            const finalScore = score !== null ? score : this.scanner.getScore();
            
            const response = await fetch('http://localhost:3000/api/score/addscore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pseudo: pseudo,
                    score: finalScore,
                    game: this.gameConfig.apiGameName
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
            
        } catch (error) {
            throw error;
        }
    }

    async handleGameOver(finalScore) {
        console.log('💀 [GAME OVER] Traitement du Game Over...');
        console.log('🎯 [GAME OVER] Score à enregistrer:', finalScore);
        
        // Demander le pseudo via window.prompt()
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
        
        // Envoyer le score au backend
        try {
            console.log('📤 [GAME OVER] Envoi vers /addscore...');
            
            const result = await this.sendScoreToDB(cleanPseudo, finalScore);
            
            console.log('✅ [GAME OVER] Score enregistré avec succès !', result);
            
            // Notification de succès
            alert(
                '🎉 SCORE SAUVEGARDÉ !\n\n' +
                `👤 Joueur : ${cleanPseudo}\n` +
                `🎯 Score : ${finalScore.toString().padStart(6, '0')}\n` +
                `🎮 Jeu : ${this.gameConfig.name}\n\n` +
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

    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    generateSessionId(gameName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `${gameName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}_${random}`;
    }

    getCurrentScore() {
        return this.scanner ? this.scanner.getScore() : 0;
    }
}

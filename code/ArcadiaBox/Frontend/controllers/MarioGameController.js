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
        console.log('⏳ [MEMORY] Attente de l\'initialisation de la mémoire...');
        
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100;
            
            const checkMemory = setInterval(() => {
                attempts++;
                console.log(`🔍 [MEMORY] Tentative ${attempts}/${maxAttempts}`);
                
                try {
                    if (this.nostalgist && this.nostalgist.getEmulator) {
                        const emu = this.nostalgist.getEmulator();
                        console.log('🎮 [MEMORY] Emulateur obtenu:', emu);
                        
                        if (emu && emu.cpu && emu.cpu.mem) {
                            console.log('✅ [MEMORY] Mémoire CPU disponible');
                            clearInterval(checkMemory);
                            resolve();
                            return;
                        } else {
                            console.log('⚠️ [MEMORY] CPU ou mémoire non disponible');
                        }
                    } else {
                        console.log('⚠️ [MEMORY] Nostalgist ou getEmulator non disponible');
                    }
                } catch (error) {
                    console.error('❌ [MEMORY] Erreur lors de la vérification:', error);
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkMemory);
                    console.error('❌ [MEMORY] Timeout: mémoire non initialisée après', maxAttempts, 'tentatives');
                    reject(new Error('Memory initialization timeout'));
                }
            }, 100);
        });
    }

    /**
     * Démarre le monitoring du score
     */
    startMonitoring(intervalMs = 500) {
        console.log(`🚀 [MONITORING] Démarrage du monitoring (interval: ${intervalMs}ms)`);
        
        if (this.monitoringInterval) {
            console.log('⚠️ [MONITORING] Monitoring déjà actif, arrêt du précédent');
            clearInterval(this.monitoringInterval);
        }
        
        this.monitoringInterval = setInterval(() => {
            this.monitoringLoop();
        }, intervalMs);
        
        console.log('✅ [MONITORING] Monitoring démarré');
    }

    /**
     * Boucle de monitoring
     */
    monitoringLoop() {
        if (!this.scanner) {
            console.warn('⚠️ [LOOP] Scanner non initialisé');
            return;
        }
        
        try {
            const currentScore = this.scanner.getScore();
            
            if (currentScore !== this.lastScore) {
                console.log(`📊 [LOOP] Changement de score détecté: ${this.lastScore} → ${currentScore}`);
                this.handleScoreChange(currentScore);
            }
        } catch (error) {
            console.error('❌ [LOOP] Erreur dans la boucle de monitoring:', error);
        }
    }

    /**
     * Gère le changement de score
     */
    handleScoreChange(newScore) {
        console.log(`🎯 [SCORE] Nouveau score: ${newScore}`);
        this.lastScore = newScore;
        this.updateScoreAndDebug(newScore);
    }

    // ✅ Méthode modifiée pour supporter deux types d'éléments DOM
    updateScoreAndDebug(score) {
        const formatted = score.toString().padStart(6, '0');
        console.log(`🖼️ [UI] Mise à jour UI avec score: ${formatted}`);
        
        // Mise à jour du score live (format simple)
        if (this.dom.liveScore) {
            this.dom.liveScore.textContent = formatted;
            console.log('✅ [UI] Score live mis à jour');
        } else {
            console.warn('⚠️ [UI] Élément liveScore non trouvé');
        }
        
        // Mise à jour du score display (format avec label)
        if (this.dom.scoreDisplay) {
            this.dom.scoreDisplay.textContent = `Score: ${formatted}`;
            console.log('✅ [UI] Score display mis à jour');
        }
        
        // Mise à jour du tableau de debug
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
            console.log('✅ [UI] Tableau de debug mis à jour');
        }
    }

    // ✅ Nouvelle implémentation avec vrai fetch vers le backend
    async sendScoreToDB(pseudo, score = null) {
        try {
            const finalScore = score !== null ? score : this.scanner.getScore();
            
            console.log(`📤 [DB] Envoi du score vers le backend: ${pseudo} - ${finalScore}`);
            
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

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ [DB] Score enregistré:', data);
            return data;
            
        } catch (error) {
            console.error('❌ [DB] Erreur lors de l\'envoi du score:', error);
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
            console.error('❌ Scanner non initialisé');
            return [];
        }
        return this.scanner.findScoreAddresses(expectedScore);
    }

    /**
     * Affiche les informations de debug sur la mémoire
     */
    debugMemoryInfo() {
        console.log('🔍 [DEBUG] === INFORMATIONS DE DEBUG ===');
        
        if (!this.nostalgist) {
            console.error('❌ [DEBUG] Nostalgist non disponible');
            return;
        }
        
        console.log('✅ [DEBUG] Nostalgist disponible:', this.nostalgist);
        
        if (!this.nostalgist.getEmulator) {
            console.error('❌ [DEBUG] getEmulator() non disponible');
            return;
        }
        
        const emu = this.nostalgist.getEmulator();
        console.log('🎮 [DEBUG] Émulateur:', emu);
        
        if (!emu || !emu.cpu || !emu.cpu.mem) {
            console.error('❌ [DEBUG] Mémoire CPU non disponible');
            return;
        }
        
        console.log('✅ [DEBUG] Mémoire CPU disponible');
        console.log('📊 [DEBUG] Score actuel:', this.scanner ? this.scanner.getScore() : 'Scanner non initialisé');
        console.log('🔢 [DEBUG] Données debug:', this.scanner ? this.scanner.getDebugData() : 'Scanner non initialisé');
        
        console.log('🔍 [DEBUG] === FIN DEBUG ===');
    }

    /**
     * Arrête le monitoring
     */
    stop() {
        console.log('🛑 [STOP] Arrêt du monitoring');
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('✅ [STOP] Monitoring arrêté');
        } else {
            console.log('⚠️ [STOP] Aucun monitoring actif');
        }
    }

    /**
     * Génère un ID de session unique
     */
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const sessionId = `mario_${timestamp}_${random}`;
        console.log('🆔 [SESSION] Session ID généré:', sessionId);
        return sessionId;
    }
}

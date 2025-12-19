import { MarioMemoryScanner } from './../';

// ✅ Export de la classe pour utilisation externe
export class MarioGameController {
    // ✅ Constructor modifié pour accepter Nostalgist et DOM externes
    constructor(nostalgistInstance, domElements) {
        this.nostalgist = nostalgistInstance;
        this.dom = domElements; // { liveScore, scoreDisplay, debugTable, etc. }
        this.scanner = null;
        this.monitoringInterval = null;
        this.lastScore = 0;
        this.sessionId = this.generateSessionId();
    }

    // ✅ Nouvelle méthode pour initialiser le scanner
    async initScanner() {
        console.log('🎮 Initialisation du scanner de mémoire...');
        
        // Attendre que la mémoire soit prête
        await this.waitForMemoryInit();
        
        // Exposer l'émulateur pour debug
        window.DEBUG_EMU = this.nostalgist;
        console.log('🐛 DEBUG_EMU disponible dans la console');
        
        // Créer le scanner
        this.scanner = new MarioMemoryScanner(this.nostalgist);
        console.log('✅ Scanner initialisé');
        
        // Debug après 5 secondes
        setTimeout(() => {
            this.debugMemoryInfo();
        }, 5000);
    }

    /**
     * Attend que la mémoire de l'émulateur soit initialisée
     */
    async waitForMemoryInit() {
        // ...existing code...
    }

    /**
     * Démarre le monitoring du score
     */
    startMonitoring(intervalMs = 500) {
        // ...existing code...
    }

    /**
     * Boucle de monitoring
     */
    monitoringLoop() {
        // ...existing code...
    }

    /**
     * Gère le changement de score
     */
    handleScoreChange(newScore) {
        // ...existing code...
    }

    // ✅ Méthode modifiée pour supporter deux types d'éléments DOM
    updateScoreAndDebug(score) {
        const formatted = score.toString().padStart(6, '0');
        
        // Mise à jour du score live (format simple)
        if (this.dom.liveScore) {
            this.dom.liveScore.textContent = formatted;
        }
        
        // Mise à jour du score display (format avec label)
        if (this.dom.scoreDisplay) {
            this.dom.scoreDisplay.textContent = `Score: ${formatted}`;
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
        }
    }

    // ✅ Nouvelle implémentation avec vrai fetch vers le backend
    async sendScoreToDB(pseudo, score = null) {
        try {
            // Si score non fourni, utiliser le score actuel
            const finalScore = score !== null ? score : this.scanner.getScore();
            
            console.log(`📤 Envoi du score vers le backend: ${pseudo} - ${finalScore}`);
            
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
            console.log('✅ Score enregistré:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi du score:', error);
            throw error;
        }
    }

    // ✅ Nouvelle méthode pour obtenir le score actuel
    getCurrentScore() {
        return this.scanner ? this.scanner.getScore() : 0;
    }

    // ✅ Nouvelle méthode pour obtenir les données de debug
    getDebugData() {
        return this.scanner ? this.scanner.getDebugData() : null;
    }

    // ✅ Nouvelle méthode pour rechercher les adresses du score
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
        // ...existing code...
    }

    /**
     * Arrête le monitoring
     */
    stop() {
        // ...existing code...
    }

    /**
     * Génère un ID de session unique
     */
    generateSessionId() {
        // ...existing code...
    }
}

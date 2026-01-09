import { ScoreTableService } from '../services/ScoreTableService.js';

/**
 * Contrôleur pour gérer l'affichage du tableau des scores
 */
export class ScoreTableController {
    constructor() {
        this.service = new ScoreTableService();
        this.scoresContainer = document.getElementById('scores');
        this.gameTitle = document.getElementById('game-title');
    }

    /**
     * Récupère le paramètre 'game' de l'URL
     * @returns {string|null} - Nom du jeu ou null
     */
    getGameFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('game');
    }

    /**
     * Affiche un message de chargement
     */
    showLoading() {
        if (this.scoresContainer) {
            this.scoresContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; opacity: 0.7;">
                    <p>⏳ Chargement des scores...</p>
                </div>
            `;
        }
    }

    /**
     * Affiche un message d'erreur
     * @param {string} message - Message d'erreur
     */
    showError(message) {
        if (this.scoresContainer) {
            this.scoresContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ff3b3b;">
                    <p>❌ ${message}</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Vérifiez que le serveur backend est démarré.</p>
                </div>
            `;
        }
    }

    /**
     * Affiche un message si aucun score n'est trouvé
     * @param {string} gameName - Nom du jeu
     */
    showNoScores(gameName) {
        if (this.scoresContainer) {
            this.scoresContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; opacity: 0.7;">
                    <p>📊 Aucun score enregistré pour <strong>${gameName}</strong></p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Soyez le premier à jouer !</p>
                </div>
            `;
        }
    }

    /**
     * Affiche les scores dans le tableau
     * @param {Array} scores - Liste des scores à afficher
     */
    renderScores(scores) {
        if (!this.scoresContainer) {
            console.error('❌ [CONTROLLER] Container #scores non trouvé');
            return;
        }

        // Vider le conteneur
        this.scoresContainer.innerHTML = '';

        // Créer les entrées de score
        scores.forEach((score, index) => {
            const scoreEntry = document.createElement('div');
            scoreEntry.classList.add('score-entry');

            // Ajouter une classe spéciale pour le podium (top 3)
            if (index === 0) {
                scoreEntry.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))';
                scoreEntry.style.borderColor = 'rgba(255, 215, 0, 0.4)';
            } else if (index === 1) {
                scoreEntry.style.background = 'linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(192, 192, 192, 0.05))';
                scoreEntry.style.borderColor = 'rgba(192, 192, 192, 0.4)';
            } else if (index === 2) {
                scoreEntry.style.background = 'linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.05))';
                scoreEntry.style.borderColor = 'rgba(205, 127, 50, 0.4)';
            }

            // Emoji pour le podium
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

            scoreEntry.innerHTML = `
                <span class="pseudo">${medal} ${index + 1}. ${score.pseudo}</span>
                <span class="score">${score.score.toString().padStart(6, '0')}</span>
            `;

            this.scoresContainer.appendChild(scoreEntry);
        });

        console.log('✅ [CONTROLLER] Scores affichés:', scores.length);
    }

    /**
     * Initialise le contrôleur et charge les scores
     */
    async init() {
        console.log('🎮 [CONTROLLER] Initialisation ScoreTableController');

        // Récupérer le nom du jeu depuis l'URL
        const gameName = this.getGameFromURL();

        if (!gameName) {
            console.error('❌ [CONTROLLER] Aucun jeu spécifié dans l\'URL');
            this.showError('Aucun jeu sélectionné');
            return;
        }

        console.log('🎯 [CONTROLLER] Jeu sélectionné:', gameName);

        // Mettre à jour le titre
        if (this.gameTitle) {
            this.gameTitle.textContent = `Top 10 - ${gameName}`;
        }

        // Afficher le chargement
        this.showLoading();

        try {
            // ✅ Récupérer les scores depuis l'API (route /score/top/:game)
            const scores = await this.service.fetchTopScores(gameName);

            // Vérifier si des scores existent
            if (scores.length === 0) {
                this.showNoScores(gameName);
                return;
            }

            // Afficher les scores
            this.renderScores(scores);

        } catch (error) {
            console.error('❌ [CONTROLLER] Erreur lors du chargement:', error);
            this.showError('Impossible de charger les scores');
        }
    }
}

/**
 * Fonction helper pour initialiser le contrôleur au chargement de la page
 */
export async function initScoreTable() {
    const controller = new ScoreTableController();
    await controller.init();
}

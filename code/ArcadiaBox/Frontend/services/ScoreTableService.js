/**
 * Service pour gérer les appels API liés aux scores
 */
export class ScoreTableService {
    constructor(baseUrl = 'http://localhost:3000/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Récupère tous les scores depuis l'API
     * @returns {Promise<Array>} - Liste de tous les scores
     */
    async fetchAllScores() {
        try {
            console.log('📡 [API] Récupération de tous les scores...');
            
            const response = await fetch(`${this.baseUrl}/score/allscores`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
            }
            
            const scores = await response.json();
            console.log('✅ [API] Scores récupérés:', scores.length, 'entrées');
            
            return scores;
            
        } catch (error) {
            console.error('❌ [API] Erreur lors de la récupération des scores:', error);
            throw error;
        }
    }

    /**
     * ✅ NOUVELLE MÉTHODE - Récupère le top 10 des scores pour un jeu via l'API
     * @param {string} gameName - Nom du jeu
     * @returns {Promise<Array>} - Top 10 des scores
     */
    async fetchTopScores(gameName) {
        try {
            console.log('📡 [API] Récupération du top 10 pour:', gameName);
            
            // Encoder le nom du jeu pour gérer les espaces et caractères spéciaux
            const encodedGameName = encodeURIComponent(gameName);
            
            const response = await fetch(`${this.baseUrl}/score/top/${encodedGameName}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('⚠️ [API] Aucun score trouvé pour', gameName);
                    return []; // Retourner un tableau vide au lieu de throw
                }
                throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
            }
            
            const scores = await response.json();
            console.log('✅ [API] Top scores récupérés:', scores.length, 'pour', gameName);
            
            return scores;
            
        } catch (error) {
            console.error('❌ [API] Erreur lors de la récupération du top:', error);
            throw error;
        }
    }

    /**
     * @deprecated Utiliser fetchTopScores() à la place
     * Récupère les scores filtrés par jeu (ancienne méthode - filtrage côté client)
     * @param {string} gameName - Nom du jeu à filtrer
     * @returns {Promise<Array>} - Liste des scores pour ce jeu
     */
    async fetchScoresByGame(gameName) {
        try {
            console.log('📡 [API] Récupération des scores pour:', gameName);
            
            // Récupérer tous les scores
            const allScores = await this.fetchAllScores();
            
            // Filtrer par jeu
            const filteredScores = allScores.filter(score => score.game === gameName);
            
            // Trier par score décroissant
            filteredScores.sort((a, b) => b.score - a.score);
            
            console.log('✅ [API] Scores filtrés:', filteredScores.length, 'pour', gameName);
            
            return filteredScores;
            
        } catch (error) {
            console.error('❌ [API] Erreur lors du filtrage des scores:', error);
            throw error;
        }
    }
}

export class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async createSession(gameName, userId) {
        try {
            const response = await fetch(`${this.baseUrl}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    game_name: gameName,
                    user_id: userId,
                    score: 0
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de la session');
            }

            const data = await response.json();
            return data.session_id;
        } catch (error) {
            console.error('Erreur createSession:', error);
            throw error;
        }
    }

    async updateScore(sessionId, score) {
        try {
            const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/score`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ score })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du score');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur updateScore:', error);
            // Ne pas bloquer le jeu si l'API échoue
        }
    }

    async endSession(sessionId, finalScore) {
        try {
            const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ final_score: finalScore })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la fin de session');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur endSession:', error);
        }
    }
}

// ...existing code...

function updateGameInfo(game) {
    // ...existing code...
}

async function loadGame(game) {
    try {
        // ...existing code...

        await emulatorService.start(game.rom, {
            // ...existing code...
            callbacks: {
                onScoreUpdate: (score) => {
                    scoreDisplay.textContent = score;
                },
                onLivesUpdate: (lives) => {
                    livesDisplay.textContent = lives === -1 ? 'GAME OVER' : lives;
                },
                onGameOver: async (finalScore) => {
                    // ...existing code...
                }
            }
        });

    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        alert('Erreur lors du chargement du jeu');
    }
}

async function saveScore(game, score) {
    try {
        const response = await fetch('/api/scores', {
            // ...existing code...
        });

        if (response.ok) {
            await loadLeaderboard(game.id);
        }
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde du score:', error);
    }
}

async function loadLeaderboard(gameId) {
    try {
        // ...existing code...
    } catch (error) {
        console.error('❌ Erreur lors du chargement du leaderboard:', error);
    }
}
// ...existing code...
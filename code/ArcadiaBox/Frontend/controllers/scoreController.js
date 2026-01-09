import { fetchScores } from "../services/ScoreService.js";

export async function renderScores() {
  const scoresContainer = document.getElementById("scores");

  try {
    const scores = await fetchScores();

    // Clear existing content
    scoresContainer.innerHTML = "";

    // Populate scores dynamically
    scores.slice(0, 10).forEach((score, index) => {
      const scoreEntry = document.createElement("div");
      scoreEntry.classList.add("score-entry");

      scoreEntry.innerHTML = `
        <span class="pseudo">${index + 1}. ${score.pseudo}</span>
        <span class="score">${score.score}</span>
      `;

      scoresContainer.appendChild(scoreEntry);
    });
  } catch (error) {
    scoresContainer.innerHTML = "<p>Impossible de charger les scores.</p>";
  }
}

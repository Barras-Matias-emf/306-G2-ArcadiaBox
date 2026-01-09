export class GameView {
    constructor(gameContainerId, scoreElementId) {
        this.gameContainer = document.getElementById(gameContainerId);
        this.scoreElement = document.getElementById(scoreElementId);
        this.loadingElement = null;
    }

    getGameContainer() {
        return this.gameContainer;
    }

    updateScore(score) {
        if (this.scoreElement) {
            this.scoreElement.textContent = score.toString().padStart(6, '0');
        }
    }

    showLoading(message = 'Loading ROM...') {
        this.loadingElement = this.gameContainer.querySelector('.loading');
        if (this.loadingElement) {
            this.loadingElement.textContent = message;
            this.loadingElement.style.display = 'block';
        }
    }

    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }

    showError(message) {
        if (this.loadingElement) {
            this.loadingElement.textContent = message;
            this.loadingElement.style.color = 'red';
            this.loadingElement.style.display = 'block';
        }
    }

    clearGameContainer() {
        this.gameContainer.innerHTML = '';
    }

    appendCanvas(canvas) {
        this.clearGameContainer();
        this.gameContainer.appendChild(canvas);
    }
}

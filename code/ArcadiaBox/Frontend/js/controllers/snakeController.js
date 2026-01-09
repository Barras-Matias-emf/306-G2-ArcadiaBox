// ../js/controllers/snakeController.js
import { SnakeGame, sendScore } from '../services/snakeService.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const screen = document.querySelector('.screen');

    const overlay = document.querySelector('.screen-ui');
    const playBtn = document.getElementById('play-btn');
    const restartBtn = document.getElementById('restart-btn');
    const sendScoreBtn = document.getElementById('send-score-btn');

    const CELL = 20; // taille d’une case
    let COLS = 30;
    let ROWS = 30;

    let dpr = Math.max(1, window.devicePixelRatio || 1);

    let game = null;
    let state = 'HOME'; // HOME | READY | PLAYING | GAME_OVER
    let lastTime = 0;
    const TICK_MS = 110;
    let rafId = null;

    // 🔥 ICI on fait un canvas VRAIMENT GRAND
    function resizeCanvasAndGrid() {
        const viewportWidth = window.innerWidth;

        // 👉 le jeu prend 80% de l’écran (max 900px)
        const targetSize = Math.min(viewportWidth * 0.3, 900);

        // nombre de colonnes basé sur CELL
        let cols = Math.floor(targetSize / CELL);
        cols = Math.max(20, Math.min(cols, 40)); // 20 → 40 cases

        const displaySize = cols * CELL;

        // taille visible
        canvas.style.width = `${displaySize}px`;
        canvas.style.height = `${displaySize}px`;

        // résolution réelle (net sur écran HD)
        canvas.width = displaySize * dpr;
        canvas.height = displaySize * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        COLS = cols;
        ROWS = cols;

        game = new SnakeGame(COLS, ROWS);
    }

    function clear() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }

    function drawHome() {
        clear();
        const center = (canvas.width / dpr) / 2;
        ctx.fillStyle = '#fff';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SNAKE', center, center - 30);
        ctx.font = '14px Arial';
        ctx.fillText('Clique sur Play', center, center + 10);
    }

    function drawGame() {
        clear();

        // food
        ctx.fillStyle = '#ff4d4d';
        ctx.fillRect(game.food.x * CELL, game.food.y * CELL, CELL, CELL);

        // snake
        ctx.fillStyle = '#7CFF7A';
        game.snake.forEach(s =>
            ctx.fillRect(s.x * CELL, s.y * CELL, CELL, CELL)
        );

        // score
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${game.score}`, 10, 10);
    }

    function drawGameOver() {
        drawGame();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        const center = (canvas.width / dpr) / 2;
        ctx.fillStyle = '#fff';
        ctx.font = '26px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', center, center - 10);
        ctx.font = '14px Arial';
        ctx.fillText('Clique sur Restart', center, center + 20);
    }

    function showOverlayHome() {
        overlay.classList.remove('hidden');
        playBtn.style.display = 'inline-block';
        restartBtn.style.display = 'none';
    }

    function showOverlayGameOver() {
        overlay.classList.remove('hidden');
        playBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
    }

    function hideOverlay() {
        overlay.classList.add('hidden');
    }

    function showHome() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        state = 'HOME';
        resizeCanvasAndGrid();
        drawHome();
        showOverlayHome();
    }

    function onPlayClick() {
        if (state !== 'HOME') return;
        state = 'READY';
        hideOverlay();
        drawGame();
    }

    function onRestartClick() {
        showHome();
    }

    function startPlaying(dir) {
        if (state !== 'READY') return;
        game.setDirection(dir);
        state = 'PLAYING';
        lastTime = 0;
        rafId = requestAnimationFrame(loop);
    }

    function loop(time) {
        rafId = null;
        if (state !== 'PLAYING') return;

        if (!lastTime) lastTime = time;
        if (time - lastTime >= TICK_MS) {
            game.update();
            lastTime = time;
        }

        if (game.gameOver) {
            state = 'GAME_OVER';
            showOverlayGameOver();
            drawGameOver();
            return;
        }

        drawGame();
        rafId = requestAnimationFrame(loop);
    }

    window.addEventListener('keydown', (e) => {
        const map = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 }
        };

        if (!map[e.key]) return;
        e.preventDefault();

        if (state === 'HOME') onPlayClick();
        if (state === 'READY') startPlaying(map[e.key]);
        else if (state === 'PLAYING') game.setDirection(map[e.key]);
    });

    playBtn.addEventListener('click', onPlayClick);
    restartBtn.addEventListener('click', onRestartClick);

    sendScoreBtn.addEventListener('click', async () => {
        await sendScore(game.score);
        alert('Score envoyé ! (placeholder)');
    });

    window.addEventListener('resize', () => {
        dpr = Math.max(1, window.devicePixelRatio || 1);
        showHome();
    });

    resizeCanvasAndGrid();
    showHome();
});

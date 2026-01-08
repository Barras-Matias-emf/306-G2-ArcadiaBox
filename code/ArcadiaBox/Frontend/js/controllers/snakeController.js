// ../js/controllers/snakeController.js
import { SnakeGame, sendScore } from '../services/snakeService.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    const playBtn = document.getElementById('play-btn');
    const restartBtn = document.getElementById('restart-btn');
    const screenUI = document.querySelector('.screen-ui');
    const sendScoreBtn = document.getElementById('send-score-btn');

    const CELL = 20;
    const COLS = Math.floor(canvas.width / CELL);
    const ROWS = Math.floor(canvas.height / CELL);

    const game = new SnakeGame(COLS, ROWS);

    let state = 'HOME'; // HOME | READY | PLAYING | GAME_OVER
    let lastTime = 0;
    const TICK_MS = 120;

    function clear() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawHome() {
        clear();
        ctx.fillStyle = '#fff';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SNAKE', canvas.width / 2, canvas.height / 2 - 24);
        ctx.font = '12px Arial';
        ctx.fillText('Clique sur Play', canvas.width / 2, canvas.height / 2 + 6);
    }

    function drawGame() {
        clear();

        // food
        ctx.fillStyle = '#ff4d4d';
        ctx.fillRect(game.food.x * CELL, game.food.y * CELL, CELL, CELL);

        // snake
        ctx.fillStyle = '#7CFF7A';
        game.snake.forEach(s => ctx.fillRect(s.x * CELL, s.y * CELL, CELL, CELL));

        // score
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${game.score}`, 8, 8);
    }

    function drawGameOver() {
        drawGame();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 12);
        ctx.font = '12px Arial';
        ctx.fillText('Clique sur Restart', canvas.width / 2, canvas.height / 2 + 14);
    }

    function showOverlayForHome() {
        screenUI.classList.remove('hidden');
        playBtn.style.display = 'inline-block';
        restartBtn.style.display = 'none';
        screenUI.setAttribute('aria-hidden', 'false');
    }

    function showOverlayForGameOver() {
        screenUI.classList.remove('hidden');
        playBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        screenUI.setAttribute('aria-hidden', 'false');
    }

    function hideOverlay() {
        screenUI.classList.add('hidden');
        screenUI.setAttribute('aria-hidden', 'true');
    }

    function showHome() {
        state = 'HOME';
        game.reset();
        drawHome();
        showOverlayForHome();
    }

    function onPlayClick() {
        if (state !== 'HOME') return;
        state = 'READY';
        // display game but don't start moving
        hideOverlay();
        drawGame();
    }

    function onRestartClick() {
        // restart must bring back HOME screen
        showHome();
    }

    function startPlayingWithDirection(dir) {
        if (state !== 'READY') return;
        game.setDirection(dir);
        state = 'PLAYING';
        lastTime = 0;
        requestAnimationFrame(loop);
    }

    function loop(time) {
        if (state !== 'PLAYING') return;

        if (!lastTime) lastTime = time;

        if (time - lastTime >= TICK_MS) {
            game.update();
            lastTime = time;
        }

        if (game.gameOver) {
            state = 'GAME_OVER';
            showOverlayForGameOver();
            drawGameOver();
            return;
        }

        drawGame();
        requestAnimationFrame(loop);
    }

    // events
    playBtn.addEventListener('click', onPlayClick);
    restartBtn.addEventListener('click', onRestartClick);

    window.addEventListener('keydown', (e) => {
        const allowed = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
        if (!allowed.includes(e.key)) return;
        e.preventDefault();

        const map = {
            ArrowUp:    { x: 0, y: -1 },
            ArrowDown:  { x: 0, y: 1 },
            ArrowLeft:  { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 }
        };

        if (state === 'READY') {
            startPlayingWithDirection(map[e.key]);
        } else if (state === 'PLAYING') {
            game.setDirection(map[e.key]);
        }
    });

    // send score button (outside)
    if (sendScoreBtn) {
        sendScoreBtn.addEventListener('click', async () => {
            try {
                await sendScore(game.score);
                alert('Score envoyé !');
            } catch (err) {
                console.error(err);
                alert('Erreur envoi score');
            }
        });
    }

    // init
    showHome();
});

// ../js/services/snakeService.js
export class SnakeGame {
    constructor(cols = 15, rows = 15) {
        this.cols = cols;
        this.rows = rows;
        this.reset();
    }

    reset() {
        const midX = Math.floor(this.cols / 2);
        const midY = Math.floor(this.rows / 2);
        this.snake = [{ x: midX, y: midY }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.gameOver = false;
        this.spawnFood();
    }

    setDirection(dir) {
        // Prevent reversing directly
        if (this.direction.x + dir.x === 0 && this.direction.y + dir.y === 0) {
            return;
        }
        this.nextDirection = dir;
    }

    spawnFood() {
        let tries = 0;
        do {
            this.food = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
            tries++;
            if (tries > 200) break;
        } while (this.snake.some(s => s.x === this.food.x && s.y === this.food.y));
    }

    update() {
        if (this.gameOver) return;

        // apply nextDirection only when moving
        if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
            this.direction = this.nextDirection;
        }

        if (this.direction.x === 0 && this.direction.y === 0) return; // paused / not started

        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // walls
        if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
            this.gameOver = true;
            return;
        }

        // self collision
        if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.gameOver = true;
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 1;
            this.spawnFood();
        } else {
            this.snake.pop();
        }
    }
}

/**
 * sendScore: placeholder pour envoyer le score à une API.
 */
export async function sendScore(score) {
    console.log('Envoi du score (placeholder):', score);
    return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 300));
}

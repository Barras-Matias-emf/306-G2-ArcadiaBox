export class GameModel {
    constructor() {
        this.sessionId = null;
        this.score = 0;
        this.userId = null;
        this.gameName = 'mario';
        this.startTime = null;
        this.isPlaying = false;
    }

    setSessionId(sessionId) {
        this.sessionId = sessionId;
    }

    getSessionId() {
        return this.sessionId;
    }

    setScore(score) {
        this.score = score;
    }

    getScore() {
        return this.score;
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    startSession() {
        this.isPlaying = true;
        this.startTime = new Date();
    }

    endSession() {
        this.isPlaying = false;
    }

    isSessionActive() {
        return this.isPlaying;
    }

    getSessionData() {
        return {
            sessionId: this.sessionId,
            score: this.score,
            userId: this.userId,
            gameName: this.gameName,
            startTime: this.startTime,
            isPlaying: this.isPlaying
        };
    }
}

import { TicTacToe } from "./ttt.js";

export class Game {
  constructor(createSessionId) {
    this.gameSessions = new Map();
    this.playersToGameSessions = new Map();
    this.createSessionId = createSessionId;
  }

  isOpponentFound(waitingPlayers) {
    return waitingPlayers.size % 2 === 0;
  }

  generatePlayerSessions() {
    return this.createSessionId();
  }

  storeGameSessions(value) {
    const gameId = this.createSessionId();
    this.gameSessions.set(gameId, value);
    return gameId;
  }

  storePlayerSessions(waitingPlayers, formData) {
    const playerName = formData.get("name");
    const sessionId = this.generatePlayerSessions();
    waitingPlayers.set(sessionId, playerName);

    return sessionId;
  }

  getGameObject(sessionId) {
    const gameId = this.playersToGameSessions.get(sessionId);
    return this.gameSessions.get(gameId);
  }

  mapSessionsWithGame(sessionId1, sessionId2, gameId) {
    this.playersToGameSessions.set(sessionId1, gameId);
    this.playersToGameSessions.set(sessionId2, gameId);
  }

  extractValues(set) {
    const values = [];
    for (const item of set) {
      values.push(item);
    }
    return values;
  }

  resetGame(sessionId) {
    const game = this.getGameObject(sessionId);
    game.reset();
  }

  setUpGame(waitingPlayers) {
    const [player1, player2] = this.extractValues(waitingPlayers.values());
    const [sessionId1, sessionId2] = this.extractValues(waitingPlayers.keys());
    const ttt = new TicTacToe(player1, player2);
    const gameId = this.storeGameSessions(ttt);
    this.mapSessionsWithGame(sessionId1, sessionId2, gameId);
  }
}

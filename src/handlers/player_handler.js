export class Player {
  isOpponentFound(waitingPlayers) {
    return waitingPlayers.size % 2 === 0;
  }
}

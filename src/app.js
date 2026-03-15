import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";
import {
  logIn,
  isSecondPlayerJoin,
  getGameBoard,
  markBoard,
  gameStatus,
  playAgain,
} from "./handlers/handler.js";
import { getCookie } from "hono/cookie";

const setContext = (game, waitingPlayers) => async (context, next) => {
  context.game = game;
  context.waitingPlayers = waitingPlayers;
  await next();
};

const validateCurrentPlayer = async (context, next) => {
  const sessionId = getCookie(context, "sessionId");
  console.log(sessionId,"------------sessionId");
  const game = context.game.getGameObject(parseInt(sessionId));
  const actualPlayer = game.getCurrentPlayer();
  const currentPlayer = context.waitingPlayers.get(parseInt(sessionId));

  if (currentPlayer !== actualPlayer) {
    return game.getBoard();
  }

  await next();
};

export const createApp = (game, waitingPlayers) => {
  const app = new Hono();
  app.use(logger());
  app.use(setContext(game, waitingPlayers));

  app.post("/log-in", logIn);
  app.get("/get-opponent", isSecondPlayerJoin);
  app.get("/game-board", getGameBoard);
  app.use("/mark-cell/row/:row/col/:col", validateCurrentPlayer);
  app.patch("/mark-cell/row/:row/col/:col", markBoard);
  app.get("/is-game-over", gameStatus);
  app.post("/play-again", playAgain);

  app.get(
    "*",
    serveStatic({
      root: "./public",
    })
  );

  return app;
};

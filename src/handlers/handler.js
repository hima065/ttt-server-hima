import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Game } from "../users.js";

export const logIn = async (context) => {
  const { waitingPlayers, game } = context;
  const formData = await context.req.formData();
  const sessionId = await game.storePlayerSessions(waitingPlayers, formData);

  const isOpponentFound = game.isOpponentFound(waitingPlayers);
  setCookie(context, "sessionId", sessionId);

  if (isOpponentFound) {
    game.setUpGame(waitingPlayers);
  }

  return context.redirect("/waiting.html", 303);
};

export const isSecondPlayerJoin = (context) => {
  const isOpponentFound = context.game.isOpponentFound(context.waitingPlayers);
  let path = "*";

  if (isOpponentFound) {
    path = "/tic_tac_toe.html";
  }

  return context.text(path);
};

export const getGameBoard = (context) => {
  const sessionId = getCookie(context, "sessionId");
  const game = context.game.getGameObject(parseInt(sessionId));
  const board = globalThis.board ?? game.getBoard();

  return context.json(board);
};

export const markBoard = (context) => {
  const row = context.req.param("row");
  const col = context.req.param("col");
  const sessionId = getCookie(context, "sessionId");

  const game =
    globalThis.gameObj ?? context.game.getGameObject(parseInt(sessionId));
  game.mark(parseInt(row), parseInt(col));

  const body = { status: "success" };

  return context.body(JSON.stringify(body), 200, {
    "content-type": "application/json",
  });
};

const json = (data) => JSON.stringify(data);

export const gameStatus = (context) => {
  let isGameContinued = true;
  let winner = null;

  const sessionId = getCookie(context, "sessionId");
  const game = context.game.getGameObject(parseInt(sessionId));

  const isGameOver = game.isGameOver();
  if (!isGameOver)
    return (
      context.body(json({ isGameContinued }), 200),
      {
        "content-type": "application/json",
      }
    );

  isGameContinued = false;

  const isDraw = game.isDraw();
  if (!isDraw) winner = game.getWinner();

  const body = { isGameContinued, winner };
  return context.body(json(body), 200, {
    "content-type": "application/json",
  });
};

export const playAgain = async (context) => {
  const reqBody = await context.req.json();
  const sessionId = getCookie(context, "sessionId");

  let path = "/waiting.html";
  if (reqBody.playerResponse) {
    context.game.resetGame(parseInt(sessionId));
    return context.text(path);
  }
  path = "/";
  deleteCookie(context, "sessionId");
  return context.text(path);
};

import { assertEquals } from "jsr:@std/assert";
import { beforeAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { createApp } from "../src/app.js";
import { Game } from "../src/users.js";
import { TicTacToe } from "../src/ttt.js";

const createId = () => {
  let id = 0;
  return () => id++;
};

describe("log-in", () => {
  it("should respond with redirection", async () => {
    const game = new Game(createId());
    const waitingPlayers = new Map();

    const app = createApp(game, waitingPlayers);
    const formData = new FormData();

    formData.set("name", "madhavi");
    const req = new Request("http://localhost:8000/log-in", {
      method: "POST",
      body: formData,
    });

    const response = await app.request(req);
    assertEquals(response.status, 303);
  });
});

describe("isSecondPlayerJoin", () => {
  it("should return the * as path when odd number of players", async () => {
    const game = new Game(createId());
    const waitingPlayers = new Map();

    waitingPlayers.set(1, "madhavi");
    const app = createApp(game, waitingPlayers);
    const response = await app.request("/get-opponent");

    const text = await response.text();
    assertEquals(response.status, 200);
    assertEquals(text, "*");
  });

  it("should return the redirecteod path when even number of players", async () => {
    const game = new Game(createId());
    const waitingPlayers = new Map();

    waitingPlayers.set(1, "madhavi");
    waitingPlayers.set(2, "malli");
    const app = createApp(game, waitingPlayers);
    const response = await app.request("/get-opponent");

    const text = await response.text();
    assertEquals(response.status, 200);
    assertEquals(text, "/tic_tac_toe.html");
  });
});

describe("mark-board", () => {
  const ttt = new TicTacToe("p1", "p2");
  const game = new Game(createId());
  const waitingPlayers = new Map();
  const app = createApp(game, waitingPlayers);

  beforeEach(() => {
    waitingPlayers.set(1, "p1");
    waitingPlayers.set(2, "p2");
    game.gameSessions.set(3, ttt);
    game.mapSessionsWithGame(1, 2, 3);
  });

  it("should respond with json success message", async () => {
    const response = await app.request("/mark-cell/row/1/col/1", {
      method: "PATCH",
      headers: {
        cookie: `sessionId=1`,
      },
    });
    const json = await response.json();

    assertEquals(response.status, 200);
    assertEquals(json.status, "success");
    assertEquals(response.headers.get("content-type"), "application/json");
  });

  it("should update the board", async () => {
    await app.request("/mark-cell/row/1/col/1", {
      method: "PATCH",
      headers: {
        cookie: `sessionId=1`,
      },
    });
    const expected = [
      [null, null, null],
      [null, "X", null],
      [null, null, null],
    ];
    const actual = ttt.getBoard();

    assertEquals(actual, expected);
  });
});

describe("getBoard", () => {
  const ttt = new TicTacToe("p1", "p2");
  const game = new Game(createId());
  const waitingPlayers = new Map();
  const app = createApp(game, waitingPlayers);

  beforeEach(() => {
    waitingPlayers.set(1, "p1");
    waitingPlayers.set(2, "p2");
    game.gameSessions.set(3, ttt);
    game.mapSessionsWithGame(1, 2, 3);
    ttt.mark(0, 0);
    ttt.mark(1, 1);
    ttt.mark(2, 2);
  });

  it("should return the successs message", async () => {
    const response = await app.request("/game-board", {
      headers: {
        cookie: `sessionId=1`,
      },
    });
    const expected = [
      ["X", null, null],
      [null, "O", null],
      [null, null, "X"],
    ];
    const json = await response.json();
    assertEquals(json, expected);
    assertEquals(response.status, 200);
    assertEquals(response.headers.get("content-type"), "application/json");
  });
});

describe("play-again", () => {
  const game = new Game(createId());
  const waitingPlayers = new Map();
  const app = createApp(game, waitingPlayers);
  const ttt = new TicTacToe("p1", "p2");

  beforeEach(() => {
    waitingPlayers.set(1, "p1");
    waitingPlayers.set(2, "p2");
    game.gameSessions.set(3, ttt);
    game.mapSessionsWithGame(1, 2, 3);
  });

  it("should return the path as / if user confirm message is false", async () => {
    const reqBody = JSON.stringify({ playerResponse: false });
    const response = await app.request("/play-again", {
      body: reqBody,
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "sessionId=1",
      },
    });

    const text = await response.text();
    assertEquals(text, "/");
  });
  it("should return the path as /waiting.htnl if user confirm message is false", async () => {
    const reqBody = JSON.stringify({ playerResponse: true });
    const response = await app.request("/play-again", {
      body: reqBody,
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "sessionId=1",
      },
    });

    const text = await response.text();
    assertEquals(text, "/waiting.html");
  });
});

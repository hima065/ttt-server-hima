import { createApp } from "./app.js";
import { Game } from "./users.js";

export const createId = () => {
  let id = 0;
  return () => id++;
};

const main = () => {
  const game = new Game(createId());
  const waitingPlayers = new Map();
  const app = createApp(game, waitingPlayers);

  const port = Deno.env.get("PORT") || 8082;
  Deno.serve({ port }, app.fetch);
};

main();

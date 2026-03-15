const displayBoard = async () => {
  const response = await fetch("/game-board");
  const moves = await response.json();

  const cells = document.querySelectorAll(".child");
  let index = 0;
  moves.forEach((row) =>
    row.forEach((cell) => {
      cells[index].textContent = cell;
      index++;
    })
  );
};

const rendorErrorMessage = (message) => {
  const h1 = document.createElement("h1");
  const body = document.querySelector("body");
  h1.textContent = message;
  body.append(h1);
};

const handleResponse = (responseBody) => {
  if (responseBody.status !== "success") {
    return rendorErrorMessage(responseBody.reason);
  }

  return displayBoard();
};

const displayMessage = async (message) => {
  const confirmMessage = confirm(`${message}. do you want to play again`);
  const json = JSON.stringify(confirmMessage);
  const response = await fetch("/play-again", {
    method: "POST",
    body: json,
  });
  const path = await response.text();
  globalThis.location.href = path;
};

const gameStatus = async (interValId) => {
  const response = await fetch("/is-game-over");
  const status = await response.json();
  console.log(status, "status");
  if (!status.isGameContinued) {
    // displayBoard();
    const message = status.winner ? status.winner + " won " : "Game Draw";
    displayMessage(message);
    clearInterval(interValId);
  }
};

const mark = async (event, interValId) => {
  const id = event.target.id;
  const [row, col] = id.split(",");
  // deno-lint-ignore no-unused-vars
  const response = await fetch(`/mark-cell/row/${row}/col/${col}`, {
    method: "PATCH",
  });
  gameStatus(interValId);
};

const main = () => {
  const interValId = setInterval(displayBoard, 500);
  const board = document.querySelector(".board");
  board.addEventListener("click", (event) => mark(event, interValId));
};

globalThis.onload = main;

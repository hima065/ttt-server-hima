const sendWaitingRequest = async () => {
  const response = await fetch("/get-opponent");
  const res = await response.text();
  console.log("-----------------------");
  if (res === "/tic_tac_toe.html")
    globalThis.location.href = "/tic_tac_toe.html";

  setTimeout(sendWaitingRequest, 100);
};

const main = () => {
  sendWaitingRequest();
};

globalThis.onload = main;

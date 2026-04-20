"use strict";

const cells = Array.from(document.querySelectorAll(".cell"));
const statusEl = document.getElementById("status");
const turnEl = document.getElementById("turn");
const timerEl = document.getElementById("timer");

const pieceX = document.getElementById("pieceX");
const pieceO = document.getElementById("pieceO");
const restartBtn = document.getElementById("restartBtn");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");

/* GIF overlay */
const gifOverlay = document.getElementById("gifOverlay");
const gifImage = document.getElementById("gifImage");

/* Config */
const TURN_LIMIT_SECONDS = 120;

/* State */
let board;
let currentPlayer;
let gameActive;

let remainingSeconds;
let timerId = null;

let scoreX = 0;
let scoreO = 0;

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/* ---------------------------
   GIF helpers
---------------------------- */
function showWinGif() {
  gifImage.src = "gif/win.gif";   // <-- la tua GIF (rinominata win.gif)
  gifOverlay.classList.remove("hidden");
  gifOverlay.setAttribute("aria-hidden", "false");
}

function hideGif() {
  gifOverlay.classList.add("hidden");
  gifOverlay.setAttribute("aria-hidden", "true");
  gifImage.src = "";
}

/* click sull’overlay per chiuderlo */
gifOverlay.addEventListener("click", hideGif);

/* ---------------------------
   Drag start sulle pedine
---------------------------- */
[pieceX, pieceO].forEach(piece => {
  piece.addEventListener("dragstart", (e) => {
    if (!gameActive) { e.preventDefault(); return; }

    const player = piece.dataset.player;
    if (player !== currentPlayer) { e.preventDefault(); return; }

    e.dataTransfer.setData("text/plain", player);
  });
});

/* ---------------------------
   Drop sulle celle
---------------------------- */
cells.forEach(cell => {
  cell.addEventListener("dragover", (e) => {
    if (!gameActive) return;

    const i = Number(cell.dataset.index);
    if (board[i] !== "") return;

    e.preventDefault();
    cell.classList.add("drop-ok");
  });

  cell.addEventListener("dragleave", () => {
    cell.classList.remove("drop-ok");
  });

  cell.addEventListener("drop", (e) => {
    cell.classList.remove("drop-ok");
    if (!gameActive) return;

    const i = Number(cell.dataset.index);
    if (board[i] !== "") return;

    const player = e.dataTransfer.getData("text/plain");
    if (player !== currentPlayer) return;

    placeMove(i, player);
  });
});

/* ---------------------------
   Game logic
---------------------------- */
function placeMove(index, player) {
  board[index] = player;

  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add("played", player.toLowerCase());

  const winLine = getWinningLine(board);
  if (winLine) {
    winLine.forEach(idx => cells[idx].classList.add("winner"));
    registerWin(player);
    showWinGif();
    endGame(`Ha vinto ${player}!`);
    return;
  }

  if (board.every(v => v !== "")) {
    endGame("Pareggio!");
    return;
  }

  currentPlayer = (currentPlayer === "X") ? "O" : "X";
  updateTurnUI();
  startTurnTimer();
}

function getWinningLine(b) {
  for (const [a,b1,c] of WIN_LINES) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return [a,b1,c];
  }
  return null;
}

/* ---------------------------
   Score
---------------------------- */
function registerWin(player) {
  if (player === "X") {
    scoreX++;
    scoreXEl.textContent = scoreX;
  } else {
    scoreO++;
    scoreOEl.textContent = scoreO;
  }
}

/* ---------------------------
   UI turn + enable pieces
---------------------------- */
function updateTurnUI() {
  turnEl.textContent = currentPlayer;
  statusEl.innerHTML = `Turno: <strong id="turn">${currentPlayer}</strong>`;

  const xTurn = currentPlayer === "X";
  setPieceEnabled(pieceX, xTurn);
  setPieceEnabled(pieceO, !xTurn);
}

function setPieceEnabled(piece, enabled) {
  piece.classList.toggle("disabled", !enabled);
  piece.setAttribute("draggable", enabled ? "true" : "false");
}

/* ---------------------------
   Turn timer
---------------------------- */
function startTurnTimer() {
  stopTurnTimer();
  remainingSeconds = TURN_LIMIT_SECONDS;
  renderTimer();

  timerId = setInterval(() => {
    if (!gameActive) { stopTurnTimer(); return; }

    remainingSeconds--;
    renderTimer();

    if (remainingSeconds <= 0) {
      const winner = currentPlayer === "X" ? "O" : "X";
      registerWin(winner);
      showWinGif();
      endGame(`Tempo scaduto! Vince ${winner}.`);
    }
  }, 1000);
}

function stopTurnTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function renderTimer() {
  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const ss = String(remainingSeconds % 60).padStart(2, "0");
  timerEl.textContent = `${mm}:${ss}`;
}

/* ---------------------------
   End game
---------------------------- */
function endGame(message) {
  gameActive = false;
  stopTurnTimer();

  setPieceEnabled(pieceX, false);
  setPieceEnabled(pieceO, false);

  statusEl.textContent = message;
  alert(message);
}

/* ---------------------------
   Restart
---------------------------- */
restartBtn.addEventListener("click", resetGame);

function resetGame() {
  hideGif();

  board = Array(9).fill("");
  gameActive = true;

  // turno iniziale casuale
  currentPlayer = Math.random() < 0.5 ? "X" : "O";

  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("played", "x", "o", "winner", "drop-ok");
  });

  updateTurnUI();
  startTurnTimer();
}

/* Init */
resetGame();

"use strict";

const cells = Array.from(document.querySelectorAll(".cell"));
const statusEl = document.getElementById("status");
const turnEl = document.getElementById("turn");
const timerEl = document.getElementById("timer");
const restartBtn = document.getElementById("restartBtn");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");

const TURN_LIMIT_SECONDS = 120;

let board;
let currentPlayer;
let gameActive;

let remainingSeconds;
let timerId = null;

/* SCORE */
let scoreX = 0;
let scoreO = 0;

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/* CLICK CELLE */
cells.forEach(cell => {
  cell.addEventListener("click", () => {
    if (!gameActive) return;

    const i = Number(cell.dataset.index);
    if (board[i] !== "") return;

    placeMove(i, currentPlayer);
  });
});

function placeMove(index, player) {
  board[index] = player;

  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add("played", player.toLowerCase());

  const winLine = getWinningLine(board);
  if (winLine) {
    winLine.forEach(i => cells[i].classList.add("winner"));
    registerWin(player);
    endGame(`Ha vinto ${player}!`);
    return;
  }

  if (board.every(v => v !== "")) {
    endGame("Pareggio!");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnUI();
  startTurnTimer();
}

function getWinningLine(b) {
  for (const [a,b1,c] of WIN_LINES) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return [a,b1,c];
    }
  }
  return null;
}

/* TIMER */
function startTurnTimer() {
  stopTurnTimer();
  remainingSeconds = TURN_LIMIT_SECONDS;
  renderTimer();

  timerId = setInterval(() => {
    remainingSeconds--;
    renderTimer();

    if (remainingSeconds <= 0) {
      const winner = currentPlayer === "X" ? "O" : "X";
      registerWin(winner);
      endGame(`Tempo scaduto! Vince ${winner}.`);
    }
  }, 1000);
}

function stopTurnTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function renderTimer() {
  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2,"0");
  const ss = String(remainingSeconds % 60).padStart(2,"0");
  timerEl.textContent = `${mm}:${ss}`;
}

/* SCORE */
function registerWin(player) {
  if (player === "X") {
    scoreX++;
    scoreXEl.textContent = scoreX;
  } else {
    scoreO++;
    scoreOEl.textContent = scoreO;
  }
}

/* UI */
function updateTurnUI() {
  turnEl.textContent = currentPlayer;
  statusEl.innerHTML = `Turno: <strong id="turn">${currentPlayer}</strong>`;
}

/* FINE PARTITA */
function endGame(message) {
  gameActive = false;
  stopTurnTimer();
  statusEl.textContent = message;
  alert(message);
}

/* RESTART */
restartBtn.addEventListener("click", resetGame);

function resetGame() {
  board = Array(9).fill("");
  gameActive = true;
  currentPlayer = Math.random() < 0.5 ? "X" : "O";

  cells.forEach(c => {
    c.textContent = "";
    c.classList.remove("played","x","o","winner");
  });

  updateTurnUI();
  startTurnTimer();
}

/* INIT */
resetGame();

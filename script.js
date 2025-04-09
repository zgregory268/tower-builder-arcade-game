const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const timerDisplay = document.getElementById("timer");

const soundSuccess = document.getElementById("soundSuccess");
const soundFail = document.getElementById("soundFail");
const soundLevelUp = document.getElementById("soundLevelUp");
const soundRain = document.getElementById("soundRain");
const soundSun = document.getElementById("soundSun");
const soundWind = document.getElementById("soundWind");

let blocks = [];
let currentBlock = null;
let blockSpeed = 2;
let gameInterval;
let score = 0;
let level = 1;
let timeLeft = 60;
let isGameOver = false;
let perfectStreak = 0;

const blockWidth = 100;
const blockHeight = 20;

function startGame() {
  resetGame();
  createBlock();
  gameInterval = setInterval(updateGame, 1000 / 60);
  startTimer();
  startButton.style.display = "none";
}

function resetGame() {
  blocks = [];
  currentBlock = null;
  blockSpeed = 2;
  score = 0;
  level = 1;
  timeLeft = 60;
  isGameOver = false;
  perfectStreak = 0;
  updateScore();
  updateLevel();
  updateTimer();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.body.style.backgroundColor = "black";
  soundRain.pause(); soundSun.pause(); soundWind.pause();
}

function createBlock() {
  const x = 0;
  const y = canvas.height - (blocks.length + 1) * blockHeight;
  currentBlock = { x, y, width: blockWidth, height: blockHeight, direction: 1 };
}

function placeBlock() {
  if (!currentBlock) return;
  const lastBlock = blocks[blocks.length - 1];
  let isPerfect = !lastBlock || Math.abs(currentBlock.x - lastBlock.x) <= 10;

  if (isPerfect) {
    blocks.push({ ...currentBlock });
    soundSuccess.play();
    score += 10;
    perfectStreak++;
    if (perfectStreak >= 3) score += 5;
    if (blocks.length % 5 === 0) {
      level++;
      blockSpeed += 0.5;
      soundLevelUp.play();
    }
  } else {
    soundFail.play();
    score -= 5;
    perfectStreak = 0;
  }

  updateScore();
  updateLevel();
  updateEnvironment(blocks.length);
  createBlock();
}

function updateGame() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const block of blocks) drawBlock(block);

  if (currentBlock) {
    currentBlock.x += currentBlock.direction * blockSpeed;
    if (currentBlock.x + currentBlock.width > canvas.width || currentBlock.x < 0)
      currentBlock.direction *= -1;
    drawBlock(currentBlock);
  }
}

function drawBlock(block) {
  ctx.fillStyle = "yellow";
  ctx.fillRect(block.x, block.y, block.width, block.height);
}

function startTimer() {
  const countdown = setInterval(() => {
    if (isGameOver) {
      clearInterval(countdown);
      return;
    }
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(countdown);
      endGame();
    }
  }, 1000);
}

function endGame() {
  isGameOver = true;
  clearInterval(gameInterval);
  startButton.innerText = "Play Again";
  startButton.style.display = "inline-block";
  soundRain.pause(); soundSun.pause(); soundWind.pause();
}

function updateEnvironment(height) {
  if (height >= 20) {
    document.body.style.backgroundColor = "#002233";
    soundRain.play(); soundSun.pause(); soundWind.pause();
  } else if (height >= 10) {
    document.body.style.backgroundColor = "#000000";
    soundRain.pause(); soundSun.pause(); soundWind.play();
  } else {
    document.body.style.backgroundColor = "#222211";
    soundRain.pause(); soundWind.pause(); soundSun.play();
  }
}

function updateScore() {
  scoreDisplay.textContent = score;
  scoreDisplay.style.color = score >= 0 ? "lime" : "red";
  scoreDisplay.style.transform = "scale(1.2)";
  setTimeout(() => (scoreDisplay.style.transform = "scale(1)"), 200);
}

function updateLevel() {
  levelDisplay.textContent = level;
}

function updateTimer() {
  timerDisplay.textContent = timeLeft;
}

canvas.addEventListener("click", placeBlock);
startButton.addEventListener("click", startGame);
document.addEventListener("keydown", e => {
  if (e.code === "Space") placeBlock();
});

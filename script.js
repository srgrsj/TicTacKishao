// script.js
const canvas = document.getElementById('gameBoard');
const context = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startButton = document.getElementById('startButton');
const resultDiv = document.getElementById('result');
const backgroundMusic = document.getElementById('backgroundMusic');
const restartButton = document.getElementById('restartButton');

const size = 3;
const cellSize = 100;
const player = 'X';
const bot = 'O';
let board;
let currentPlayer;

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

canvas.addEventListener('click', (event) => {
    if (currentPlayer !== player) return;
    const { x, y } = getCursorPosition(event);
    const cell = getCell(x, y);
    if (board[cell.row][cell.col] === '') {
        makeMove(cell.row, cell.col, player);
        if (!isGameOver()) {
            botMove();
        }
    }
});

function startGame() {
    board = Array(size).fill('').map(() => Array(size).fill(''));
    currentPlayer = player;
    resultDiv.textContent = '';
    restartButton.classList.add('hidden');
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    drawBoard();
    backgroundMusic.play();
}

function restartGame() {
    startGame();
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#000000';
    for (let i = 1; i < size; i++) {
        context.beginPath();
        context.moveTo(i * cellSize, 0);
        context.lineTo(i * cellSize, canvas.height);
        context.stroke();
        context.beginPath();
        context.moveTo(0, i * cellSize);
        context.lineTo(canvas.width, i * cellSize);
        context.stroke();
    }
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] !== '') {
                drawMark(row, col, board[row][col]);
            }
        }
    }
}

function drawMark(row, col, mark) {
    context.font = '80px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#000000';
    const x = col * cellSize + cellSize / 2;
    const y = row * cellSize + cellSize / 2;
    context.fillText(mark, x, y);
}

function getCursorPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
}

function getCell(x, y) {
    const row = Math.floor(y / cellSize);
    const col = Math.floor(x / cellSize);
    return { row, col };
}

function makeMove(row, col, mark) {
    board[row][col] = mark;
    drawBoard();
    currentPlayer = currentPlayer === player ? bot : player;
}

function botMove() {
    const bestMove = minimax(board, bot);
    makeMove(bestMove.row, bestMove.col, bot);
    isGameOver();
}

function minimax(board, currentPlayer) {
    const winner = getWinner();
    if (winner === player) return { score: -10 };
    if (winner === bot) return { score: 10 };
    if (isBoardFull()) return { score: 0 };

    const moves = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                board[row][col] = currentPlayer;
                const result = minimax(board, currentPlayer === player ? bot : player);
                moves.push({ row, col, score: result.score });
                board[row][col] = '';
            }
        }
    }

    let bestMove;
    if (currentPlayer === bot) {
        let bestScore = -Infinity;
        for (const move of moves) {
            if (move.score > bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    } else {
        let bestScore = Infinity;
        for (const move of moves) {
            if (move.score < bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    }
    return bestMove;
}

function isBoardFull() {
    return board.flat().every(cell => cell !== '');
}

function getWinner() {
    const lines = [
        // Rows
        [ [0, 0], [0, 1], [0, 2] ],
        [ [1, 0], [1, 1], [1, 2] ],
        [ [2, 0], [2, 1], [2, 2] ],
        // Columns
        [ [0, 0], [1, 0], [2, 0] ],
        [ [0, 1], [1, 1], [2, 1] ],
        // Diagonals
        [ [0, 0], [1, 1], [2, 2] ],
        [ [0, 2], [1, 1], [2, 0] ]
    ];
    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a[0]][a[1]] && board[a[0]][a[1]] === board[b[0]][b[1]] && board[a[0]][a[1]] === board[c[0]][c[1]]) {
            return board[a[0]][a[1]];
        }
    }
    return null;
}

function isGameOver() {
    const winner = getWinner();
    if (winner) {
        resultDiv.textContent = winner === player ? 'ТЫ ПОБЕДА!' : 'ПРОР!';

        restartButton.classList.remove('hidden');
        return true;
    }
    if (isBoardFull()) {
        resultDiv.textContent = 'Ничья!';

        restartButton.classList.remove('hidden');
        return true;
    }
    return false;
}

// --- Elementos do DOM ---
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetButton = document.getElementById('resetButton');

// --- Variáveis do Jogo ---
let board = [];
const players = ['I', 'X', 'O'];
let currentPlayerIndex = 0;
let playerPieceHistory = {
    'I': [], // Array que funciona como deque: [mais_antiga, ..., mais_recente]
    'X': [],
    'O': []
};
const MAX_PIECES_PER_PLAYER = 4;
const WIN_CONDITION_LENGTH = 3;
let gameOver = false;
let winningCells = []; // Para armazenar as células vencedoras para destaque

// --- Funções do Jogo ---

function initGame() {
    board = Array(4).fill(null).map(() => Array(4).fill(' '));
    currentPlayerIndex = 0;
    playerPieceHistory = {
        'I': [],
        'X': [],
        'O': []
    };
    gameOver = false;
    winningCells = [];
    renderBoard();
    updateStatus(`Vez do jogador ${getCurrentPlayer()}`);
}

function getCurrentPlayer() {
    return players[currentPlayerIndex];
}

function updateStatus(message) {
    statusElement.textContent = message;
}

function renderBoard() {
    boardElement.innerHTML = ''; // Limpa o tabuleiro anterior
    board.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            cell.textContent = cellValue !== ' ' ? cellValue : '';

            if (cellValue !== ' ') {
                cell.classList.add(`occupied-${cellValue}`);
            }
            if (winningCells.some(wc => wc.row === rowIndex && wc.col === colIndex)) {
                cell.classList.add('winning-cell');
            }

            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        });
    });
}

function handleCellClick(event) {
    if (gameOver) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (board[row][col] !== ' ') {
        updateStatus("Essa posição já está ocupada! Tente novamente.");
        return;
    }

    makeMove(row, col);
}

function makeMove(row, col) {
    const currentPlayer = getCurrentPlayer();
    const history = playerPieceHistory[currentPlayer];

    // 1. Gerenciar o limite de peças (descartar a mais antiga se necessário)
    if (history.length >= MAX_PIECES_PER_PLAYER) {
        const oldestPiece = history.shift(); // Remove a peça mais antiga
        if (oldestPiece) {
            board[oldestPiece.row][oldestPiece.col] = ' '; // Limpa essa posição no tabuleiro
        }
    }

    // 2. Colocar a nova peça
    board[row][col] = currentPlayer;
    history.push({ row, col }); // Adiciona a nova peça ao histórico

    renderBoard(); // Atualiza a interface

    // 3. Verificar condição de vitória
    if (checkWin(currentPlayer)) {
        gameOver = true;
        updateStatus(`🎉 PARABÉNS! O jogador ${currentPlayer} venceu! 🎉`);
        highlightWinningCells();
        return;
    }

    // 4. Trocar para o próximo jogador
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateStatus(`Vez do jogador ${getCurrentPlayer()}`);
}

function checkWin(player) {
    // Helper para verificar 3 em linha
    const checkLine = (r1, c1, r2, c2, r3, c3) => {
        if (board[r1][c1] === player &&
            board[r2][c2] === player &&
            board[r3][c3] === player) {
            winningCells = [{ row: r1, col: c1 }, { row: r2, col: c2 }, { row: r3, col: c3 }];
            return true;
        }
        return false;
    };

    // Verificar linhas
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c <= 4 - WIN_CONDITION_LENGTH; c++) {
            if (checkLine(r, c, r, c + 1, r, c + 2)) return true;
        }
    }

    // Verificar colunas
    for (let c = 0; c < 4; c++) {
        for (let r = 0; r <= 4 - WIN_CONDITION_LENGTH; r++) {
            if (checkLine(r, c, r + 1, c, r + 2, c)) return true;
        }
    }

    // Verificar diagonais (top-left to bottom-right)
    for (let r = 0; r <= 4 - WIN_CONDITION_LENGTH; r++) {
        for (let c = 0; c <= 4 - WIN_CONDITION_LENGTH; c++) {
            if (checkLine(r, c, r + 1, c + 1, r + 2, c + 2)) return true;
        }
    }

    // Verificar anti-diagonais (top-right to bottom-left)
    for (let r = 0; r <= 4 - WIN_CONDITION_LENGTH; r++) {
        for (let c = WIN_CONDITION_LENGTH - 1; c < 4; c++) { // c começa de 2 (0-indexado)
            if (checkLine(r, c, r + 1, c - 1, r + 2, c - 2)) return true;
        }
    }

    return false;
}

function highlightWinningCells() {
    renderBoard(); // Redesenha o tabuleiro para aplicar a classe 'winning-cell'
}

// --- Event Listeners ---
resetButton.addEventListener('click', initGame);

// --- Iniciar o Jogo ---
initGame();
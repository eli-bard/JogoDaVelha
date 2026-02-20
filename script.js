// --- Elementos do DOM ---
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetButton = document.getElementById('resetButton');

// --- Variáveis do Jogo ---
let board = [];
const players = ['🔴', '🔵', '⚪']; // Usando símbolos mais visíveis
let currentPlayerIndex = 0;
let playerPieceHistory = {
    '🔴': [], // Array que funciona como deque: [mais_antiga, ..., mais_recente]
    '🔵': [],
    '⚪': []
};
const MAX_PIECES_PER_PLAYER = 4;
const WIN_CONDITION_LENGTH = 4; // Alterado para 4
const BOARD_SIZE = 5; // Tabuleiro 5x5 para melhor jogabilidade com 4 peças
let gameOver = false;
let winningCells = []; // Para armazenar as células vencedoras para destaque

// --- Funções do Jogo ---

function initGame() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(' '));
    currentPlayerIndex = 0;
    playerPieceHistory = {
        '🔴': [],
        '🔵': [],
        '⚪': []
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
    boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    
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
            
            // Verifica se esta célula faz parte das células vencedoras
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

    // 4. Verificar empate (apenas se todas as posições estiverem ocupadas)
    const isBoardFull = board.every(row => row.every(cell => cell !== ' '));
    if (isBoardFull) {
        gameOver = true;
        updateStatus("🤝 Empate! O tabuleiro está cheio.");
        return;
    }

    // 5. Trocar para o próximo jogador
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateStatus(`Vez do jogador ${getCurrentPlayer()}`);
}

function checkWin(player) {
    winningCells = []; // Reset das células vencedoras
    
    // Helper para verificar 4 em linha
    const checkLine = (positions) => {
        if (positions.every(pos => 
            pos.row >= 0 && pos.row < BOARD_SIZE && 
            pos.col >= 0 && pos.col < BOARD_SIZE && 
            board[pos.row][pos.col] === player
        )) {
            winningCells = positions;
            return true;
        }
        return false;
    };

    // Verificar linhas horizontais
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c <= BOARD_SIZE - WIN_CONDITION_LENGTH; c++) {
            const positions = [];
            for (let i = 0; i < WIN_CONDITION_LENGTH; i++) {
                positions.push({ row: r, col: c + i });
            }
            if (checkLine(positions)) return true;
        }
    }

    // Verificar linhas verticais
    for (let c = 0; c < BOARD_SIZE; c++) {
        for (let r = 0; r <= BOARD_SIZE - WIN_CONDITION_LENGTH; r++) {
            const positions = [];
            for (let i = 0; i < WIN_CONDITION_LENGTH; i++) {
                positions.push({ row: r + i, col: c });
            }
            if (checkLine(positions)) return true;
        }
    }

    // Verificar diagonais (top-left to bottom-right)
    for (let r = 0; r <= BOARD_SIZE - WIN_CONDITION_LENGTH; r++) {
        for (let c = 0; c <= BOARD_SIZE - WIN_CONDITION_LENGTH; c++) {
            const positions = [];
            for (let i = 0; i < WIN_CONDITION_LENGTH; i++) {
                positions.push({ row: r + i, col: c + i });
            }
            if (checkLine(positions)) return true;
        }
    }

    // Verificar anti-diagonais (top-right to bottom-left)
    for (let r = 0; r <= BOARD_SIZE - WIN_CONDITION_LENGTH; r++) {
        for (let c = WIN_CONDITION_LENGTH - 1; c < BOARD_SIZE; c++) {
            const positions = [];
            for (let i = 0; i < WIN_CONDITION_LENGTH; i++) {
                positions.push({ row: r + i, col: c - i });
            }
            if (checkLine(positions)) return true;
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

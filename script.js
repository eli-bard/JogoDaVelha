const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('resetButton');

let board = ["", "", "", "", "", "", "", "", ""]; // Representa o estado do tabuleiro
let currentPlayer = "X";
let gameActive = true;
let placedPiecesCount = { "X": 0, "O": 0 }; // Contador de peças colocadas por jogador
let phase = "placement"; // 'placement' ou 'movement'
let selectedPiece = null; // Para a fase de movimentação: [rowIndex, colIndex] da peça selecionada

// Combinações de vitória para um tabuleiro 3x3
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
];

// Mapeamento de índice 1D para coordenadas 2D (linha, coluna)
function getCoords(index) {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return { row, col };
}

// Mapeamento de coordenadas 2D para índice 1D
function getIndex(row, col) {
    return row * 3 + col;
}

// Atualiza a mensagem de status do jogo
function updateStatus(message) {
    statusDisplay.textContent = message;
}

// Reinicia o jogo para o estado inicial
function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    placedPiecesCount = { "X": 0, "O": 0 };
    phase = "placement";
    selectedPiece = null;

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('X', 'O', 'selected');
    });

    updateStatus(`Vez do Jogador ${currentPlayer}`);
}

// Verifica se há um vencedor
function checkWinner() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];

        if (a === "" || b === "" || c === "") {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        updateStatus(`Jogador ${currentPlayer} Venceu! 🎉`);
        gameActive = false;
        return true;
    }

    // Verifica empate apenas se ainda estiver na fase de colocação e todas as células forem preenchidas
    if (phase === 'placement' && !board.includes("")) {
         // Na fase de colocação, se todas as células estiverem cheias e não houver vencedor, é empate (cenário menos provável com 3 peças/jogador)
         // Mas com a regra de 3 peças, o jogo geralmente vai para a fase de movimentação.
    }
    // Para a fase de movimentação, o empate é mais complexo de definir, pode ser por falta de movimentos válidos ou ciclo de repetição.
    return false;
}

// Alterna o jogador atual
function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    if (gameActive) {
        updateStatus(`Vez do Jogador ${currentPlayer}`);
    }
}

// Lógica principal para lidar com o clique em uma célula
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

    if (!gameActive) {
        return;
    }

    if (phase === "placement") {
        if (board[clickedCellIndex] !== "") { // Célula já ocupada
            updateStatus("Célula já ocupada! Escolha outra.");
            return;
        }

        if (placedPiecesCount[currentPlayer] < 3) {
            board[clickedCellIndex] = currentPlayer;
            clickedCell.textContent = currentPlayer;
            clickedCell.classList.add(currentPlayer);
            placedPiecesCount[currentPlayer]++;

            if (checkWinner()) {
                return;
            }

            // Verifica se ambos os jogadores colocaram suas 3 peças
            if (placedPiecesCount["X"] === 3 && placedPiecesCount["O"] === 3) {
                phase = "movement";
                updateStatus(`Todas as peças foram colocadas! Vez do Jogador ${currentPlayer} - MOVIMENTE uma peça.`);
            } else {
                changePlayer();
            }
        } else {
            // Este else só ocorreria se o contador de peças já atingiu 3 mas o fase ainda é "placement".
            // Na lógica atual, isso indica que o jogo deveria estar na fase de movimento.
            // Para robustez, podemos informar que o jogador deve mover uma peça.
            updateStatus(`Você já colocou suas 3 peças. Agora você deve MOVER uma delas.`);
        }

    } else if (phase === "movement") {
        // --- LÓGICA DA FASE DE MOVIMENTAÇÃO (A SER IMPLEMENTADA) ---

        // 1. Se nenhuma peça estiver selecionada e o jogador clicou em UMA DE SUAS PRÓPRIAS PEÇAS:
        if (selectedPiece === null && board[clickedCellIndex] === currentPlayer) {
            // Seleciona a peça
            selectedPiece = getCoords(clickedCellIndex);
            clickedCell.classList.add('selected');
            updateStatus(`Vez do Jogador ${currentPlayer}. Peça selecionada em (${selectedPiece.row},${selectedPiece.col}). Agora clique em um quadrado vazio ADJACENTE para mover.`);
            return; // Espera o segundo clique para mover
        }

        // 2. Se uma peça ESTIVER selecionada e o jogador clicou em um QUADRADO VAZIO:
        if (selectedPiece !== null && board[clickedCellIndex] === "") {
            const targetCoords = getCoords(clickedCellIndex);
            // Verifica se o movimento é adjacente
            if (isAdjacent(selectedPiece, targetCoords)) {
                // Remove a peça da posição antiga
                const oldIndex = getIndex(selectedPiece.row, selectedPiece.col);
                board[oldIndex] = "";
                cells[oldIndex].textContent = "";
                cells[oldIndex].classList.remove(currentPlayer, 'selected');

                // Move a peça para a nova posição
                board[clickedCellIndex] = currentPlayer;
                clickedCell.textContent = currentPlayer;
                clickedCell.classList.add(currentPlayer);

                // Limpa a seleção
                selectedPiece = null;

                if (checkWinner()) {
                    return;
                }
                changePlayer();
            } else {
                updateStatus(`Movimento inválido! A célula (${targetCoords.row},${targetCoords.col}) não é adjacente à peça selecionada. Escolha um quadrado adjacente vazio.`);
            }
            return;
        }

        // 3. Se uma peça ESTIVER selecionada e o jogador clicou em OUTRA DE SUAS PRÓPRIAS PEÇAS:
        if (selectedPiece !== null && board[clickedCellIndex] === currentPlayer) {
            // Desseleciona a peça anterior
            const oldSelectedCellIndex = getIndex(selectedPiece.row, selectedPiece.col);
            cells[oldSelectedCellIndex].classList.remove('selected');

            // Seleciona a nova peça
            selectedPiece = getCoords(clickedCellIndex);
            clickedCell.classList.add('selected');
            updateStatus(`Vez do Jogador ${currentPlayer}. Nova peça selecionada em (${selectedPiece.row},${selectedPiece.col}). Agora clique em um quadrado vazio ADJACENTE para mover.`);
            return;
        }

        // Se o jogador clicou em uma célula ocupada que não é a sua peça selecionada
        if (selectedPiece !== null && board[clickedCellIndex] !== "") {
            updateStatus("Você não pode mover para uma célula ocupada. Escolha um quadrado vazio adjacente.");
            return;
        }

        // Se o jogador clicou em uma célula que não é sua peça, e nenhuma peça está selecionada
        if (selectedPiece === null && board[clickedCellIndex] !== currentPlayer && board[clickedCellIndex] !== "") {
            updateStatus("Essa não é sua peça! Escolha uma de suas próprias peças para mover.");
            return;
        }
    }
}

// Função auxiliar para verificar se duas células são adjacentes (horizontal, vertical, diagonal)
function isAdjacent(coords1, coords2) {
    const dr = Math.abs(coords1.row - coords2.row);
    const dc = Math.abs(coords1.col - coords2.col);
    // Adjacente se a diferença em linha e coluna for 0 ou 1, e não for a mesma célula
    return (dr <= 1 && dc <= 1) && (dr !== 0 || dc !== 0);
}


// Adiciona os event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);

// Inicializa o jogo
resetGame();
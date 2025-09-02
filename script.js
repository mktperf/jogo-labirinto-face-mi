document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const messageArea = document.getElementById('message-area');
    const restartButton = document.getElementById('restart-button');
    let playerPosition = { x: 0, y: 0 };

    // Dimensões do labirinto (linhas x colunas)
    const maze = [
        ['start', 'path', 'wall', 'path', 'wall', 'wall', 'wall', 'wall'],
        ['wall', 'path', 'path', 'path', 'wall', 'path', 'path', 'wall'],
        ['wall', 'wall', 'wall', 'path', 'wall', 'path', 'wall', 'wall'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'wall', 'path'],
        ['wall', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'path'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'path', 'path'],
        ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'path', 'end']
    ];
    
    // Ponto turístico: Mercado do Bom Sucesso em 4, 3
    const touristPoints = {
        '3,5': 'mercado-bom-sucesso'
    };

    // Função para criar o labirinto no HTML
    function createMaze() {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${maze[0].length}, 1fr)`;

        maze.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');

                if (cell === 'wall') {
                    cellDiv.classList.add('wall');
                } else if (cell === 'start') {
                    cellDiv.classList.add('start');
                    playerPosition = { x: colIndex, y: rowIndex };
                } else if (cell === 'end') {
                    cellDiv.classList.add('end');
                }
                
                // Adiciona os pontos turísticos
                const pointKey = `${rowIndex},${colIndex}`;
                if (touristPoints[pointKey]) {
                    cellDiv.classList.add(touristPoints[pointKey]);
                }

                cellDiv.dataset.x = colIndex;
                cellDiv.dataset.y = rowIndex;

                gameBoard.appendChild(cellDiv);
            });
        });

        drawPlayer();
    }

    // Função para desenhar a posição do jogador
    function drawPlayer() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.remove('player'));
        const playerCell = document.querySelector(`.cell[data-x='${playerPosition.x}'][data-y='${playerPosition.y}']`);
        if (playerCell) {
            playerCell.classList.add('player');
        }
    }

    // Função para mover o jogador
    function movePlayer(dx, dy) {
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;

        // Verifica se a nova posição é válida (dentro dos limites e não é uma parede)
        if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length && maze[newY][newX] !== 'wall') {
            playerPosition = { x: newX, y: newY };
            drawPlayer();
            checkGameState();
        }
    }

    // Função para verificar o estado do jogo
    function checkGameState() {
        if (maze[playerPosition.y][playerPosition.x] === 'end') {
            showMessage("O Instituto Face Mi chegou ao Porto (e você foi um dos primeiros a descobrir o caminho). Venha nos visitar!", 'success');
        }
    }

    // Função para exibir mensagens
    function showMessage(text, type) {
        messageArea.textContent = text;
        messageArea.className = ''; // Limpa classes anteriores
        messageArea.classList.add(type);
    }

    // Lógica para movimentar o bonequinho com o mouse
    gameBoard.addEventListener('mousedown', (e) => {
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const startX = playerPosition.x;
        const startY = playerPosition.y;

        const targetX = parseInt(cell.dataset.x);
        const targetY = parseInt(cell.dataset.y);

        // Simple pathfinding: Apenas move em linha reta
        let path = [];
        let isPathValid = true;
        let currentX = startX;
        let currentY = startY;

        while (currentX !== targetX || currentY !== targetY) {
            let moved = false;
            // Tenta mover horizontalmente primeiro
            if (currentX !== targetX) {
                const dx = currentX < targetX ? 1 : -1;
                const nextX = currentX + dx;
                if (maze[currentY][nextX] !== 'wall') {
                    currentX = nextX;
                    path.push({ x: currentX, y: currentY });
                    moved = true;
                } else {
                    isPathValid = false;
                    break;
                }
            }
            // Se não moveu horizontalmente, tenta verticalmente
            if (!moved && currentY !== targetY) {
                const dy = currentY < targetY ? 1 : -1;
                const nextY = currentY + dy;
                if (maze[nextY][currentX] !== 'wall') {
                    currentY = nextY;
                    path.push({ x: currentX, y: currentY });
                    moved = true;
                } else {
                    isPathValid = false;
                    break;
                }
            }

            if (!moved) {
                isPathValid = false;
                break;
            }
        }
        
        if (isPathValid) {
            playerPosition = { x: targetX, y: targetY };
            drawPlayer();
            checkGameState();
        } else {
            showMessage("Ops! Este não parece ser o caminho certo. Clique em Reiniciar e tente outra vez!", 'error');
        }
    });

    // Evento para o botão de reiniciar
    restartButton.addEventListener('click', () => {
        createMaze();
        showMessage('', '');
    });

    // Inicializa o jogo
    createMaze();
});

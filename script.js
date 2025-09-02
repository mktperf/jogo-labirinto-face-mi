document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const messageArea = document.getElementById('message-area');
    const restartButton = document.getElementById('restart-button');
    let playerPosition = { x: 0, y: 0 };
    let visitedPath = new Set();

    // Novo labirinto mais difícil (10x10)
    const maze = [
        ['start', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'wall'],
        ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'path', 'wall', 'wall'],
        ['wall', 'path', 'path', 'path', 'wall', 'path', 'path', 'path', 'path', 'wall'],
        ['wall', 'path', 'wall', 'path', 'wall', 'path', 'wall', 'wall', 'path', 'wall'],
        ['wall', 'path', 'wall', 'path', 'path', 'path', 'wall', 'path', 'path', 'wall'],
        ['wall', 'path', 'wall', 'wall', 'wall', 'path', 'wall', 'path', 'wall', 'wall'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'wall', 'path'],
        ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'path'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'end']
    ];

    // Novos pontos turísticos
    const touristPoints = {
        '3,5': 'guimaraes-castle',
        '5,8': 'sao-bento-station',
        '8,4': 'mercado-bom-sucesso'
    };

    function createMaze() {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${maze[0].length}, 1fr)`;
        visitedPath.clear();

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

                cellDiv.dataset.x = colIndex;
                cellDiv.dataset.y = rowIndex;

                gameBoard.appendChild(cellDiv);
            });
        });

        drawPlayer();
    }

    function drawPlayer() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('player');
            // Mantém a célula destacada se estiver no caminho visitado
            if (visitedPath.has(`${cell.dataset.y},${cell.dataset.x}`)) {
                cell.classList.add('path-highlight');
            } else {
                cell.classList.remove('path-highlight');
            }
        });

        const playerCell = document.querySelector(`.cell[data-x='${playerPosition.x}'][data-y='${playerPosition.y}']`);
        if (playerCell) {
            playerCell.classList.add('player');
            visitedPath.add(`${playerPosition.y},${playerPosition.x}`);

            // Revela ponto turístico se o jogador chegar na célula
            const pointKey = `${playerPosition.y},${playerPosition.x}`;
            if (touristPoints[pointKey]) {
                playerCell.classList.add(touristPoints[pointKey]);
            }
        }
    }

    function movePlayer(dx, dy) {
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;

        if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length) {
            if (maze[newY][newX] !== 'wall') {
                playerPosition = { x: newX, y: newY };
                drawPlayer();
                checkGameState();
                showMessage('', ''); // Limpa a mensagem de erro
            } else {
                showMessage("Ops! Este não parece ser o caminho certo. Clique em Reiniciar e tente outra vez!", 'error');
            }
        }
    }

    function checkGameState() {
        if (maze[playerPosition.y][playerPosition.x] === 'end') {
            showMessage("O Instituto Face Mi chegou ao Porto (e você foi um dos primeiros a descobrir o caminho). Venha nos visitar!", 'success');
        }
    }

    function showMessage(text, type) {
        messageArea.textContent = text;
        messageArea.className = '';
        if (type) {
            messageArea.classList.add(type);
        }
    }

    // Movimentação com as setas do teclado
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                movePlayer(0, -1);
                break;
            case 'ArrowDown':
                movePlayer(0, 1);
                break;
            case 'ArrowLeft':
                movePlayer(-1, 0);
                break;
            case 'ArrowRight':
                movePlayer(1, 0);
                break;
        }
    });

    // Evento para o botão de reiniciar
    restartButton.addEventListener('click', () => {
        createMaze();
        showMessage('', '');
    });

    createMaze();
});

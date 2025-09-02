document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const messageArea = document.getElementById('message-area');
    const playerPositionDisplay = document.getElementById('player-position');
    const restartButton = document.getElementById('restart-button');
    const mapButton = document.querySelector('.btn-map');
    const poiList = document.getElementById('poi-list');

    let playerPosition = { x: 0, y: 0 };
    let visitedPath = new Set();
    let revealedPois = new Set();
    let isGameWon = false;

    // Novo labirinto mais difícil (12x12)
    const maze = [
        ['start', 'path', 'path', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
        ['wall', 'wall', 'wall', 'path', 'wall', 'path', 'path', 'path', 'wall', 'path', 'path', 'wall'],
        ['wall', 'path', 'path', 'path', 'wall', 'path', 'wall', 'path', 'wall', 'path', 'wall', 'wall'],
        ['wall', 'path', 'wall', 'wall', 'wall', 'path', 'wall', 'path', 'wall', 'path', 'path', 'wall'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'wall', 'path', 'wall', 'wall', 'path', 'wall'],
        ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'path', 'path', 'wall', 'path', 'wall'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'wall', 'wall', 'path', 'wall'],
        ['wall', 'path', 'wall', 'path', 'wall', 'path', 'wall', 'path', 'path', 'path', 'path', 'wall'],
        ['wall', 'path', 'wall', 'path', 'wall', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
        ['wall', 'path', 'path', 'path', 'wall', 'path', 'path', 'path', 'path', 'path', 'path', 'wall'],
        ['wall', 'wall', 'wall', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'path', 'wall'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'end']
    ];

    // Pontos de interesse
    const touristPoints = [
        { name: 'Castelo de Guimarães', coords: { x: 5, y: 7 }, icon: 'https://i.imgur.com/Q2rRz8R.png', description: 'O berço da nação portuguesa!' },
        { name: 'Estação de São Bento', coords: { x: 8, y: 1 }, icon: 'https://i.imgur.com/gK9s0uP.png', description: 'Famosa pelos seus painéis de azulejo.' },
        { name: 'Mercado do Bom Sucesso', coords: { x: 1, y: 2 }, icon: 'https://i.imgur.com/J3y8f0C.png', description: 'Mercado gastronómico no Porto.' }
    ];

    function createMaze() {
        isGameWon = false;
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${maze[0].length}, 1fr)`;
        visitedPath.clear();
        revealedPois.clear();
        mapButton.classList.remove('visible');

        maze.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');

                if (cell === 'wall') {
                    cellDiv.classList.add('wall');
                } else if (cell === 'start') {
                    playerPosition = { x: colIndex, y: rowIndex };
                } else if (cell === 'end') {
                    cellDiv.classList.add('end');
                }
                cellDiv.dataset.x = colIndex;
                cellDiv.dataset.y = rowIndex;
                gameBoard.appendChild(cellDiv);
            });
        });

        // Adiciona a lista de POIs ao sidebar
        poiList.innerHTML = touristPoints.map(poi => `
            <li class="poi-item" data-x="${poi.coords.x}" data-y="${poi.coords.y}">
                <img src="${poi.icon}" alt="${poi.name}">
                <div>
                    <h4>${poi.name}</h4>
                    <p>${poi.description}</p>
                </div>
            </li>
        `).join('');

        drawPlayer();
        updateStatus();
    }

    function drawPlayer() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('player');
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
        }
    }

    function movePlayer(dx, dy) {
        if (isGameWon) return;

        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;

        if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length) {
            if (maze[newY][newX] !== 'wall') {
                playerPosition = { x: newX, y: newY };
                drawPlayer();
                updateStatus();
                checkGameState();
                showMessage('', ''); // Limpa a mensagem de erro ao se mover
            } else {
                showMessage("Ops! Este não parece ser o caminho certo. 😕 Tente outra vez!", 'error');
            }
        }
    }

    function updateStatus() {
        // Atualiza a posição do jogador no painel lateral
        playerPositionDisplay.textContent = `(${playerPosition.y}, ${playerPosition.x})`;

        // Revela pontos de interesse no painel lateral
        touristPoints.forEach(poi => {
            if (playerPosition.x === poi.coords.x && playerPosition.y === poi.coords.y) {
                if (!revealedPois.has(poi.name)) {
                    const poiItem = document.querySelector(`.poi-item[data-x="${poi.coords.x}"][data-y="${poi.coords.y}"]`);
                    if (poiItem) {
                        poiItem.classList.add('revealed');
                    }
                    revealedPois.add(poi.name);
                }
            }
        });
    }

    function checkGameState() {
        if (maze[playerPosition.y][playerPosition.x] === 'end') {
            isGameWon = true;
            showMessage("Parabéns! O Instituto Face Mi chegou ao Porto! 🎉 Você venceu!", 'success');
            mapButton.classList.add('visible');
            document.removeEventListener('keydown', handleKeyDown);
        }
    }

    function showMessage(text, type) {
        messageArea.textContent = text;
        messageArea.className = 'game-message';
        if (type) {
            messageArea.classList.add(type);
        }
    }

    // Movimentação com as setas do teclado
    function handleKeyDown(e) {
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
    }

    document.addEventListener('keydown', handleKeyDown);

    // Evento para o botão de reiniciar
    restartButton.addEventListener('click', () => {
        createMaze();
        showMessage('', '');
        document.addEventListener('keydown', handleKeyDown);
    });

    createMaze();
});

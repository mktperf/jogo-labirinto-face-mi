document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const messageArea = document.getElementById('message-area');
    const playerPositionDisplay = document.getElementById('player-position');
    const restartButton = document.getElementById('restart-button');
    const mapButton = document.querySelector('.btn-map');
    const poiList = document.getElementById('poi-list');

    let playerPosition = { x: 0, y: 0 };
    let visitedPath = new Set();
    let isGameWon = false;
    let pathLength = 0; // Para calcular a porcentagem de progresso

    // Novo labirinto (12x12) para os novos POIs
    const maze = [
        ['start', 'path', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
        ['wall', 'path', 'wall', 'wall', 'wall', 'path', 'path', 'path', 'path', 'path', 'path', 'wall'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'wall', 'wall', 'wall', 'wall', 'path', 'wall'],
        ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'path', 'path', 'wall', 'path', 'wall'],
        ['wall', 'path', 'path', 'path', 'wall', 'path', 'path', 'path', 'wall', 'wall', 'path', 'wall'],
        ['wall', 'path', 'wall', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'path', 'wall'],
        ['wall', 'path', 'wall', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'wall'],
        ['wall', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'wall', 'path', 'path', 'path', 'path', 'path'],
        ['wall', 'wall', 'wall', 'wall', 'wall', 'path', 'wall', 'path', 'wall', 'wall', 'wall', 'wall'],
        ['wall', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'wall', 'path', 'wall'],
        ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'path', 'path', 'path', 'end']
    ];

    // Pontos de interesse na ordem correta, com emojis e descrições
    const touristPoints = [
        { name: 'Sé de Braga', coords: { x: 1, y: 0 }, icon: '⛪', description: 'Centro histórico de Braga — perto da clínica inicial.' },
        { name: 'Estádio Municipal de Braga', coords: { x: 1, y: 1 }, icon: '🏟️', description: 'Obra arquitetónica icónica da cidade.' },
        { name: 'Autoestrada (A3)', coords: { x: 5, y: 1 }, icon: '🛣️', description: 'Trecho que liga Braga ao Porto — representado no tabuleiro.' },
        { name: 'Casa da Música', coords: { x: 5, y: 4 }, icon: '🎵', description: 'Praça cultural no Porto.' },
        { name: 'Mercado do Bom Sucesso', coords: { x: 7, y: 4 }, icon: '🛍️', description: 'Mercado gastronómico no Porto, ótimo para uma paragem.' },
        { name: 'Rotunda da Boavista', coords: { x: 9, y: 8 }, icon: '🔄', description: 'Grande rotunda urbana, ponto de referência no trajeto final.' }
    ];

    function createMaze() {
        isGameWon = false;
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${maze[0].length}, 1fr)`;
        visitedPath.clear();
        mapButton.classList.remove('visible');
        messageArea.textContent = '';

        maze.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');

                if (cell === 'wall') {
                    cellDiv.classList.add('wall');
                } else if (cell === 'start') {
                    playerPosition = { x: colIndex, y: rowIndex };
                    cellDiv.classList.add('start');
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
                <span class="icon">${poi.icon}</span>
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
                showMessage('', '');
            } else {
                showMessage("Ops! Este não parece ser o caminho certo. 😕 Tente outra vez!", 'error');
            }
        }
    }

    function updateStatus() {
        playerPositionDisplay.textContent = `(${playerPosition.y}, ${playerPosition.x})`;

        // Lógica de revelação de POIs por porcentagem
        const totalPathLength = 20; // A estimativa de células no caminho
        const currentPathPercentage = (visitedPath.size / totalPathLength) * 100;

        touristPoints.forEach((poi, index) => {
            const percentageToReveal = ((index + 1) / touristPoints.length) * 100;
            if (currentPathPercentage >= percentageToReveal) {
                const poiItem = document.querySelector(`.poi-item[data-x="${poi.coords.x}"][data-y="${poi.coords.y}"]`);
                if (poiItem) {
                    poiItem.classList.add('revealed');
                }
            }
        });
    }

    function checkGameState() {
        const endCell = maze[playerPosition.y][playerPosition.x];
        if (endCell === 'end') {
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
    
    restartButton.addEventListener('click', () => {
        createMaze();
        showMessage('', '');
        document.addEventListener('keydown', handleKeyDown);
    });

    createMaze();
});

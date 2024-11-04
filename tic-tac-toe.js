// Get player name from URL

// let board = ['', '', '', '', '', '', '', '', ''];
// let currentPlayer = 'X';
// let player1Score = 0;
// let player2Score = 0;
// let ties = 0;
    const params = new URLSearchParams(window.location.search);
    const playerName = params.get("name");
    var gameFlag = false;

document.addEventListener("DOMContentLoaded", async function() {
    
    document.getElementById("player1Name").innerHTML = playerName;
    gameSession = await getSessionId(playerName);
    joinGame(gameSession.sessionId);
    drawBoard();
    
});

function makeMove(index) {
    if(gameSession.player2 == null || gameFlag) return;

    let currentPlayer = gameSession.playerOneMove ? 'O' : 'X';
    if (gameSession.boardStatus[index] == ' ') {
        if(gameSession.playerOneMove && gameSession.player1 == playerName){
            gameSession.boardStatus[index] = currentPlayer;
            sendGameStatus(gameSession);
        }else if(!gameSession.playerOneMove && gameSession.player2 == playerName){
            gameSession.boardStatus[index] = currentPlayer;
            sendGameStatus(gameSession);
        }
        // const cell = document.querySelectorAll('.cell')[index];
        // cell.textContent = currentPlayer;
        // cell.classList.add(currentPlayer);

        
    }
}

function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    return winPatterns.some(pattern => 
        pattern.every(index => gameSession.boardStatus[index] == (gameSession.playerOneMove ? 'X' : 'O'))
    );
}

function resetBoard() {
    board = ['', '', '', '', '', '', '', '', ''];
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O');
    });
    currentPlayer = 'X';
}

function drawBoard(){
    document.getElementById('player1Name').textContent = gameSession.player1;
    document.getElementById('player2Name').textContent = gameSession.player2 == null ? "Waiting for player 2" : gameSession.player2;
    for(let i = 0; i < 9; i++){
        let button = document.getElementById('button' + i);
        button.textContent = gameSession.boardStatus[i];
        if(gameSession.boardStatus[i] == 'X'){
            button.classList.add('cellX');
        } else if(gameSession.boardStatus[i] == 'O'){
           button.classList.add('cellO');
        }
    }
    let currentPlayer = gameSession.playerOneMove ? 'O' : 'X';
    if (checkWin()) {
        if (currentPlayer == 'X') {
            // player1Score++;
            // document.getElementById('player1Score').textContent = player1Score;
            document.getElementById('winner').innerHTML = gameSession.player1 + " is a winner!";
            gameFlag = true;
        } else {
            // player2Score++;
            // document.getElementById('player2Score').textContent = player2Score;
            document.getElementById('winner').innerHTML = gameSession.player2 + " is a winner!";
            gameFlag = true;
        }
    }
}





function setCookie(name, value) {
    let date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days in milliseconds
    let expires = "; expires=" + date.toUTCString();

    // Encode the value to preserve case sensitivity
    document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
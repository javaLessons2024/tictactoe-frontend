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


function resetBoard(){    
    for(let i = 0; i < 9; i++){       
        gameSession.boardStatus[i] = ' ';              
    }
    sendGameStatus(gameSession);   
}

function drawBoard(){
    document.getElementById("buttonReset").disabled = true;

    document.getElementById('player1Name').textContent = gameSession.player1;
    document.getElementById('player2Name').textContent = gameSession.player2 == null ? "Waiting..." : gameSession.player2;
    for(let i = 0; i < 9; i++){
        let button = document.getElementById('button' + i);
        button.textContent = gameSession.boardStatus[i];
        if(gameSession.boardStatus[i] == 'X'){
            button.className = 'cellX';
        } else if(gameSession.boardStatus[i] == 'O'){
            button.className = 'cellO';
        }
    }

    let currentPlayer = gameSession.playerOneMove ? 'O' : 'X';
    if (checkWin()) {
        if (currentPlayer == 'X') {
            
            document.getElementById('message').innerHTML = gameSession.player1 + " is a winner!";
            document.getElementById("buttonReset").disabled = false;
            gameFlag = true;
        } else if (currentPlayer == 'O') {          
            document.getElementById('message').innerHTML = gameSession.player2 + " is a winner!";
            document.getElementById("buttonReset").disabled = false;
            gameFlag = true;
        } 
    } else {
        if(gameSession.boardStatus.every(cell => cell!==" ")){
            document.getElementById('message').innerHTML = "Cat's game!";
            document.getElementById("buttonReset").disabled = false;                    
        } 
        gameFlag = false;
    }





    if (gameSession.playerOneMove){
        document.getElementById('player1Name').style.color = "Green";
        document.getElementById('player2Name').style.color = "Red";
    } else {
        document.getElementById('player1Name').style.color = "Red";
        document.getElementById('player2Name').style.color = "Green";
    }

}


var gameSession = null;
var stompClient = null;
var url = "http://api.tictactoe.pokerdash.fun";

    async function getSessionId(name){
    
        let response = await fetch(url + "/getGameSession/" + name, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },               
        })
        if (response.status == 400 ) {
            console.log('Failed to get SessionId');
        }else if (response.status == 500 ) {
            console.log('Server Error');
        }
        return await response.json(); 
        
    }

    async function joinGame(sessionId) {
        return new Promise((resolve, reject) => {
            var socket = new SockJS(url + '/websocket');
            stompClient = Stomp.over(socket);
           
            stompClient.connect({       
            }, function (frame) { 
                
                stompClient.subscribe('/topic/game/' + sessionId, function (message) {
                    gameSession = JSON.parse(message.body);
                    drawBoard();

                }, {});
                
                resolve(frame);
            }, function (error) {
                console.log('Error: ' + error);                                
                reject(error);
            });
        });
        }

    function sendGameStatus(gameSession){
        stompClient.send("/app/game/" + gameSession.sessionId, {}, JSON.stringify(gameSession));
    }

    
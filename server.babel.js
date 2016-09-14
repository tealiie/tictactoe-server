import express from 'express';
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const async = require('async');

let gameBoard = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];
let gameBoardStore = {};
// gameBoardStore should be something like this
// {
//   roomKey : {
//     gameBoard: gameBoard,
//     player1: socket1,
//     player2: socket2,
//     playerTurn: 1/2
//   }
// }
let host = {};

io.on('connection', function(socket) {

    //generates a random string as key to create rooms in socket
    function generateRoomKey() {
        let roomKey = "";
        let roomKeyLength = 6;
        let possible = "abcdefghijklmnopqrstuvwxyz";

        for (let i = 0; i < roomKeyLength; i++) {
            roomKey += possible.charAt(Math.floor(Math.random() * possible.length));
        };
        return roomKey;
    }


    function authenticate(playerID, roomName, firstPlayer, gameBoard) {
        io.to(playerID).emit('authenticate', {
            roomName: roomName,
            player1: firstPlayer,
            gameBoard: gameBoard
        });
    }

    function checkWin(gameboard) {
        let board = gameboard;
        let message = "";
        let gameState = true;
        if (board[0][0] == 'X' && board[0][1] == 'X' && board[0][2] == 'X') {
            message = "Player One Wins!"
            gameState = false
        } else if (board[1][0] == 'X' && board[1][1] == 'X' && board[1][2] == 'X') {
            message = "Player One Wins!"
            gameState = false
        } else if (board[2][0] == 'X' && board[2][1] == 'X' && board[2][2] === 'X') {
            message = "Player One Wins!"
            gameState = false
        } else if (board[0][0] == 'O' && board[0][1] == 'O' && board[0][2] === 'O') {
            message = "Player Two Wins!"
            gameState = false
        } else if (board[1][0] == 'O' && board[1][1] == 'O' && board[1][2] === 'O') {
            message = "Player Two Wins!"
            gameState = false
        } else if (board[2][0] == 'O' && board[2][1] == 'O' && board[2][2] === 'O') {
            message = "Player Two Wins!"
            gameState = false
        } else if (board[0][0] == 'X' && board[1][0] == 'X' && board[2][0] === 'X') {
            message = "Player One Wins!"
            gameState = false
        } else if (board[0][1] == 'X' && board[1][1] == 'X' && board[2][1] === 'X') {
            message = "Player One Wins!"
            gameState = false
        } else if (board[0][2] == 'X' && board[1][2] == 'X' && board[2][2] === 'X') {
            message = "Player One Wins!"
            gameState = false
        } else if (board[0][0] == 'O' && board[1][0] == 'O' && board[2][0] === 'O') {
            message = "Player Two Wins!"
            gameState = false
        } else if (board[0][1] == 'O' && board[1][1] == 'O' && board[2][1] === 'O') {
            message = "Player Two Wins!"
            gameState = false
        } else if (board[0][2] == 'O' && board[1][2] == 'O' && board[2][2] === 'O') {
            message = "Player Two Wins!"
            gameState = false
        } else if (board[0][0] == 'X' && board[1][1] == 'X' && board[2][2] === 'X') {
            message = "Player One Wins!"
            gameState = false
        } else if (board[0][2] == 'X' && board[1][1] == 'X' && board[2][0] === 'X') {
            message = "Player One Wins!"
            gameState = false
        } else if (board[0][0] == 'O' && board[1][1] == 'O' && board[2][2] === 'O') {
            message = "Player Two Wins!"
            gameState = false
        } else if (board[0][2] == 'O' && board[1][1] == 'O' && board[2][0] === 'O') {
            message = "Player Two Wins!"
            gameState = false
        }
        return { message: message, gameState: gameState };

        // else if (turn === 9) {
        //   message = "It's a Draw!"
        //   gameState = false
        // }
    }

    function resetBoard(gameRoom) {
        gameBoardStore[gameRoom].board = gameBoard;
    }

    socket.on('create room', function(roomKey) {
        if (roomKey != null && roomKey != "") {
            let playerOne = socket.id;
            gameBoardStore[roomKey] = {};
            gameBoardStore[roomKey]["gameBoard"] = gameBoard;
            gameBoardStore[roomKey]["player1"] = playerOne;
            socket.join(roomKey);
            console.log(gameBoardStore);
        }


        // let player1ID = socket.id;
        // let playerOneName = userName;
        // socket.join(gameRoom);
        // gameBoardStore[gameRoom] = {board: gameBoard, playerOne: playerOneName};
        // host[player1ID] = gameRoom;
        // console.log(gameBoardStore[gameRoom]);

        // authenticate(player1ID, gameRoom, true, gameBoardStore[gameRoom].board);
    });

    socket.on("click", function(data) {
        gameBoardStore[data.gameCode].gameBoard[data.row][data.col] = data.value;
        console.log(data)
            // socket.broadcast.emit("board update", gameBoardStore[data.gameCode].gameBoard);
            //toggle player turn here
        let playerTurn = 1;
        if (data.value == 'X') {
            playerTurn = 2
        }
        let dataObject = {
            gameBoard: gameBoardStore[data.gameCode].gameBoard,
            playerTurn: playerTurn
        }

        io.to(data.gameCode).emit("board update", dataObject)

        //keep checking if any player has won
        let winResult = checkWin(gameBoardStore[data.gameCode].gameBoard);
        console.log(winResult.gameState);
        if (!winResult.gameState) {
            console.log("win!");
            io.to(data.gameCode).emit("game end", winResult.message)
        }
    })

    socket.on('join room', function(roomCode) {
        //check if the room code exists in the gameboard store
        if (roomCode in gameBoardStore) {
            //make sure the player socket id is not the same as of player 1's
            if (socket.id !== gameBoardStore[roomCode]["player1"]) {
                //attach player 2 to the gameboard store
                let playerTwo = socket.id
                gameBoardStore[roomCode]["player2"] = playerTwo;
                socket.join(roomCode);
                io.in(roomCode).emit("game start", "haha")
            }
        }
        // if(joinObjects.joinKey in gameBoardStore) {
        //   let gameRoom = joinObjects.joinKey;
        //   let player2ID = socket.id;
        //   let playerTwoName = joinObjects.userName;
        //   gameBoardStore[gameRoom]['playerTwo'] = playerTwoName;
        //   socket.join(gameRoom);

        //   authenticate(player2ID, gameRoom, false, gameBoardStore[gameRoom].board);
        //   gameBoardStore[gameRoom]['playerTurn'] = 1;
        //   console.log(gameBoardStore[gameRoom]);
        //   io.in(gameRoom).emit('game start', {
        //     playerOneName: gameBoardStore[gameRoom].playerOne,
        //     playerTwoName: playerTwoName,
        //     gameBegin: true,
        //     playerTurn: gameBoardStore[gameRoom].playerTurn
        //   });
        // } else {
        //   io.to(socket.id).emit('joinError', "Oops, can't join that room");
        // }
    });

    socket.on('update board', function(data) {
        gameBoardStore[data.gameRoom].board = data.gameBoard;
        //emit the gameboard back
        checkWin(gameBoardStore[data.gameRoom].board);
        io.in(data.gameRoom).emit('get board updates', {
            game: gameBoardStore[data.gameRoom].board,
            result: checkWin(gameBoardStore[data.gameRoom].board)
        });
    });

    socket.on('reset board', function(data) {
        resetBoard(data);
        io.in(data).emit('reset update', )
    });

    //socket when a user logs out
    socket.on('disconnect', function() {
        console.log(socket.id);
        if (socket.id in host) {
            delete gameBoardStore[host[socket.id]];
            console.log(gameBoardStore);
        }
    });
});

app.use(express.static(__dirname + '/src'));

app.use('/haha', express.static('public'));

// app.listen(process.env.PORT || 1337);

// server.listen(app.get('port'), function() {
//   console.log('Server running at localhost', app.get('port'))
// });
server.listen(3000);

import express from 'express';
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


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

io.on('connection', function(socket) {
    let blankBoard = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    console.log("ON CONNECTION!");

    //check if the three elements are the same or not
    function checkSame(elementOne, elementTwo, elementThree, checkCharacter) {
        if ((elementOne == elementTwo) && (elementTwo == elementThree) && (elementThree == checkCharacter)) {
            return true;
        }
        return false;
    }

    function checkWin(gameboard) {
        let board = gameboard;
        let message = "";
        let gameState = true;

        //check the rows of the grid
        for (let i = 0; i < board.length; i++) {
            if (checkSame(board[i][0], board[i][1], board[i][2], 'X')) {
                message = "Player One Wins!"
                gameState = false
                break;
            }
            if (checkSame(board[i][0], board[i][1], board[i][2], 'O')) {
                message = "Player Two Wins!"
                gameState = false
                break;
            }
        }

        //check the columns of the grid
        for (let i = 0; i < board.length; i++) {
            if (checkSame(board[0][i], board[1][i], board[2][i], 'X')) {
                message = "Player One Wins!"
                gameState = false
                break;
            }
            if (checkSame(board[0][i], board[1][i], board[2][i], 'O')) {
                message = "Player Two Wins!"
                gameState = false
                break;
            }
        }

        if (checkSame(board[0][0], board[1][1], board[2][2], 'X')) {
            message = "Player One Wins!"
            gameState = false
        }

        if (checkSame(board[0][0], board[1][1], board[2][2], 'O')) {
            message = "Player Two Wins!"
            gameState = false
        }

        if (checkSame(board[0][2], board[1][1], board[2][0], 'X')) {
            message = "Player One Wins!"
            gameState = false
        }

        if (checkSame(board[0][2], board[1][1], board[2][0], 'O')) {
            message = "Player Two Wins!"
            gameState = false
        }

        if (!gameState) {
            return { message: message, gameState: gameState };
        }

        gameState = false;
        message = "IT'S A DRAW!"
        loop1:
            for (let i = 0; i < board.length; i++) {
                loop2: for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j] == '') {
                        //if empty cells are found, continue the game
                        gameState = true;
                        break loop1;
                    }
                }
            }
        return { message: message, gameState: gameState };
    }

    function resetBoard(gameRoom) {
        gameBoardStore[gameRoom].board = blankBoard;
    }

    socket.on('create room', function(roomKey) {
        if (roomKey != null && roomKey != "") {
            console.log("CREATE ROOM!")
            let playerOne = socket.id;
            gameBoardStore[roomKey] = {};
            gameBoardStore[roomKey]["gameBoard"] = blankBoard;
            gameBoardStore[roomKey]["player1"] = playerOne;
            socket.join(roomKey);
            console.log(roomKey);
            console.log("SENDING ROOM CREATED")
            io.to(socket.id).emit("room created", true);
        }
    });

    socket.on("click", function(data) {
        gameBoardStore[data.gameCode].gameBoard[data.row][data.col] = data.value;
        //toggle player turn here
        let playerTurn = 1;
        if (data.value == 'X') {
            playerTurn = 2
        }
        let dataObject = {
            gameBoard: gameBoardStore[data.gameCode].gameBoard,
            playerTurn: playerTurn
        }
        console.log("updating object... ", dataObject);
        io.to(data.gameCode).emit("board update", dataObject)

        //keep checking if any player has won
        let winResult = checkWin(gameBoardStore[data.gameCode].gameBoard);
        console.log(winResult.gameState);
        if (!winResult.gameState) {
            gameBoardStore[data.gameCode].gameBoard = blankBoard;
            console.log(winResult.message);
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
    });

    socket.on('update board', function(data) {
        gameBoardStore[data.gameRoom].board = data.gameBoard;
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

    socket.on('disconnect', function() {
        console.log("DISCONNECTED")
        Object.keys(gameBoardStore).forEach((gameCode) => {
            console.log(gameCode)
            if (gameBoardStore[gameCode].player1 == socket.id || gameBoardStore[gameCode].player2 == socket.id) {
                delete gameBoardStore[gameCode]
                console.log("ROOM ", gameCode, " IS REMOVED")
                return;
            }
        });
    });
});

app.use(express.static(__dirname + '/src'));
server.listen(3000);

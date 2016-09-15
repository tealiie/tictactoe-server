var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://127.0.0.1:3000';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var roomCode = "1234";

describe("The tic tac toe test", function() {

    it('create room from client should receive something', function(done) {
        var client1 = io.connect(socketURL, options);

        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            should(data).be.exactly(true)
            client1.disconnect();
            done();
        })
    });

    it('player 2 join should start the game', function(done) {

        var client1 = io.connect(socketURL, options);

        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            var client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client2.on("game start", function(data) {
                should(data).be.exactly('haha')
                client1.disconnect();
                client2.disconnect();
                done();
            })
        })
    });

    it('player 1 can make a move once game is started, player 2 should receive the update', function(done) {

        var client1 = io.connect(socketURL, options);

        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            var client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client1.on("game start", function(data) {
                client1.emit("click", { gameCode: roomCode, row: 0, col: 0, value: 'X' })
                client2.on("board update", function(data) {
                    should(data.gameBoard).be.eql([
                        ['X', '', ''],
                        ['', '', ''],
                        ['', '', '']
                    ]);
                    should(data.gameBoard).be.a.Array;
                    should(data.playerTurn).be.exactly(2)
                    client1.disconnect();
                    client2.disconnect();
                    done();
                })


            })
        })
    });

    it('player 2 make a move, and player 1 should receive the update', function(done) {
        var count = 0;
        var client1 = io.connect(socketURL, options);
        var board = [];
        var playerTurn = 1;
        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            var client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client1.on("game start", function(data) {
                client2.on("board update", function(data) {
                    board = data.gameBoard;
                    playerTurn = data.playerTurn;
                })

                client1.emit("click", { gameCode: roomCode, row: 0, col: 0, value: 'X' });
                count++;
                client2.emit("click", { gameCode: roomCode, row: 0, col: 1, value: 'O' });
                count++;
                setTimeout(function() {
                    if (count == 2) {
                        should(board).be.eql([
                            ['X', 'O', ''],
                            ['', '', ''],
                            ['', '', '']
                        ]);
                        should(board).be.a.Array;
                        should(playerTurn).be.exactly(1)
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    }
                }, 100)
            })
        })
    });

    it('player 1 should win', function(done) {
        var count = 0;
        var client1 = io.connect(socketURL, options);
        var board = [];
        var playerTurn = 1;
        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            var client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client1.on("game start", function(data) {
                client2.on("board update", function(data) {
                    board = data.gameBoard;
                    playerTurn = data.playerTurn;
                })

                client2.on("game end", function(data) {
                    should(data).be.eql("Player One Wins!");
                    client1.disconnect();
                    client2.disconnect();
                    done();
                })

                client1.emit("click", { gameCode: roomCode, row: 0, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 0, col: 1, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 1, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 1, col: 1, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 2, col: 0, value: 'X' });

            })
        })
    });

    it('player 2 should win', function(done) {
        var count = 0;
        var client1 = io.connect(socketURL, options);
        var board = [];
        var playerTurn = 1;
        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            var client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client1.on("game start", function(data) {
                client2.on("board update", function(data) {
                    board = data.gameBoard;
                    playerTurn = data.playerTurn;
                })

                client2.on("game end", function(data) {
                    should(data).be.eql("Player Two Wins!");
                    client1.disconnect();
                    client2.disconnect();
                    done();
                })

                client1.emit("click", { gameCode: roomCode, row: 0, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 0, col: 1, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 1, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 1, col: 1, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 2, col: 2, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 2, col: 1, value: 'O' });

            })
        })
    });
});

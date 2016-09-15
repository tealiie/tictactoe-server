var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://127.0.0.1:3000';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var roomCode = "1234";

describe("Chat Server", function() {
    it('assert test', function(done) {
        should(10).be.exactly(10)
        done();
    })
    it('create room from client should receive something', function(done) {
        this.timeout(3000); // 60 seconds
        client1 = io.connect(socketURL, options);

        // Set up event listener.  This is the actual test we're running
        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            should(data).be.exactly(true)
            client1.disconnect();
            done()
        })
    });
});

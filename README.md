# Tic Tac Toe Server

This is the backend server (nodeJS language) that handles the communication of the tic tac toe grid between 2 players and also checking of the winning conditions, which will emit the state of the game to them.

All communication between the clients are done via socket connection (socketIO)
Below are the list of the following events:
- Receivers
    - create room 
    - click
    - join room
    - update board
- Emitter
    - room created
    - board update
    - game end
    - game start
    - get board updates



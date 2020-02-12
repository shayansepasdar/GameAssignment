const express = require('express');
const socket = require('socket.io');

//App Setup
const port = 4001;
const app = express();
const server = app.listen(port, function() {
    console.log("App listening on Port " + port);
});

//Static files
app.use(express.static("public"));

//Socket setup
const io = require('socket.io')(server, { origins: '*:*' });
io.set('origins', '*:*');
io.origins(['*:*']);
//Counter for number of connections
let socketCount = 0;

//Counter for number of actions detected.
let actionCounter = 0;

//Instantiate object to hold information about the user and actions sent by that user.
let actionObj = {};

io.on('connection', function(socket) {
    console.log("Socket connected!", socket.id);
    socketCount++;
    console.log(socketCount);

    socket.on('disconnect', function() {
        socketCount--;
        console.log(socketCount);
        console.log('User Disconnected.');
    })

    //Limit Number of players allowed in a game.
    if (socketCount > 2) {
        socket.emit('tooManyPlayers', 'I\'m sorry, too many connections');
        socket.disconnect();
    }

    if (socketCount < 2) {
        socket.emit('waiting', 'Waiting for another player');
    }

    if (socketCount === 2) {
        io.sockets.emit('enoughPlayers', 'Enough Players!');
    }

    socket.on('action', function(data) {
        if (Object.keys(actionObj).indexOf(socket.id) === -1) {
            actionObj[socket.id] = data;
            io.sockets.emit("action", actionObj);
            actionCounter++;
            socket.broadcast.emit('actionSent');
        }
        if (actionCounter === 2) {
            reportOutcome();
            actionCounter = 0;
            actionObj = {};
        }
    });

    socket.on('reset', function() {
        console.log('reset detected');
        actionObj = {};
        io.sockets.emit('reset');
    });

    function reportOutcome() {
        let users = Object.keys(actionObj);
        console.log(users);
        //First action: Rock Condition
        if (actionObj[users[0]] === 'Rock') {
            if (actionObj[users[1]] === 'Rock') {
                io.sockets.emit("draw");
                io.sockets.emit("Rock");
            } else if (actionObj[users[1]] === 'Scissors') {
                io.sockets.to(users[1]).emit("lose");
                io.sockets.to(users[1]).emit("Scissors");

                io.sockets.to(users[0]).emit("win");
                io.sockets.to(users[0]).emit("Rock");

            } else if (actionObj[users[1]] === 'Paper') {
                io.sockets.to(users[1]).emit("win");
                io.sockets.to(users[1]).emit("Paper");

                io.sockets.to(users[0]).emit('lose');
                io.sockets.to(users[0]).emit("Rock");
            }
        }

        //First action: Paper Condition
        if (actionObj[users[0]] === 'Paper') {
            if (actionObj[users[1]] === 'Paper') {
                io.sockets.emit("draw");
                io.sockets.emit("Paper");
            } else if (actionObj[users[1]] === 'Scissors') {
                io.sockets.to(users[1]).emit("win");
                io.sockets.to(users[1]).emit("Scissors");

                io.sockets.to(users[0]).emit("lose");
                io.sockets.to(users[0]).emit("Paper");

            } else if (actionObj[users[1]] === 'Rock') {
                io.sockets.to(users[1]).emit("lose");
                io.sockets.to(users[1]).emit("Rock");

                io.sockets.to(users[0]).emit('win');
                io.sockets.to(users[0]).emit("Paper");

            }
        }
        //First action: Scissors Condition
        if (actionObj[users[0]] === 'Scissors') {
            if (actionObj[users[1]] === 'Scissors') {
                io.sockets.emit("draw");
                io.sockets.emit("Scissors");

            } else if (actionObj[users[1]] === 'Rock') {
                io.sockets.to(users[1]).emit("win");
                io.sockets.to(users[1]).emit("Rock");

                io.sockets.to(users[0]).emit("lose");
                io.sockets.to(users[0]).emit("Scissors");

            } else if (actionObj[users[1]] === 'Paper') {
                io.sockets.to(users[1]).emit("lose");
                io.sockets.to(users[1]).emit("Paper");

                io.sockets.to(users[0]).emit('win');
                io.sockets.to(users[0]).emit("Scissors");
            }
        }
    }
});
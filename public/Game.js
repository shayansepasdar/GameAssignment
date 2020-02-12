const socket = io.connect();

//DOM queries
const output = document.getElementById('output');
const sendActionBtn = document.getElementById('sendAction');
const resetBtn = document.getElementById('resetGame');


const rockBtn = document.getElementById('rock');
const paperBtn = document.getElementById('paper');
const scissorsBtn = document.getElementById('scissors');

const radioBtns = document.getElementsByName('action');


socket.on('tooManyPlayers', function() {
    output.innerHTML = "I'm sorry, only 2 players can be in a game at once."
});

socket.on('waiting', function() {

    output.innerHTML = "Waiting for another player..."
});

socket.on('enoughPlayers', function() {
    output.innerHTML = "Begin Game! Choose your move!"
});


function allowSubmit() {
    for (i = 0; i < radioBtns.length; i++) {
        radioBtns[i].onclick = function() {
            sendActionBtn.removeAttribute('disabled');
        }
    }
}

function disableRadio() {
    for (i = 0; i < radioBtns.length; i++) {
        radioBtns[i].disabled = true;
    }
}

function enableRadio() {
    for (i = 0; i < radioBtns.length; i++) {
        radioBtns[i].disabled = false;
    }
}

function resetRadio() {
    for (i = 0; i < radioBtns.length; i++) {
        radioBtns[i].checked = false;
    }
}

const actionInput = document.forms[0].action;

resetBtn.addEventListener('click', function() {
    socket.emit('reset');
});

allowSubmit();

sendActionBtn.addEventListener('click', function() {
    sendActionBtn.setAttribute('disabled', '');
    sendActionBtn.innerHTML = "Waiting on your opponent...";
    disableRadio();

    socket.emit('action', actionInput.value);
});

socket.on('actionSent', function() {
    output.innerHTML = "The opponent sent an action. Hurry up."
});

socket.on('draw', function() {
    sendActionBtn.removeAttribute('disabled');
    sendActionBtn.innerHTML = "Send Action";
    resetBtn.removeAttribute('disabled');
    sendActionBtn.setAttribute('disabled', '');

    output.innerHTML = "";
    socket.on("Rock", function() {
        output.innerHTML = "You both chose rock. It's a Draw. <br>";
    });
    socket.on("Scissors", function() {
        output.innerHTML = "You both chose scissors. It's a Draw.<br>";
    });
    socket.on("Paper", function() {
        output.innerHTML = "You both chose paper. It's a Draw.<br>";
    });
});

socket.on('win', function() {
    sendActionBtn.removeAttribute('disabled');
    sendActionBtn.innerHTML = "Send Action";
    resetBtn.removeAttribute('disabled');
    sendActionBtn.setAttribute('disabled', '');

    output.innerHTML = "";
    socket.on("Rock", function() {
        output.innerHTML = "Your opponent chose scissors. You win!";
    });
    socket.on("Paper", function() {
        output.innerHTML = "Your opponent chose rock. You win!";
    });
    socket.on("Scissors", function() {
        output.innerHTML = "Your opponent chose paper. You win!";
    });

});

socket.on('lose', function() {
    sendActionBtn.removeAttribute('disabled');
    sendActionBtn.innerHTML = "Send Action";
    resetBtn.removeAttribute('disabled');
    sendActionBtn.setAttribute('disabled', '');

    output.innerHTML = "";
    socket.on("Rock", function() {
        output.innerHTML = "Your opponent chose paper. You lose!";
    });
    socket.on("Paper", function() {
        output.innerHTML = "Your opponent chose scissors. You lose!";
    });
    socket.on("Scissors", function() {
        output.innerHTML = "Your opponent chose rock. You lose!";
    });
});

socket.on('reset', function() {
    resetBtn.setAttribute('disabled', '');
    output.innerHTML = "";
    resetRadio();
    enableRadio();
})
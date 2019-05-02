const PORT_S = 8889;
const PORT_R = 8890;
const HOST = '192.168.10.1';

var express = require('express');
var app = express();

const io = require('socket.io')(9000);

const dgram = require('dgram');
const drone = dgram.createSocket('udp4');

const droneState = dgram.createSocket('udp4');
droneState.bind(PORT_R);

var timeOuts = [];


//var commands = ['command', 'takeoff', 'go 50 0 0 100', 'go 0 50 0 100', 'go 0 0 50 100', 'land'];
var commands = [];

// ===================== EXPRESS SERVER =====================
app.use(express.static(__dirname));

app.get('/tello', function (req, res) {
  res.sendfile('index.html');
});

app.listen(8080, function () {
    console.log('---------------------------------------');
    console.log('----------- LOCALHOST:8080 ------------');
    console.log('---------------------------------------');
    console.log('| /tello      | index.html            |');
    console.log('| /           | index.html            |');
    console.log('---------------------------------------');
});

// ===================== SOCKET.IO SERVER =====================
io.on('connection', function(socket){
    console.log('Novo usuário conectado');
  
    socket.on('executar', (data, callback) => {
//        console.log(data);
        commands = data.commands;
        console.log('-- COMANDOS RECEBIDOS --');
        for(comando in commands){
//            console.log('| ' + comando + ' | ' + commands[comando]);
            console.log('| ' + comando + ' | ' + commands[comando].command);
        }
        console.log('------------------------');
        
        sendCommand('command');
        timeOuts.push(setTimeout(() => {runCommands(0);}, 8000));
    });
    
    socket.on('emergency', (data, callback) => {
        sendCommand('emergency');
        console.log(timeOuts.length);
        for(timeout in timeOuts){
            console.log('EXCLUÍDO');
            clearTimeout(timeOuts[timeout]);
            timeOuts.splice(timeout, 1);
            timeout--;
        }
    });
});

// ===================== DGRAM SERVER =====================
droneState.on('error', (err) => {
//  console.log('Novo erro: ' + err);
});

droneState.on('message', (msg, rinfo) => {
//  console.log('Nova mensagem: ' + msg);
});


// ===================== FUNCTIONS =====================
function sendCommand(command){
    console.log(command);
    let message = Buffer.from(command);
    drone.send(message, 0, message.length, PORT_S, HOST, (response) => {
//        console.log(response);
    })
}

function runCommands(pos){
    if(pos == null){
        pos = 0;
    }
    var time = 10000;
    if(pos < commands.length){
//        sendCommand(commands[pos]);
//        console.log(commands[pos]);
        sendCommand(commands[pos].command);
//        console.log(commands[pos].command);
        pos++;
        if(pos == 0){
            time = 15000;
        }
        timeOuts.push(setTimeout(() => {runCommands(pos);}, time));
    } else {
        console.log('ACABOU');
    }
}
const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');

const mongoose = require('mongoose');

const app = express();

app.set('port', process.env.PORT || 3000);

const server = http.createServer(app);
const io = socketio(server);
const dbURL = process.env.MONGODB_URL; 

if (!dbURL) {
    console.error("ERROR: La variable MONGODB_URL no está definida.");
}

mongoose.connect(dbURL)
    .then(db => console.log('Base de datos conectada'))
    .catch(err => console.log('Error en DB', err))
require('./Sockets.js')(io);


app.use(express.static(path.join(__dirname, 'public')));

server.listen(app.get('port'),'0.0.0.0', ()=>{
    console.log("Servidor en el puerto ", app.get('port'));
});
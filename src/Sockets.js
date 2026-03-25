const Chat = require('../Models/Chat.js');

const e = require("express");

module.exports = function (io){

    let users = {};
    const colors = {};
    const colorList = [
        '#FF5733', '#33FF57', '#3357FF', '#FF33A8',
        '#FFC300', '#8E44AD', '#1ABC9C', '#E67E22'
    ];
    
    io.on('connection', async socket =>{
        console.log("Nuevo usuario conectado");

        let messages = await Chat.find({}).limit(8).sort({created_at: -1});
        socket.emit('Cargando viejos mensajes', messages.reverse());

        socket.on('Nuevo Usuario', (data, cb) => {
            if (data in users) {
                cb(false);
            } else {
                cb(true);
                socket.nickName = data;
                users[socket.nickName] = socket;

                const color = colorList[Math.floor(Math.random()* colorList.length)]
                colors[data]=color;

                updateNickNames();
            }
        });

        socket.on("Enviar mensaje", async function(data, cb){
            if(!socket.nickName) return;

            let msg = data.trim();

            if(msg.substr(0,3) === '/w '){
                msg = msg.substr(3);
                const index = msg.indexOf(' ');

                if(index !== -1){
                    const name = msg.substring(0, index);
                    msg = msg.substring(index + 1);

                    if(name in users){
                        users[name].emit('whisper', {
                            msg,
                            nick: socket.nickName
                        });
                        socket.emit('whisper', {
                            msg,
                            nick: socket.nickName
                        });
                    } else {
                        cb('Error: usuario no existe');
                    }
                } else {
                    cb('Error: mensaje inválido');
                }

            } else {
                var newMsg = new Chat({
                    msg,
                    nick: socket.nickName
                });
                await newMsg.save();
                io.emit('Nuevo Mensaje', {
                    msg : msg,
                    nick: socket.nickName,
                    color: colors[socket.nickName]
                });
            }
        });

        socket.on('disconnect', () => {
            if(!socket.nickName) return;
            
            delete users[socket.nickName];

            updateNickNames();

            io.emit('Nuevo Mensaje', {
                msg: 'Se ha desconectado',
                nick: socket.nickName
            });
        });

        function updateNickNames(){
            io.sockets.emit('userNames', Object.keys(users));
        }
    });
}
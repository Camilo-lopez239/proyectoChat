$(function(){
    
    const socket = io();
    
    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $('#chat');

    $messageForm.submit(e => {
        e.preventDefault();
        const msg = $messageBox.val().trim();
        if(msg === '') return;
        socket.emit('Enviar mensaje', $messageBox.val(), data => {
            $chat.append(`<p class ="error">${data}</p>`);
        });

        $messageBox.val('');
    });

    socket.on('Nuevo Mensaje', function(data){
        $chat.append(
            `<span style="color:${data.color}; font-weight:bold;">
                ${data.nick}
            </span>: ${data.msg}<br/>`
        );

    })

    const $nickForm= $('#nickForm');
    const $nickError= $('#nickError');
    const $nickName= $('#nickName');

    const $users = $('#userNames');

    $nickForm.submit(e=> {
        e.preventDefault();

        const nombreUsuario = $nickName.val().trim(); // quitar espacios
        if(nombreUsuario === '') {
            $nickError.html(`<div class="alert alert-danger mt-2" role="alert">
                ¡El nombre no puede estar vacío!
            </div>`);
            return;
        }
        socket.emit('Nuevo Usuario', $nickName.val(), data => {
            if(data){
                $('#nickWarp').hide();
                $('#contentWarp').show();
            }else{
                $nickError.html(`<div class = "alert alert-danger mt-2" role="alert">
                        !!!!!!Este usuario ya existe!!!
                    </div>`);
            }
            $nickName.val('');
        })
    });
    socket.on('userNames', data =>{
        let html = '';
        for(let i=0; i < data.length; i++){
            html += `<p><i class="fas fa-user"></i> ${data[i]}</p>`
        }
        $users.html(html);
    })
    socket.on('whisper', function(data){
        $chat.append(`<p class="whisper"><b>${data.nick}</b>: ${data.msg}</p>`);
    });
    socket.on('Cargando viejos mensajes', msgs => {
        for(let i=0; i< msgs.length; i++){
            displayMsg(msgs[i]);
        }
    })
    function displayMsg(data){
        $chat.append(`<p class="whisper"><b>${data.nick}:</b> ${data.msg}</p>`);
    }
})
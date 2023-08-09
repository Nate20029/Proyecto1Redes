const Strophe = require('strophe.js').Strophe;
const $ = require('strophe.js').$;

// Datos de conexión
const XMPP_SERVER = 'alumchat.xyz';
const BARE_JID = 'nate@alumchat.xyz';
const PASSWORD = 'barcaroly';


const connection = new Strophe.Connection(`ws://${XMPP_SERVER}:5280/xmpp-websocket`);

// Conexion
const onConnect = (status) => {
    if (status === Strophe.Status.CONNECTED) {
        console.log('Conectado al servidor XMPP');

        // Enviar un mensaje
        const recipientJID = '1220@alumchat.xyz';
        const messageText = '¡Hola desde mi cliente XMPP!';
        sendMessage(recipientJID, messageText);
    }
};

// Enviar mensaje
const sendMessage = (to, messageBody) => {
    const message = $msg({
        to: to,
        type: 'chat',
    }).c('body').t(messageBody);

    connection.send(message);
};


// Autenticacion
connection.connect(BARE_JID, PASSWORD, onConnect);

//Errores
connection.addHandler((error) => {
    console.error('Error de conexión:', error);
    return true;
}, null, 'error', null);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { client, xml } = require("@xmpp/client");

// Datos de conexión al servidor XMPP
const xmppOptions = {
  service: "alumchat.xyz",
  username: "natanael",
  password: "barcaroly",
};

// Crear una instancia del cliente XMPP
const xmppClient = client({
  service: xmppOptions.service,
  username: xmppOptions.username,
  password: xmppOptions.password,
});

// Manejadores de eventos
xmppClient.on("online", (jid) => {
  console.log(`Conectado como ${jid.toString()}`);
  const message = xml("message", { to: "natanael@alumchat.xyz", type: "chat" }, [
    xml("body", {}, "¡Hola desde XMPP en JavaScript!"),
  ]);
  xmppClient.send(message);
});

xmppClient.on("error", (err) => {
  console.error("Error:", err);
});

xmppClient.on("offline", () => {
  console.log("Desconectado");
});

// Iniciar la conexión
xmppClient.start().catch((err) => console.error("Error al iniciar la conexión:", err));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { client, xml } = require("@xmpp/client");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Datos de conexión al servidor XMPP
const xmppOptions = {
  service: "alumchat.xyz",
};

// Función para crear un usuario utilizando XEP-0077
async function createUser(newUsername, newPassword) {
  const adminClient = client({
    service: xmppOptions.service,
    username: "natanael", 
    password: "barcaroly", 
  });

  adminClient.on("online", async () => {
    console.log("Conectado al servidor XMPP como administrador");

    const iq = xml("iq", {
      type: "set",
      id: "reg1",
    });

    iq.c("query", { xmlns: "jabber:iq:register" })
      .c("username").t(newUsername).up()
      .c("password").t(newPassword);

    const response = await adminClient.send(iq);

    adminClient.stop();
    rl.close();
  });

  adminClient.on("error", (err) => {
    console.error("Error:", err);
    rl.close();
  });

  try {
    await adminClient.start();
  } catch (err) {
    console.error("Error al iniciar la conexión:", err);
    rl.close();
  }
}

// Función para iniciar sesión con un usuario existente
async function loginExistingUser(username, password) {
  const xmppClient = client({
    service: xmppOptions.service,
    username: username,
    password: password,
  });

  xmppClient.on("online", (jid) => {
    console.log(`Conectado como ${jid.toString()}`);
    const message = xml("message", { to: "natanael@alumchat.xyz", type: "chat" }, [
      xml("body", {}, "¡Hola desde XMPP en JavaScript!")
    ]);
    xmppClient.send(message);
  });

  xmppClient.on("error", (err) => {
    console.error("Error:", err);
  });

  xmppClient.on("offline", () => {
    console.log("Desconectado");
  });

  try {
    await xmppClient.start();
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
  }
}

// Solicitar la opción al usuario al inicio
rl.question("¿Deseas crear un usuario nuevo o entrar con uno existente? (crear/existente): ", (choice) => {
  if (choice === "crear") {
    rl.question("Ingrese un nombre de usuario nuevo: ", (newUsername) => {
      rl.question("Ingrese una contraseña para el nuevo usuario: ", (newPassword) => {
        createUser(newUsername, newPassword);
        rl.close();
      });
    });
  } else if (choice === "existente") {
    rl.question("Ingrese el nombre de usuario existente: ", (existingUsername) => {
      rl.question("Ingrese la contraseña: ", (existingPassword) => {
        loginExistingUser(existingUsername, existingPassword);
        rl.close();
      });
    });
  } else {
    console.log("Opción no válida. Por favor, elige 'crear' o 'existente'.");
    rl.close();
  }
});

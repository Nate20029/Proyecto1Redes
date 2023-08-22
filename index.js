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

// Función para crear un usuario nuevo
async function createUser(newUsername, newPassword) {
  const adminClient = client({
    service: xmppOptions.service,
    username: "natanael", 
    password: "barcaroly", 
  });

  adminClient.on("online", async () => {

    const iq = xml("iq", {
      type: "set",
      id: "reg1",
    });

    iq.c("query", { xmlns: "jabber:iq:register" })
      .c("username").t(newUsername).up()
      .c("password").t(newPassword);

    const response = await adminClient.send(iq);

    adminClient.stop();
    console.log("Usuario creado EXITOSAMENTE");
    showUserOptions(xmppClient);
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

    // Mostrar opciones al usuario
    showUserOptions(xmppClient);

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

// Función para enviar un mensaje a una persona
function sendMessage(xmppClient) {
  rl.question("Ingrese el nombre de usuario del destinatario: ", (recipient) => {
    rl.question("Ingrese el mensaje a enviar: ", (messageText) => {
      const message = xml("message", { to: recipient + "@" + xmppOptions.service, type: "chat" }, [
        xml("body", {}, messageText)
      ]);
      xmppClient.send(message);

      // Volver a mostrar el menú después de enviar el mensaje
      showUserOptions(xmppClient);
    });
  });
}


// Función para eliminar un usuario
async function deleteCurrentUser(xmppClient) {
  const iq = xml("iq", {
    type: "set",
    id: "del1",
  });

  iq.c("query", { xmlns: "jabber:iq:register" })
    .c("remove");

  try {
    const response = await xmppClient.send(iq);
    console.log(`Usuario ${xmppClient.jid.local} eliminado EXITOSAMENTE`);
    xmppClient.stop(); 
    rl.close();
  } catch (err) {
    console.error("Error al eliminar el usuario:", err);
    rl.close();
  }
}




// Mostrar opciones al usuario ya adentro
function showUserOptions(xmppClient) {
  rl.question(
    "Seleccione una opción:\n1. Enviar mensaje\n2. Eliminar mi cuenta\n3. Cerrar Sesión\n",
    (option) => {
      if (option === "1") {
        // Opción para enviar mensaje
        sendMessage(xmppClient);
      } else if (option === "2") {
        // Opción para eliminar mi cuenta
        deleteCurrentUser(xmppClient);
      } else if (option === "3") {
        // Opción para cerrar sesión y desconectar
        xmppClient.stop();
        rl.close();
      } else {
        console.log("Opción no válida.");
        showUserOptions(xmppClient);
      }
    }
  );
}



// Mostrar opciones iniciales al usuario
function showInitialOptions() {
  rl.question("¿Deseas crear un usuario nuevo o entrar con uno existente? (crear/existente): ", (choice) => {
    if (choice === "crear") {
      rl.question("Ingrese un nombre de usuario nuevo: ", (newUsername) => {
        rl.question("Ingrese una contraseña para el nuevo usuario: ", (newPassword) => {
          createUser(newUsername, newPassword);
        });
      });
    } else if (choice === "existente") {
      rl.question("Ingrese el nombre de usuario existente: ", (existingUsername) => {
        rl.question("Ingrese la contraseña: ", (existingPassword) => {
          loginExistingUser(existingUsername, existingPassword);
        });
      });
    } else {
      console.log("Opción no válida. Por favor, elige 'crear' o 'existente'.");
      showInitialOptions();
    }
  });
}

// Menu inicial
showInitialOptions();

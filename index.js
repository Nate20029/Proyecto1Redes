process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { client, xml } = require("@xmpp/client");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// XMPP server connection options
const xmppOptions = {
  service: "alumchat.xyz",
};

// Function to create a new user
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

// Function to log in with an existing user
async function loginExistingUser(username, password) {
  const xmppClient = client({
    service: xmppOptions.service,
    username: username,
    password: password,
  });

  xmppClient.on("online", (jid) => {
    console.log(`Conectado como ${jid.toString()}`);

    // Show options to the user
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

// Function to send a message to a person
function sendMessage(xmppClient) {
  rl.question("Ingrese el nombre de usuario del destinatario: ", (recipient) => {
    rl.question("Ingrese el mensaje a enviar: ", (messageText) => {
      const message = xml("message", { to: recipient + "@" + xmppOptions.service, type: "chat" }, [
        xml("body", {}, messageText)
      ]);
      xmppClient.send(message);

      // Show the menu again after sending the message
      showUserOptions(xmppClient);
    });
  });
}


// Function to delete a user
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


// Function to create a chat with a user
function createChat(xmppClient,password) {
  rl.question("Ingrese el nombre de usuario con quien desea chatear: ", (recipient) => {
    const chatJID = `${recipient}@${xmppOptions.service}`;

    // Register the chat in the bookmarks of the current user
    xmppClient.send(xml("iq", { type: "set", id: "bookmark1" }, [
      xml("pubsub", { xmlns: "http://jabber.org/protocol/pubsub#owner" }, [
        xml("configure", { node: "urn:xmpp:chat-markers:0" }, [
          xml("x", { xmlns: "jabber:x:data", type: "submit" }, [
            xml("field", { var: "FORM_TYPE", type: "hidden" }, [
              xml("value", "http://jabber.org/protocol/pubsub#node_config")
            ]),
            xml("field", { var: "muc#roomconfig_enablearchiving", type: "boolean", value: "false" }),
            xml("field", { var: "muc#roomconfig_enablelogging", type: "boolean", value: "false" }),
            xml("field", { var: "FORM_TYPE", type: "hidden" }, [
              xml("value", "http://jabber.org/protocol/pubsub#subscribe_authorization")
            ]),
          ])
        ])
      ])
    ]));


    console.log("Iniciando chat con", recipient);

    const chatClient = client({
      service: xmppOptions.service,
      username: xmppClient.jid.local,
      password: password,
    });

    chatClient.on("online", (jid) => {
      console.log(`Chateando con ${recipient}`);
      rl.prompt();
    });

    chatClient.on("stanza", (stanza) => {
      console.log("Stanza recibida:", stanza.toString());
      if (stanza.is("message")) {
        console.log("Es un mensaje");
        if (stanza.attrs.from === chatJID && stanza.getChildText("body")) {
          console.log(`${recipient}: ${stanza.getChildText("body")}`);
        }
      }  
    });

    chatClient.on("error", (err) => {
      console.error("Error en el chat:", err);
    });

    try {
      chatClient.start().catch((err) => {
        console.error("Error al iniciar el chat:", err);
      });
    } catch (err) {
      console.error("Error al iniciar el chat:", err);
    }

    rl.prompt();

    rl.on("line", (input) => {
      if (input.toLowerCase() === "/salir") {
        console.log("Saliendo del chat...");
        chatClient.stop();
      } else {
        const message = xml("message", { to: chatJID, type: "chat" }, [
          xml("body", {}, input),
          xml("x", { xmlns: "jabber:x:event" }, [
            xml("composing")
          ])
        ]);
        chatClient.send(message);
        rl.prompt();
      }
    });

  });
}

// Function to get contacts 
async function getContactsPresence(xmppClient) {
  console.log("Obteniendo Contactos...");

  try {
    // Request the roster of contacts
    const rosterIQ = xml("iq", { type: "get", id: "roster1" }, [
      xml("query", { xmlns: "jabber:iq:roster" }),
    ]);

    console.log("Enviando roster request...");
    const rosterResponse = await xmppClient.send(rosterIQ);

    // Wait for the roster response
    const rosterResult = await rosterResponse;
    
    // Process the roster response
    const contacts = rosterResult.getChild("query").getChildren("item");
    for (const contact of contacts) {
      const jid = contact.attrs.jid;
      console.log("Contact:", jid);

      // Request presence of the contact
      console.log("Solicitando presencia de :", jid);
      const presenceRequest = xml("presence", { to: jid });
      const presenceResponse = await xmppClient.send(presenceRequest);

       // Get and display the presence
      const presence = presenceResponse.getChild("show");
      console.log("Presencia:", presence ? presence.getText() : "available");
      console.log("-------------------------------");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}



// Show user options once logged in
function showUserOptions(xmppClient) {
  rl.question(
    "Seleccione una opción:\n1. Enviar mensaje\n2. Eliminar mi cuenta\n3. Chatear con usuario\n4. Ver estado de usuarios conectados\n5. Cerrar Sesión\n",
    (option) => {
      if (option === "1") {
        // Option to send a message
        sendMessage(xmppClient);
      } else if (option === "2") {
        // Option to delete my account
        deleteCurrentUser(xmppClient);
      } else if (option === "3") {
        // Option to chat with a user
        rl.question("Ingrese su contraseña: ", (password) => {
          createChat(xmppClient, password);
        });
      } else if (option === "4") {
        // Option to view connected users' status
        getContactsPresence(xmppClient);
      } else if (option === "5") {
        // Option to log out and disconnect
        xmppClient.stop();
        rl.close();
      } else {
        console.log("Opción no válida.");
        showUserOptions(xmppClient);
      }
    }
  );
}



// Show initial options to the user
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

// Initial menu
showInitialOptions();

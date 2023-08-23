# Proyecto1Redes
This project is an XMPP client in which functions are used to communicate with the server.

## Prerequisites

Before running this application, make sure you have Node.js (https://nodejs.org/) installed on your system.

## Installation

1. Clone this repository to your local machine:

```bash
git clone https://github.com/TuUsuario/TuRepositorio.git
```

2. Navigate to the Project directory
```bash
cd repositoryName
```

3. Install the necessary dependencies:
```bash
npm install
```


## Installation

Run the application using the following command:

```bash
npm start
```

The application will display a menu where you can choose different options such as sending messages, chatting with other users, deleting the account, viewing the status of users, contacts, and more.

## Configuration

Before running the application, make sure to correctly configure the XMPP server connection details in the index.js file. Modify the xmppOptions constant with the information of the server you want to use, in this case "alumchat.xyz":

```bash
const xmppOptions = {
  service: "alumchat.xyz",
};

```

## Main Functions

- Create New User
The createUser(newUsername, newPassword) function allows you to create a new user on the XMPP server. It connects to the server as an administrator and registers a new user with the provided username and password.

- Log In with Existing User
The loginExistingUser(username, password) function allows you to log in to the XMPP server with an existing user. Once logged in, you can access various options such as sending messages, chatting with other users, and more.

- Send Message
The sendMessage(xmppClient) function allows you to send a chat message to another user. It prompts for the recipient's username and the message you want to send. The message is sent to the recipient using the XMPP protocol.

- Delete User
The deleteCurrentUser(xmppClient) function allows you to delete your user account from the XMPP server. It sends a request to delete the account, and if successful, the session and XMPP connection are closed.

- Chat with User
The createChat(xmppClient, password) function allows you to initiate a one-on-one chat with another user. It asks for the recipient's username and your password for authentication. Once the chat is initiated, you can send and receive real-time messages.

- View Status of Connected Users
The getContactsPresence(xmppClient) function allows you to obtain the list of your contacts and their presence statuses. It sends presence requests to your contacts and shows if they are available, away, etc.

- Show User Options
The showUserOptions(xmppClient) function displays an interactive menu after logging in. It allows you to choose from various options such as sending messages, chatting, deleting your account, viewing the status of connected users, and logging out.

- Show Initial Options
The showInitialOptions() function displays a menu at the beginning to select whether you want to create a new user or log in with an existing one. Depending on your choice, the corresponding functions will be executed.

## Authors

- [@NatanaelGirón](https://www.github.com/Nate20029)

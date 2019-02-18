# ChatNet - Gift of Asynchronous Babble Chat Client

##### Designed by Mihail Kaburis for CIS 4930 Advanced JavaScript (Spring 2019)

## GAB Server
The ChatNet Client utilizes a "Gift of Asychrounous Babble" (GAB) chat server designed by Dr. William Oropallo. The GAB server utilizes WebSockets to connect to clients and distribute messages between them. The GAB Server files and README (renamed oldREADME) have been forked from Dr. Oropallo, and can be found in the **GAB Server** folder.

## Getting Started

The ChatNet Client includes all necessary files (aside from the dependendencies).

## Installing the ChatNet Client

##### Inside of the gab-server directory

`npm install`
`node .`

*For additional details regarding the GAB Server please see the oldREADME*

##### Inside of the gab-client directory

`npm install`
`node chatnetClient.js`

## Using the ChatNet Client

##### Logging In

To login to ChatNet type in a username between *3 and 10 alphanumeric characters*.
If another client logged into the GAB-Server has the same username, the ChatNet Client will inform you about this and terminate.

##### Main Functions Once Logged In

* Upon a successful login, a user can message the entire server by typing a message into the console and pressing the `return` key. 
* A user can request a full list of commands for the ChatNet Client by typing `.help` and pressing the `return` key.
* A user can send a direct message to another user by typing `.dm [user to send message to]` and pressing the `return` key.
* A user can ask to find the weather in a particular city by typing `.weather [city]` and pressing the `return` key.
* A user can request a list of connected to the GAB Server by typing `.userList` and pressing the `return` key.
* A user can request to find their username from the GAB Server by typing `.whoAmI` and pressing the   `return` key.
* A user can exit the ChatNet Client by pressin the `ctrl+c` keys.

## Using Styled Expressions

The Gab ChatNet client includes a styledExpressions.json file where a user can modify how certain keywords are outputted to the console. For instance the JSON object: `{"expression": "Florida", "style": "green"}` will change all instances of the expression 'Florida' to the color green in the console.

## Built With

* [websocket](https://github.com/theturtle32/WebSocket-Node) - A WebSocket Implementation for Node.JS
* [prompt](https://github.com/flatiron/prompt) - A beautiful command-line prompt for node.js
* [terminal-kit](https://github.com/cronvel/terminal-kit) - Terminal utilities for node.js
* [request](https://github.com/request/request) - 🏊🏾 Simplified HTTP request client

## Versioning

The version of this client is included for demonstration purposes. However, any bugfixes or modifications will be reflected below:

# ChatNet - Gift of Asynchronous Babble Chat Client

##### Designed by Mihail Kaburis for CIS 4930 Advanced JavaScript (Spring 2019)

## GAB Server
The ChatNet Client utilizes a "Gift of Asychrounous Babble" (GAB) chat server designed by Dr. William Oropallo. The GAB server utilizes WebSockets to connect to clients and distribute messages between them. The GAB Server files and README (renamed oldREADME) have been forked from Dr. Oropallo, and can be found in the **GAB Server** folder.

## Getting Started

The ChatNet Client includes all necessary files (aside from the dependendencies).

## Installing the ChatNet Client

Inside of the gab-server directory:

`npm install`
`node .`

*For additional details regarding the GAB Server please see the oldREADME*

Inside of the gab-client directory:
`npm install`
`node chatnetClient.js`

## Built With

* [websocket](https://github.com/theturtle32/WebSocket-Node) - A WebSocket Implementation for Node.JS
* [prompt](https://github.com/flatiron/prompt) - A beautiful command-line prompt for node.js
* [terminal-kit](https://github.com/cronvel/terminal-kit) - Terminal utilities for node.js
* [request](https://github.com/request/request) - 🏊🏾 Simplified HTTP request client


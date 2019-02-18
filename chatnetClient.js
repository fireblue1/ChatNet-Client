/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const term = require('terminal-kit').terminal;
const prompt = require('prompt');
const WebSocket = require('ws');
const request = require('request');
const styledExpressions = require('./styledExpressions');

/* ********************************************************************************************** */
/* *****************************************Utilities******************************************** */
/* ********************************************************************************************** */
let specialOperation = false; // Flag variable for special chat operations
let dmProcess = false; // Flag variable for direct message process
let expressionOperation = false; // Flag variable for style expressions
let user = ''; // The username for the client
let consoleBuffer = ''; // Buffer for user input from console
const msgText = ''; // Message body for all messages
const recipient = ''; // Recipient's client username
const termHeight = term().height; // Height of the terminal

const pongErrorData = 'Did not get a return Pong. Terminating Connection.';
const takenUserNameData = 'Your username is taken, please try again with a different name. Terminating Connection.';

const checkUserName = /^\w{3,10}$/; // Checks if username is between 3-9 alphanumeric characters
const checkHelpMenu = /.help/; // Checks if user has prompted console for help menu
const checkDirectMessage = /.dm/; // Check if user has prompted console to send direct message
const checkUserList = /.userList/; // Check if user has prompted console for user list
const checkWhoAmI = /.whoAmI/; // Check if user has prompted console for individual username
const checkWeather = /.weather/; // Check if user has prompted console to play Tic-Tac-Toe

// Schema for Prompt to check if username is valid!
const userIsValid = {
  properties: {
    userName: {
      pattern: checkUserName,
      message: 'Usernames must be between 3 and 10 alphanumeric characters!',
      required: true,
    },
  },
};

// List of help items displayed when user requests '.help' in console
const helpItems = [
  '.dm [username]  -> SEND A DIRECT MESSAGE TO A SINGLE USER',
  '.weather [city] -> CHECK THE WEATHER IN A PARTICULAR LOCATION',
  '.userList       -> RETRIEVE LIST OF USERS WHO ARE ONLINE',
  '.whoAmI         -> RETREIVE YOUR USERNAME',
  'ctrl+c          -> EXIT THE CHAT CLIENT',
];
/* ********************************************************************************************** */
/* *******************************************Weather******************************************** */
/* ********************************************************************************************** */

const apiKey = '191428190a4a03a7b0c91e13dde502e5';
let city = ''; // City to be retreived from user

// Retreives JSON from OpenWeatherMap APIs
const getWeather = () => {
  const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

  request(weatherUrl, (error, response, body) => {
    if (error) {
      term.red().bold('ERROR: ', error); // Print error if one occurred
    } else {
      const weatherData = JSON.parse(body);
      if (weatherData.name === undefined) { // Weather in location not found
        term.italic(`We couldn't find the weather in ${city}!\n`);
      } else {
        const weatherType = weatherData.weather[0].main;
        console.log(weatherType);
        let weatherCondition = '';
        switch (weatherType) { // Check various types of weather conditions
          case 'Clear':
            weatherCondition = 'clear';
            break;
          case 'Clouds':
            weatherCondition = 'cloudy';
            break;
          case 'Rain':
            weatherCondition = 'rainy';
            break;
          case 'Fog':
            weatherCondition = 'foggy';
            break;
          case 'Mist':
            weatherCondition = 'misty';
            break;
          default:
            weatherCondition = undefined;
        }
        term.blue().bold('Weather: ').styleReset();
        term('In ').bold(`${weatherData.name} `).styleReset(`it is currently ${weatherData.main.temp}°F `);
        term(`and ${weatherCondition} outside\n`);
      }
    }
  });
};

/* ********************************************************************************************** */
/* *************************************Requests to Server Utilities***************************** */
/* ********************************************************************************************** */

// JSON object to message the entire GAB server
const msgEntireServer = {
  from: user,
  to: 'all',
  kind: 'chat',
  data: msgText,
};

// JSON object to send a private message to another user connected to the GAB server
const directMsg = {
  from: user,
  to: recipient,
  kind: 'direct',
  data: msgText,
};

// JSON object to receive list of connected users from the GAB server
const connectedUsers = {
  from: user,
  to: '',
  kind: 'userlist',
  data: '',
};

// JSON object that returns the current client's username connected to the GAB server
const clientUsername = {
  from: user,
  to: '',
  kind: 'whoami',
  data: '',
};

/* ********************************************************************************************** */
/* *************************************Connection Setup***************************************** */
/* ********************************************************************************************** */

// Prompts user for username upon execution of gabclient+.js
const getUser = new Promise((resolve, reject) => {
  term.blue().bold('### Welcome to GAB ChatNet v0.1.8 ###\n');
  term.defaultColor();
  prompt.start();
  prompt.get(userIsValid, (err, result) => {
    user = result.userName;
    resolve(result.userName);
    reject(err);
  });
});

const gabConnect = new Promise((resolve, reject) => {
  getUser.then((name) => {
    const ws = new WebSocket(`ws://127.0.0.1:4930/?username=${name}`);
    resolve(ws);
    reject(new Error('Error: cannot connect'));
  });
});

/* ********************************************************************************************** */
/* ***************************************Client Functions*************************************** */
/* ********************************************************************************************** */

// Sets flags depending on the contents of consoleBuffer
const checkBuffer = () => {
  specialOperation = false; // Reset specialOperation to false each time consoleBffer is checked
  // Display help menu if user types '.help' into consoleBuffer
  if (checkHelpMenu.test(consoleBuffer)) {
    specialOperation = true; // Standard operation from the buffer is disabled
    term.bold('HELP LIST:\n');
    term(helpItems.join('\n'))('\n');
  }

  // Disable standard operation when types '.userList' into consoleBuffer
  if (checkUserList.test(consoleBuffer) || checkWeather.test(consoleBuffer)) {
    specialOperation = true;
  }

  // Prepare consoleBuffer to accept direct message when user types '.dm [user]' into consoleBuffer
  if (checkDirectMessage.test(consoleBuffer)) {
    specialOperation = true;
    term.grabInput(false);
  }
};

// Initializes a "manual mode" consoleBuffer to receive input for critical chat features
const clientSideOperations = () => {
  gabConnect.then((ws) => { // Ensure connection to GAB server is successful
    term().clear();
    term().nextLine(termHeight); // Format cursor in the terminal to the bottom for interface
    term.bold('YOU ARE CONNECTED! Hey ').cyan(`${user}`).styleReset('!\n');
    term.italic().yellow('For a list of commands type \'.help\'\n');
    term.italic().magenta('To send a message to the entire server type it and press return!\n');
    term.styleReset();
    // Begin recording key presses from user using terminal-kit
    const keyTracker = () => {
      term.grabInput(true);
      term.on('key', (keystroke) => {
        term.eraseLine();
        term.left(consoleBuffer.length);
        term.grabInput(true);
        switch (keystroke) {
        // Allows user to delete characters in the consoleBuffer
          case 'BACKSPACE':
            consoleBuffer = consoleBuffer.slice(0, -1);
            term(consoleBuffer);
            break;
          case 'LEFT':
          case 'RIGHT':
          case 'UP':
          case 'DOWN':
            term(consoleBuffer);
            break;
          // Process contents of consoleBuffer when the return key is pressed
          case 'ENTER':
            checkBuffer(); // Check the buffer for any special operations
            // If a speciaOperation or dmProcess is not happening send user's message to everyone
            if (!specialOperation && !dmProcess) {
              msgEntireServer.data = consoleBuffer;
              ws.send(JSON.stringify(msgEntireServer));
            }

            // Return userList from GAB server
            if (checkUserList.test(consoleBuffer)) {
              ws.send(JSON.stringify(connectedUsers));
            }

            // Return client's username from GAB server
            if (checkWhoAmI.test(consoleBuffer)) {
              ws.send(JSON.stringify(clientUsername));
            }

            // Provide user with the weather in particular city
            if (checkWeather.test(consoleBuffer)) {
              if (consoleBuffer.slice(9) !== '') {
                city = consoleBuffer.slice(9);
                getWeather();
              }
            }

            // Lets user to send direct message upon '.dm [username]'
            if (checkDirectMessage.test(consoleBuffer)) {
              // Check if user has utilized the '.dm [username]' command properly
              if (consoleBuffer.slice(4) !== '') {
                dmProcess = true; // Enable dmProcess
                directMsg.to = consoleBuffer.slice(4); // Parse the target user from the command
                consoleBuffer = ''; // Clear the consoleBuffer
                term(`What would you like to send to ${directMsg.to}?\n`);
                // Prepare the tempBuffer to receive the message body from the user
                const getDMInput = new Promise((resolve) => {
                  let specialTempBuffer = ''; // Temporary buffer for direct messages
                  // term.grabInput(true);
                  term.on('key', (key) => {
                    switch (key) {
                      case 'ENTER':
                        resolve(specialTempBuffer);
                        break;
                      default:
                        specialTempBuffer += `${key}`;
                    }
                  });
                  term.grabInput(false);
                });
                // Await user to press the return key before sending the dm to target user
                getDMInput.then((message) => {
                  dmProcess = false;
                  directMsg.data = message;
                  ws.send(JSON.stringify(directMsg));
                });
              } else {
                term.red().bold('To send a direct message -> .dm user\n');
                term.defaultColor();
                term.grabInput(true);
              }
            }
            term.grabInput(true);
            consoleBuffer = '';
            break;
          // User can exit chat client with CTRL_C
          case 'CTRL_C':
            term.grabInput(false);
            term.red().bold('Thank you for using ChatNet!...\n');
            term.red('Now terminating...\n');
            process.exit();
            break;
          default:
            consoleBuffer += keystroke;
            term(consoleBuffer);
        }
      });
    };

    keyTracker();
    ws.on('message', (data) => {
      const serverData = JSON.parse(data);
      if (serverData.kind === 'error') { // Informs user of errors from the GAB server
        term.red().bold('ERROR! ');
        if (serverData.data === takenUserNameData || serverData.data === pongErrorData) {
          term(`${serverData.data}\n`);
          term.red('Now terminating...\n');
          process.exit();
        }
      }

      // Outputs out styled regular expression as prescribed by styledExpressions.json
      const styledExpressionExists = () => {
        for (const i in styledExpressions) { // Loop through the JSON array
          const regex = new RegExp(styledExpressions[i].expression);
          if (regex.test(serverData.data)) {
            // const modExpression = serverData.data.match(regex);
            term.green(`${serverData.from}: `);
            expressionOperation = true;
            let expressionStr = serverData.data.split(styledExpressions[i].expression);
            term(expressionStr[0]); // Print out first part of string
            const s = styledExpressions[i].style;
            term[s](styledExpressions[i].expression); // Print out stylized part
            term(expressionStr[1])('\n'); // Print out second part of the expression
          }
        }
      };
      expressionOperation = false; // Reset the expressionOperation flag
      styledExpressionExists();
      if (!expressionOperation) { // Standard output from GAB server
        term.green(`${serverData.from}: `)(`${serverData.data}\n`);
      }
    });
  });
};


clientSideOperations();

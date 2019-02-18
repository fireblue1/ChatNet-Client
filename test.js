const term = require('terminal-kit').terminal;

function terminate() {
  term.grabInput(false);
  setTimeout(() => { process.exit(); }, 100);
}

term.bold.cyan('Type anything on the keyboard...\n');
term.green('Hit CTRL-C to quit.\n\n');

term.grabInput({ mouse: 'button' });

term.on('key', (name, matches, data) => {
  console.log("'key' event:", name);
  if (name === 'CTRL_C') { terminate(); }
});

term.on('terminal', (name, data) => {
  console.log("'terminal' event:", name, data);
});

term.on('mouse', (name, data) => {
  console.log("'mouse' event:", name, data);
});

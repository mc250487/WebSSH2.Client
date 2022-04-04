import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faBars, faClipboard, faDownload, faKey, faCog } from '@fortawesome/free-solid-svg-icons';
import * as signalR from '@microsoft/signalr';

library.add(faBars, faClipboard, faDownload, faKey, faCog);
dom.watch();

require('xterm/css/xterm.css');
require('../css/style.css');

const term = new Terminal();

term.options.cursorBlink = true;
term.options.scrollback = 10000;
term.options.tabStopWidth = 8;
term.options.bellStyle = "sound";

// DOM properties
const status = document.getElementById('status');
const header = document.getElementById('header');
const footer = document.getElementById('footer');
const fitAddon = new FitAddon();
const terminalContainer = document.getElementById('terminal-container');
term.loadAddon(fitAddon);
term.open(terminalContainer);
term.focus();
fitAddon.fit();

var query = new URLSearchParams(window.location.search);

if (!query.has('ticket')) {
  const msg = "Missing device ticket";
  status.innerHTML = msg;
  status.style.backgroundColor = 'red';
  document.title = msg;
}
else {
  const ticket = query.get("ticket")

  const connection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:5001/socket')
    .build();

  function resizeScreen() {
    fitAddon.fit();
  }

  window.addEventListener('resize', resizeScreen, false);

  term.onData((data) => {
    connection.send('input', data);
  });

  term.onTitleChange((title) => {
    document.title = title;
  });

  connection.on('output', (data) => {
    term.write(data);
  });

  connection.on('title', (data) => {
    document.title = data;
  });

  connection.on('status', (data) => {
    status.innerHTML = data;
    status.style.backgroundColor = 'green';
  });

  connection.on('header', (data) => {
    if (data) {
      header.innerHTML = data;
      header.style.backgroundColor = "green";
      header.style.display = 'block';

      terminalContainer.style.height = 'calc(100% - 38px)';
      resizeScreen();
    }
  });

  connection.on('footer', (data) => {
    footer.innerHTML = data;
  });

  connection.onclose = (err) => {
    status.style.backgroundColor = 'red';
    status.innerHTML = `WEBSOCKET CONNECTION CLOSED: ${err}`;
  }

  connection.on('error', (data) => {
    status.innerHTML = data;
    status.style.backgroundColor = 'red';
  });

  connection.start().then(() => {
    const shell = {
      cols: term.cols,
      rows: term.rows
    }

    connection.send('connect', ticket, shell);
  });
}

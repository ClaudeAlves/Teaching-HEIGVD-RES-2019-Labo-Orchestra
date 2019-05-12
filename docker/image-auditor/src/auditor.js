/* eslint-disable linebreak-style */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const dgram = require('dgram');

const net = require('net');
/** from https://momentjs.com/ */
const moment = require('moment');

const protocol = require('./protocol');
/** UDP part */
const socket = dgram.createSocket('udp4');

/** bind multicast */
socket.bind(protocol.PROTOCOL_PORT, () => {
  console.log('Joining multicast group');
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
  console.log('Waiting for music.');
});

const currentMusicians = new Map();

socket.on('message', (msg, source) => {
  console.log(`Payload received: ${msg}\nFrom port: ${source.port}`);
   
  const musician = JSON.parse(msg);

  if (!(currentMusicians.has(musician.uuid))) {
    currentMusicians.set(musician.uuid, {
      instrument: musician.instrument,
      firstActivity: moment().toISOString(),
      lastActivity: moment().unix(),
      sourcePort: source.port,
    });
  } else {
    currentMusicians.get(musician.uuid).lastActivity = moment().unix();
  }
});
/** TCP part */
const server = net.createServer();

server.listen(protocol.PROTOCOL_PORT);

function summary() {
  const musicians = [];

  currentMusicians.forEach((element, key) => {
    if (moment().unix() - element.lastActivity > 5) {
      currentMusicians.delete(key);
    } else {
      musicians.push({
        uuid: key,
        instrument: element.instrument,
        firstActivity: element.firstActivity,
      });
    }
  });
  return musicians;
}

server.on('connection', (tcpSocket) => {
  const payload = JSON.stringify(summary(), null, 4);

  tcpSocket.write(payload);
  tcpSocket.end('\r\n');
});

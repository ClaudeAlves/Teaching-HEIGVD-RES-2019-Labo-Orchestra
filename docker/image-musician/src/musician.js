/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const dgram = require('dgram');
/** this unique id was found on https://github.com/kelektiv/node-uuid */
const uuid4 = require('uuid/v4');

const protocol = require('./protocol');

const socket = dgram.createSocket('udp4');

const sounds = {
  piano: 'ti-ta-ti',
  trumpet: 'pouet',
  flute: 'trulu',
  violin: 'gzi-gzi',
  drum: 'boum-boum',
};

class Musician {
  constructor(instrument) {
    this.uuid = uuid4();
    this.instrument = instrument;
    this.music = sounds[instrument];
  }

  /** Musician action (update from thermometers) */
  play() {
    const music = {
      uuid: this.uuid,
      instrument: this.instrument,
      sound: this.music,
    };

    /** JSON format */
    const payload = Buffer.from(JSON.stringify(music));

    /** payload sending */
    socket.send(payload, 0, payload.length, protocol.PROTOCOL_PORT,
      protocol.PROTOCOL_MULTICAST_ADDRESS, () => {
        console.log(`Sending payload: ${payload}\nvia port ${socket.address().port}.`);
      });
  }
}
if (process.argv.length !== 3) {
  throw new Error('Too few arguments Usage must be : node muscian.js -instrument-');
} else if (!(process.argv[2] in sounds)) {
  throw new Error('Instruments must be one of the following: piano, trumpet, flute, violin, drum');
}

/** Set instrument */
const instrument = process.argv[2];

/** Create musician */
const musician = new Musician(instrument);

/** send music every seconde */
setInterval(musician.play.bind(musician), 1000);

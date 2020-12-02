import * as tmi from 'tmi.js';
import * as chalk from 'chalk';
import { argv } from 'process';

const word = argv[2];
if(!word) {
    console.log("Please provide a word to wait for 'npx ts-node .\\src\\pictionarybot.ts WORD'");
    process.exit(1);
}

const listenChannel = process.env['TTV_CHANNEL'];
if(!listenChannel) {
    console.log("Please provide a channel to bind to using the TTV_CHANNEL environment variable");
    process.exit(1);
}


const opts = {
    identity: {
        username: process.env['TTV_USERNAME'],
        password: process.env['TTV_PASSWORD'],
    },
    channels: [
        listenChannel,
    ]
}

const client = tmi.client(opts);

console.log(`Listening for '${word}' on ${listenChannel}`);
let wordFound = false;

client.on('message', (channel, user, msg, self) => {
    if(self) {
        return;
    }

    if(!wordFound && msg.toLowerCase() === word.toLowerCase()) {
        wordFound = true;
        const usernameColor = user.color ? chalk.hex(user.color)(user["display-name"]) : user["display-name"];

        client.say(channel, `${user["display-name"]} is the winner! The word was '${word}'`)
        console.log(`${usernameColor} is the winner with ${msg}`);
        client.disconnect();
    }
});

client.connect();
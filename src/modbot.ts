import * as tmi from 'tmi.js';
import * as chalk from 'chalk';
import * as day from 'dayjs';
import { argv } from 'process';

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

interface MessageStats {
    count: number;
    lastTime: day.Dayjs;
}

const history: Record<string, MessageStats> = {};
let threshold = 5;
let timeoutPeriod = 10;
let falloff = 2;

client.on('message', (channel, user, msg, self) => {
    if(self) {
        return;
    }

    if(!user.mod && `#${user.username}` !== channel) {
        const msgKey = msg.toLowerCase();
        let msgHistory = history[msgKey];
        const now = day();
        if(!msgHistory) {
            history[msgKey] = {
                count: 0,
                lastTime: now,
            }
            msgHistory = history[msgKey];
        }
        msgHistory.count += 1;
        msgHistory.lastTime = now;
        if(msgHistory.count > threshold) {
            console.log(`Timing out ${chalk.yellow(user.username)} for: ${msg}`);
            client.timeout(channel, user.username, timeoutPeriod, 'message spam').catch( e => {
                console.error(chalk.red(`Cannot timeout ${user.username}: `), e);
            })
        }
    }
});

client.connect();

setInterval(() => {
    const oldTime = day().add(-falloff, 'minutes');
    console.log('Checking for old messages');
    for(let key in history) {
        if(history[key].lastTime < oldTime) {
            console.log(`Clearing message: ${key}`);
            delete history[key];
        }
    }
}, 60 * 1000)
import * as tmi from 'tmi.js';
import * as chalk from 'chalk';

const opts = {
    identity: {
        username: process.env['TTV_USERNAME'],
        password: process.env['TTV_PASSWORD'],
    },
    channels: [
        process.env['TTV_CHANNEL'],
    ]
}

const client = tmi.client(opts);
let logUserState = false;

client.on('message', (channel, user, msg, self) => {
    if(self) {
        return;
    }

    // if(user["display-name"] === 'gpduck') {
    //     client.whisper(user["display-name"], 'go away').catch( reason => {
    //         console.error(`Error whispering: ${reason}`);
    //     });
    //     return;
    // }

    const [commandName, cdr] = msg.trim().split(' ', 2);

    switch(commandName) {
        case '!die':
            client.disconnect();
            break;
        case '!ahh':
            client.slow(channel);
            break;
        case '!ok':
            client.slowoff(channel);
            break;
        case '!hug':
            client.say(channel, `${user["display-name"]} hugs ${cdr}`);
            break;
        case '!log':
            logUserState = !logUserState;
            break;
        default:
            if(logUserState) {
                console.log(JSON.stringify(user, undefined, 2));
            }
            const username = user.color ? chalk.hex(user.color)(user["display-name"]) : user["display-name"];
            console.log(`${username}: ${msg}`);
    }
});

client.connect();
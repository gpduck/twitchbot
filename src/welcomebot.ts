import * as tmi from 'tmi.js';
import * as chalk from 'chalk';
import { argv } from 'process';
import * as readline from 'readline';

import { ApiClient } from 'twitch';
import { StaticAuthProvider, ClientCredentialsAuthProvider } from 'twitch-auth';
import { DirectConnectionAdapter, EventSubListener } from 'twitch-eventsub';
import { NgrokAdapter } from 'twitch-eventsub-ngrok';

const listenChannel = argv[2];
if(!listenChannel) {
    console.log("Please provide a channel to listen on 'npx ts-node .\\src\\welcomebot.ts CHANNEL'");
    process.exit(1);
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function RandomMessage(user: string): string {
    const messages = [
        'Thanks for following @${user}, welcome to the stream!',
        'welcome @${user}!',
        'Glad to have you here @${user}!',
        'ty for following @${user}',
        //'hi new friend @${user}',
    ];
    const rand = Math.round(Math.random() * (messages.length - 1));
    return messages[rand].replace("${user}", user);
}

(async () => {
    const clientId = '3hk6pyr6mqqpsrsbec9mgdlxzci6gn';
    const clientSecret = 'q9ueagt553jbtflmkhsx34zwf27ql4';
    const accessToken = 'vu9qsb5lhp9tw704rjinkqd94i1fv6';
    const scopes: string[] = undefined;

    //const authProvider = new StaticAuthProvider(clientId, accessToken, scopes);
    const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
    const apiClient = new ApiClient({authProvider});

    const channelUser = await apiClient.kraken.users.getUserByName(listenChannel);

    const listener = new EventSubListener(apiClient, new NgrokAdapter(), 'sldkfjalsdkflsadkflsadk');
    await listener.listen();

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
    await client.connect();

    const followSub = await listener.subscribeToChannelFollowEvents(channelUser.id, async e => {
        let randomDelay = Math.random() * 10 * 1000;
        await delay(20000 + randomDelay);
        let message = RandomMessage(e.userDisplayName);
        client.say(listenChannel, message);
        console.log(message);
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    rl.on('line', async input => {
        console.log("Removing subscriptions...");
        await Promise.all([
            followSub.stop(),
            listener.unlisten(),
            client.disconnect(),
        ]);
        console.log("Closed");
        process.exit(0);
    })
})();
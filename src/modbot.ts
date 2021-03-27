import * as tmi from 'tmi.js';
import { program } from 'commander';
import * as chalk from 'chalk';
import * as day from 'dayjs';
import { getClient } from './ChatHelpers';

interface MessageStats {
    count: number;
    lastTime: day.Dayjs;
}

const history: Record<string, MessageStats> = {};
let threshold = 5;
let timeoutPeriod = 5;
let falloff = .5;

program
    .requiredOption('-c, --channel <channel>', 'twitch channel to connect to')
    .option('-u, --user <username>', 'twitch bot username')
    .option('-o, --oauth <token>', 'oauth token from https://twitchapps.com/tmi/')
    .option('--debug', 'enable debug messages')
    .action( async cmd => {
        const client = getClient(cmd);
        const isMod = !!cmd.user && (client.isMod(cmd.channel, cmd.user) || cmd.user === cmd.channel);
        console.log(`Running as mod: ${isMod}`);
        
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
                if(cmd.debug) {
                    console.log(msgKey, msgHistory);
                }
                if(msgHistory.count > threshold) {
                    if(isMod) {
                        console.log(`Timing out ${chalk.yellow(user.username)} for: ${msg}`);
                        client.timeout(channel, user.username, timeoutPeriod, 'message spam').catch( e => {
                            console.error(chalk.red(`Cannot timeout ${user.username}: `), e);
                        });
                    } else {
                        console.log(`Would time out ${chalk.green(user.username)} for: ${msg}`);
                    }
                }
            }
        });
        
        client.connect().catch( e => {
            console.error(chalk.red(`Unable to connect to #${cmd.channel} chat: `), e);
            process.exit(1);
        });

        setInterval(() => {
            const oldTime = day().add(-falloff, 'minutes');
            console.log('Checking for old messages');
            for(let key in history) {
                if(history[key].lastTime < oldTime) {
                    console.log(`Clearing message: ${key}`);
                    delete history[key];
                }
            }
        }, 10 * 1000)
    });

async function main() {
    await program.parseAsync(process.argv);
}

main();
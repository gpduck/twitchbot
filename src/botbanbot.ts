import * as tmi from 'tmi.js';
import { program } from 'commander';
import * as fetch from 'node-fetch';
import * as chalk from 'chalk';

interface StdOptions {
    channel: string;
    user: string;
    oauth: string;
}

interface TmiChatters {
    chatter_count: number;
    chatters: {
        broadcaster: string[];
        vips: string[];
        moderators: string[];
        staff: string[];
        admins: string[];
        global_mods: string[];
        viewers: string[];
    }
}

interface InsightResponse {
    bots: string[][];
}

function getClient(cmd: StdOptions): tmi.Client {
    const opts = {
        identity: {
            username: cmd.user,
            password: cmd.oauth,
        },
        channels: [
            cmd.channel,
        ],
    }
    return tmi.client(opts);
}

async function getHttpData(channel: string): Promise<[ bots: Record<string, boolean>, chatters: TmiChatters]> {
    const [botList, chatters] = await Promise.all([
        fetch.default('https://api.twitchinsights.net/v1/bots/all')
            .then<InsightResponse>( response => response.json() ),
        fetch.default(`https://tmi.twitch.tv/group/user/${channel}/chatters`)
            .then<TmiChatters>( response => response.json() ),
    ]);
    const bots: Record<string, boolean> = {};
    botList.bots.forEach( botRow => {
        bots[botRow[0]] = true;
    });
    return [ bots, chatters ];
}

async function forEachBot(bots: Record<string, boolean>, chatters: TmiChatters, action: (bot: string) => void): Promise<void> {
    chatters.chatters.viewers.forEach( viewer => {
        if(bots[viewer]) {
            action(viewer);
        }
    })
}

program
    .command('list')
    .requiredOption('-c, --channel <channel>', 'twitch channel to connect to')
    .option('-u, --user <username>', 'twitch bot username')
    .option('-o, --oauth <token>', 'oauth token from https://twitchapps.com/tmi/')
    .action( async cmd => {
        const [ bots, chatters ] = await getHttpData(cmd.channel);

        console.log(`Checking ${chatters.chatter_count} active users`);
        forEachBot(bots, chatters, bot => {
            console.log(`${chalk.green('Found bot')}: ${chalk.bold(bot)}`);
        });
    });

program
    .command('ban')
    .requiredOption('-c, --channel <channel>', 'twitch channel to connect to')
    .requiredOption('-u, --user <username>', 'twitch bot username')
    .requiredOption('-o, --oauth <token>', 'oauth token from https://twitchapps.com/tmi/')
    .action( async cmd => {
        const client = getClient(cmd);
        try {
            await client.connect();
        } catch {
            console.error(chalk.red('Unable to log on'));
            return;
        }

        try {
            const [ bots, chatters ] = await getHttpData(cmd.channel);

            forEachBot(bots, chatters, async bot => {
                try {
                    await client.ban(cmd.channel, bot, 'bot');
                    console.log(`${chalk.red(bot)}`);
                } catch (e) {
                    console.error(`unable to delete bot ${bot}: ${e}`);
                }
            });
        } finally {
            client.disconnect();
        }
    });

async function main() {
    await program.parseAsync(process.argv);
}

main();

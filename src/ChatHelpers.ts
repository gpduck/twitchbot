import * as tmi from 'tmi.js';

interface StdOptions {
    channel: string;
    user?: string;
    oauth?: string;
    debug?: boolean;
}

export function getClient(cmd: StdOptions): tmi.Client {
    const opts: tmi.Options = {
        identity: {
            username: cmd.user,
            password: cmd.oauth,
        },
        channels: [
            cmd.channel,
        ],
        connection: {
            reconnect: true,
        },
    }
    if(cmd.debug) {
        console.log('Connecting to chat', opts);
    }
    return tmi.client(opts);
}
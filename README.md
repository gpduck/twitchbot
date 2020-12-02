# Running

1. Install [node](https://nodejs.org/en/)
1. Clone the repo locally
1. Install package dependencies
    ```
    npm install
    ```
1. Get an oauth token for the bot from [twitchapps](https://twitchapps.com/tmi/)
1. Configure environment variables (powershell)
    ```
    $env:TTV_USERNAME = "your username"
    $env:TTV_PASSWORD = "oauth:token"
    $env:TTV_CHANNEL = "your channel"
    ```
1. Run the bot
    ```
    npx ts-node src/index.ts
    ```


# Pictionary Bot

Install and configure as above, run as follows

```
npx ts-node src/pictionarybot.ts WORD
```

The bot will connect to the channel and watch for the first person to say WORD. It will then announce the winner in the channel, print the winner to the console, and exit.

Console:
```
npx ts-node .\src\pictionarybot.ts word
Listening for 'word' on channel
gpduck is the winner with word
```

Chat:
```
gpduck: word
gpduckbot: gpduck is the winner! The word was 'word'
```

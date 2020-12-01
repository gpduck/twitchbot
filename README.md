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

# Minecraft Bot Manager

A Minecraft bot manager I made using Mineflayer. It lets you run multiple accounts at the same time, or just one if that's what you want.

You can spawn as many accounts as you have in your config, then choose whether commands run on all bots, one bot, or whichever bots you've selected.

## Requirements

* Node.js (v18+ recommended)
* A working computer

## Installation

Download these files:

```text
config.json
index.js
commands.js
```

Then open a terminal in the folder and run:

```bash
npm install
```

Or, if you don't want to set everything up yourself, you can download the `bot.exe` from the releases page.

## Running

Before running it, open `config.json` and change the server IP, port, and accounts.

If you're testing on a local server, you can use an offline account by setting:

```json
"auth": "offline"
```

To start the bot manager:

```bash
node index.js
```

Bots don't connect automatically when you start it. Use `spawn` after starting the program.

## First time use

The first time an account connects, you'll get a message asking you to authenticate.

Open the link it gives you and enter the code.

Once you authenticate an account, the login gets cached, so you shouldn't have to log in again every time you restart the bot.

## Commands

### Account commands

These aren't tied to one specific bot:

```text
spawn <amount> - Spawns accounts from the list (default: all)
list - Lists spawned accounts and their status
whoami - Shows which account(s) are currently selected
kick <username> - Disconnects and removes an account
kickall - Disconnects and removes all accounts
broadcast <message> - Sends a chat message from every spawned bot
status all - Shows the status of every spawned bot
select <username/all> - Selects which account(s) normal commands run on (default: all)
as <username> <command> - Runs a command on one specific account
help - Shows this list and the bot commands
```

### Bot commands

These run on the selected account(s), or on one account if you use `as`:

```text
restart - Restarts the bot
status - Shows bot status
pos - Shows the bot's current position
inv - Lists the bot's inventory
say <message> - Sends a message
move <direction> - Moves the bot (forward, back, left, right, jump)
chat - Enables/disables chat reading (default: enabled)
guiRead - Reads the current GUI
click <slot> - Clicks a slot in a GUI
botinfo - Shows bot info
goto <ip:port> - Connects to a specific server
forceRestart - Force restarts the bot
uptime - Shows how long the bot has been running
help - Shows the bot command list
```

You need to spawn at least one bot before using the bot commands.

## Usage

I made this mainly for learning, testing, and personal use.

Don't use it on servers without permission from the owner.

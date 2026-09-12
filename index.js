
const commands = require('./commands')

const mineflayer = require('mineflayer')

const readline = require('readline')

const fs = require('fs')
const path = require('path')

const configPath = path.join(process.cwd(), 'config.json')

if (!fs.existsSync(configPath)) {
    console.error('config.json not found, create a config.json file in the same path as the script or exe')
    process.exit(1)
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) 
// ^ reads the config.json file so that settings are adjusted more easily




const accounts = config.accounts
let ip = config.ip
let port = config.port
const reconnect = config.reconnect
const minReconnectDelay = config.minReconnectDelay

let accs = {} 
let selected = 'all' // which accounts commands apply to, you can change the default value by putting in a username 

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.setPrompt("cmd> $")
rl.prompt()



const sleep = ms => new Promise(r => setTimeout(r, ms));

function time(old) {
    const pad = n => n.toString().padStart(2, "0");

    if (!old) {
        const date = new Date();
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    let diff = Date.now() - old.getTime();

    let seconds = Math.floor(diff / 1000) % 60;
    let minutes = Math.floor(diff / (1000 * 60)) % 60;
    let hours = Math.floor(diff / (1000 * 60 * 60));

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}


const chalk = require('chalk')

const log = { // jsut a nice way to debugging and its nice 
    base(type, color, msg) {
        readline.clearLine(process.stdout, 0)
        readline.cursorTo(process.stdout, 0)

        const timestamp = chalk.gray(`[${time()}]`)
        const label = color(`[${type}]`)

        console.log(`${timestamp} ${label} ${msg}`)

        rl.prompt(true)
    },

    info(msg) {
        this.base("INFO", chalk.blue, msg)
    },

    warn(msg) {
        this.base("WARN", chalk.yellow, msg)
    },

    error(msg) {
        this.base("ERROR", chalk.red, msg)
    },

    success(msg) {
        this.base("SUCCESS", chalk.green, msg)
    },
    gui(msg) {
        this.base("GUI", chalk.magenta, msg)
    },
    cmd(msg) {
        this.base("CMD", chalk.cyan, msg)
    }

}




function createBot(username, auth) { // creates one bot with the given details, so it can be used multiple times

    let acc = accs[username]
    if (!acc) return 

    if(acc.cBot){
        acc.cBot.removeAllListeners()
        acc.cBot.end()
    }
    acc.reconnecting = true

log.info(`Creating bot... (${username})`)


 acc.cBot = mineflayer.createBot({
    host: ip,
    username: username,
    port: port || 25565,
    auth: auth || 'microsoft'
})

acc.cBot.once('login', () => {
    log.success(`[${username}] Bot logged in as ${acc.cBot.username} to ${ip}:${port || 25565}`)
    acc.reconnecting = false
})

acc.cBot.once("spawn", () => {
    (async () => {
        await sleep(500);

     acc.botReady = true
     acc.reconnecting = false
        log.success(`[${username}] Bot Spawned as ${acc.cBot.username} to ${ip}:${port || 25565}`);

     

    })();
});


acc.cBot.on('message', (chatUsername, message) => {
    if (acc.readChat) {
        log.info(`[${username}] [CHAT]: ${chatUsername}: ${message}`)
    }
})


acc.cBot.on('windowOpen', (window) => {

 log.info(`[${username}] GUI Title: ${window.title.value}`)
    log.info(`Slots: ${window.slots.length}`)

    window.slots.forEach((item, index) => {
        if (!item) return

        log.gui(
            `Slot ${index} | ${item.name} x${item.count} | "${item.displayName}"`
        )
        
    })
    log.info('To click on an item, type "click [slot number]"')
})


acc.cBot.on('entityHurt', () => {
    log.info(`[${username}] Bot hurt, health: ${Math.floor(acc.cBot.health)}`)
})

// Reconnecting

acc.cBot.on('kicked', reason => {
log.warn( `[${username}] Kicked from server: ${reason?.value?.translate?.value || reason?.value?.text?.value || JSON.stringify(reason?.value || reason) || "Unknown"}`)
})
acc.cBot.on('end', () => {
    log.warn(`[${username}] Bot Disconnected`)
    if(!accs[username]) return // was manually kicked, don't reconnect
acc.reconnecting = false
restart(username, auth)
})

acc.cBot.on('error', err => {
    log.error(`[${username}] Error: ${err}`)
    if(!accs[username]) return
restart(username, auth)
})

} // createBot function close


function jitter(ms){ // jitter function to randomize reconnect times because it just looks more human
    return ms + Math.floor(Math.random() * 300)
}

function restart(username, auth){ // restarts a bot
    let acc = accs[username]
    if (!acc) return
    if (!reconnect) return log.warn('Reconnecting Disabled')
    if (acc.reconnecting) return log.warn(`[${username}] Already reconnecting...`)

    acc.reconnecting = true
    acc.attempts++

    let delay = minReconnectDelay * Math.min(acc.attempts / 2, 5)
    delay = jitter(delay)

    log.info(`[${username}] Reconnecting in ${delay / 1000}s... (Attempts: ${acc.attempts})`)

    setTimeout(() => {
        if(!accs[username]) return
acc.botReady = false
        createBot(username, auth)
    }, delay)
}

function spawn(amount){ // spawns an amount of bots from the accounts list above
    const toSpawn = accounts.slice(0, amount || accounts.length)

    if(!toSpawn.length) return log.warn('No accounts configured.')

    toSpawn.forEach(({username, auth}) => {
        if(accs[username]) return log.warn(`[${username}] Already spawned.`)

        accs[username] = {
            cBot: null,
            reconnecting: false,
            attempts: 0,
            readChat: true,
            uptime: new Date(),
            botReady: false,
            auth: auth || 'microsoft'
        }

        createBot(username, auth)
    })
}

function kick(username){ // disconnects the account and completely forgets it unless you restart the script or spawn it back in
    const acc = accs[username]
    if(!acc) return log.warn(`No such account: ${username}`)

    if(acc.cBot){
        acc.cBot.removeAllListeners()
        acc.cBot.end()
    }
    delete accs[username]
    log.cmd(`[${username}] Kicked and removed.`)
}

function kickAll(){ // disconnects all bots 
    Object.keys(accs).forEach(username => kick(username))
    if(!Object.keys(accs).length) log.cmd('All bots kicked.')
}

function list(){ // lists the currently spawned accounts
    const names = Object.keys(accs)
    if(!names.length) return log.warn('No bots spawned yet. Use "spawn <amount>"')

    names.forEach(username => {
        const acc = accs[username]
        log.cmd(`${username} | Ready: ${acc.botReady} | Connected: ${!!acc.cBot?.player} | Attempts: ${acc.attempts}`)
    })
}


function runOn(username, input){ // runs a command on a specific account        
    const acc = accs[username]
    if(!acc) return log.warn(`No such account: ${username}`)

    commands(input, {
        cBot: acc.cBot,
        log,
        restart: () => restart(username, acc.auth),
        readChat: acc.readChat,
        time,
        uptime: acc.uptime,
        ip,
        port,
        username,
        auth: acc.auth,
        reconnect,
        minReconnectDelay,
        botReady: acc.botReady,
        attempts: acc.attempts,
        reconnecting: acc.reconnecting
    })
}

// Commands

rl.on('line', (input) => {

input = input.trim()

// these commands are here because they manage the accounts and don't need to run on a specific account

if (input.startsWith('spawn')){
    const amount = parseInt(input.split(' ')[1])
    spawn(isNaN(amount) ? null : amount)
}

else if (input === 'list'){
    list()
}

else if (input === 'whoami'){
    log.cmd(`Currently selected: ${selected}`)
}

else if (input.startsWith('kick ')){
    kick(input.substring(5).trim())
}

else if (input === 'kickall'){
    kickAll()
}

else if (input.startsWith('broadcast ')){
    const message = input.substring(10)
    if(!Object.keys(accs).length) return log.warn('No bots spawned.')
    Object.keys(accs).forEach(username => runOn(username, 'say ' + message))
}

else if (input === 'status all'){
    if(!Object.keys(accs).length) return log.warn('No bots spawned.')
    Object.keys(accs).forEach(username => runOn(username, 'status'))
}

else if (input.startsWith('select ')){
    const who = input.substring(7)
    if(who === 'all' || accs[who]){
        selected = who
        log.cmd(`Selected: ${who}`)
    } else {
        log.warn(`No such account: ${who}. Use "list" to see spawned bots.`)
    }
}

else if (input.startsWith('as ')){ // as <username> <command> runs on one specific account ignoring the selected value
    const rest = input.substring(3)
    const spaceIdx = rest.indexOf(' ')
    if(spaceIdx === -1) return log.warn('Usage: as <username> <command>')

    const who = rest.substring(0, spaceIdx)
    const cmd = rest.substring(spaceIdx + 1)
    runOn(who, cmd)
}

else if (input === 'help'){
    log.cmd(`
        Multi-account commands:
        spawn <amount> - Spawns accounts from the list (default: all)
        list - Lists spawned accounts and their status
        whoami - Shows which account(s) are currently selected
        kick <username> - Disconnects and removes one account
        kickall - Disconnects and removes all accounts
        broadcast <message> - Sends a chat message from every spawned bot
        status all - Prints status for every spawned bot
        select <username/all> - Chooses which account(s) normal commands run on
        as <username> <command> - Runs one command on a specific account
        help - Shows this message + the per-bot command list below
    `)
    commands('help', {log})
}

else {
    if(!Object.keys(accs).length) return log.warn('No bots spawned. Use "spawn <amount>" first.')

    if(selected === 'all'){
        Object.keys(accs).forEach(username => runOn(username, input))
    } else {
        runOn(selected, input)
    }
}

    rl.prompt()
})




// Error handling

process.on('uncaughtException', err => {
    log.error("Uncaught: " + err.message)
})

process.on('unhandledRejection', err => {
    log.error("Unhandled Rejection: " + err)
})



const oldLog = console.log // Mineflayer spams a bunch of random stuff about this, idk how to disable it so i just blocked logs coming from it 
console.log = (...a) => {
    const m = a.join(" ")
    if (m.includes("Chunk size is")) return
    oldLog(...a)
}


setInterval(() => {
Object.keys(accs).forEach(username => {
    const acc = accs[username]
    if(!acc.cBot?.player && acc.botReady){
        log.error(`[${username}] Heartbeat lost. Restarting...`)
        acc.reconnecting = false
        restart(username, acc.auth)
    }
})
}, 10000);

log.info(`Loaded ${accounts.length} account(s) from list. Use "spawn <amount>" to connect them.`)
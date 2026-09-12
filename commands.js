module.exports = function commands(input, c){

input = input.trim()

const {cBot, log, restart, time, uptime, username, auth, reconnect, minReconnectDelay, botReady, attempts, ip, port} = c




 if (input === "restart") {
        restart()
    }

    else if (input === "status") {
      if (!cBot?.player || !botReady) {
    return log.warn("Bot not connected.");
}


    log.cmd(`
Username: ${cBot.username}
Health: ${cBot.health}
Hunger: ${cBot.food}
GameMode: ${cBot.game?.gameMode}
Dimension: ${cBot.game?.dimension || "Unknown"}
Reconnect Attempts: ${attempts}
Uptime: ${time(uptime)}
Level Type: ${cBot?.game?.levelType == "default" ? "Survival" : "Afk"}
`)
}

else if (input === "pos") {
    if (!cBot?.player || !botReady) {
        return log.warn("Bot not connected.");
    }

    const pos = cBot.entity.position
    log.cmd(`Position: x=${pos.x.toFixed(2)} y=${pos.y.toFixed(2)} z=${pos.z.toFixed(2)}`)
}

else if (input === "inv") {
    if (!cBot?.player || !botReady) {
        return log.warn("Bot not connected.");
    }

    const items = cBot.inventory.items()
    if (!items.length) return log.cmd("Inventory is empty.")

    items.forEach(item => {
        log.gui(`Slot ${item.slot} | ${item.name} x${item.count} | "${item.displayName}"`)
    })
}



    else if (input.startsWith("say ")) {
       if (!cBot?.player || !botReady) {
    return log.warn("Bot not connected.");
}
        const message = input.substring(4)
        cBot.chat(message)
        log.cmd(`Sent message: ${message}`)
    }

    
else if (input.startsWith("move ")) {
if (!cBot?.player || !botReady) {
    return log.warn("Bot not connected.");
}

    const direction = input.substring(5).toLowerCase()

    if (["forward", "back", "left", "right", "jump"].includes(direction)) {
        cBot.setControlState(direction, true)
        
        log.cmd("Moving " + direction)
        setTimeout(() => {
            cBot.setControlState(direction, false)
            log.info("Stopped moving " + direction)
        }, 1000)

    }

    else {
        log.warn("Invalid move direction (forward, back, left, right, jump)")
    }
}


else if (input === "chat") {
    c.readChat = !c.readChat
    log.cmd(`Chat ${c.readChat ? "enabled" : "disabled"}`)
}


else if (input === "guiRead") {

   if (!cBot?.player || !botReady) {
    return log.warn("Bot not connected.");
}

    if (!cBot?.currentWindow) {
        return log.warn("No GUI is currently open.")
    }

    const window = cBot.currentWindow

    log.cmd(`GUI Title: ${window.title?.value || window.title || "Unknown"}`)
    log.cmd(`Slots: ${window.slots.length}`)

    window.slots.forEach((item, index) => {
        if (!item) return

        log.gui(
            `Slot ${index} | ${item.name} x${item.count} | "${item.displayName}"`
        )
    })
    log.cmd('To click on an item, type "click [slot number]"')
}

else if (input.startsWith('click')){
if (!cBot?.player || !botReady) {
    return log.warn("Bot not connected.");
}

    if (!cBot?.currentWindow) {
        return log.warn("No GUI is currently open.")
    }
    const slot = parseInt(input.split(' ')[1])
    if(slot >= cBot.currentWindow.slots.length || slot < 0 || isNaN(slot) ){
        return log.warn("Invalid slot number.")
    }
   try{
    cBot.clickWindow(slot, 0, 0)
    log.cmd(`Clicked slot ${slot}`)
   }catch(e){
    log.error(e)
   }
}




else if (input === "botinfo"){
if (!cBot?.player || !botReady) {
    return log.warn("Bot not connected.");
}

log.cmd(`
    IP: ${ip}
    Port: ${port}
    Username: ${username}
    Auth: ${auth}
    Reconnect: ${reconnect}
    Min Reconnect Delay: ${minReconnectDelay}
    `)

}

else if (input.startsWith('goto ')){
if (!cBot?.player || !botReady) {
    return log.warn("Bot not connected.");
}

const server = input.substring(5)
if(!server ) return log.error('Invalid server format. (ip:port) Leave port empty for default port 25565')

c.ip = server.split(':')[0]
c.port = parseInt(server.split(':')[1]) || 25565
log.cmd(`Destination set to: ${c.ip}:${c.port}. Restart bot to connect ($restart)` )
    
}

else if (input === "forceRestart") {

    log.cmd(`Forcing restarting...`)
    c.reconnecting = false
    restart()
}

else if (input === "uptime") {
    log.cmd(`Uptime: ${time(uptime)}`)
}


else if (input === "help") {
        log.cmd(`
            Commands (run on whichever account is selected):
            restart - Restarts the bot
            status - Displays bot status
            pos - Displays current x/y/z position
            inv - Lists inventory contents
            say <message> - Sends a message
            move <direction> - Moves the bot in a specific direction (forward, back, left, right, jump)
            chat - Enables and disables reading chat (Default enabled)
            guiRead - Reads the current GUI
            click <slot> - Clicks on a specific slot in a GUI
            botinfo - Displays bot info
            goto <ip:port> - Goto a specific server
            forceRestart - Restarts the bot forecfully
            uptime - Displays the bot's uptime
            help - Displays this help message
        `)
        
    }
    else {
        log.error("Unknown command: " + input)
    }



}
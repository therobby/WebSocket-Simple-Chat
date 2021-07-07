const http = require('http')
const fs = require('fs')
const websocket = require('ws')

let chatUsers = []


const server = http.createServer((req, res) => {
    res.end(fs.readFileSync("./client.html"))
})

const ws = new websocket.Server({ server })

/**
 * ws receive two messages:
 * {nickname: "ur nickname"}
 * {message: "ur message"}
 * 
 * all messages from server will be displayed in textarea
 */

ws.on('connection', (client, req) => {
    let nickname = "";
    chatUsers.push(client)

    client.on('message', (message) => {
        let msg
        try {
            msg = JSON.parse(message)
        } catch (e) {
            console.error(e)
        }

        if (msg.nickname) {
            if (nickname) {
                chatUsers.forEach(user => {
                    user.send("[" + getTimeNow() + "] " + "{SERVER} " + nickname + " changed nickname to " + msg.nickname)
                })
            } else {
                chatUsers.forEach(user => {
                    user.send("[" + getTimeNow() + "] " + "{SERVER} " + msg.nickname + " joined")
                })
            }
            nickname = msg.nickname
        } else if (msg.message) {
            chatUsers.forEach(user => {
                user.send("[" + getTimeNow() + "] " + nickname + ": " + msg.message)
            })
        }
    })

    client.on('close', (code, reason) => {
        chatUsers.splice(chatUsers.indexOf(client), 1)
        chatUsers.forEach(user => {
            if (reason) {
                user.send("[" + getTimeNow() + "] " + "{SERVER} " + nickname + " disconnected, reason: " + reason + " (code: " + code + ")")
            } else {
                user.send("[" + getTimeNow() + "] " + "{SERVER} " + nickname + " disconnected")
            }
        })
    })
})

function getTimeNow() {
    let date = new Date(Date.now())
    return (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":" +
        (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ":" +
        (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds())
}

server.listen(8008)
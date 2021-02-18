////////////////////////////////
/// CamelWrapper by jkcoxson ///
///  Pls don't steal license ///
////////////////////////////////

// Javascript > Java

// Rappers bad
// Wrappers good, like candy wrappers that people throw away. Except M&M's.

const config = require("./config.json");
const Net = require('net');

var serverConnection = new Net.Socket();

var connected = false;

function connectToCamelBot() {
    setupServerEvents();
    serverConnection.connect({
        port: config.mother_port,
        host: config.IP
    });
}

function sendMessage(toSend) {
    if (connected == true) {
        serverConnection.write(toSend);
        return true
    } else {
        return false
    }
}

async function packetInterpreter(raw) {
    var packet = null
    try {
        // If packet parses as JSON, continue. Otherwise exit
        packet = JSON.parse(raw);
        // Test if it has a packet type, or discard
        var temp = packet.packet;
    } catch {
        console.log('Recieved bad packet, dropped');
        return;
    }

    if (packet.type == "playerList") {
        var temp = await (getPlayersOnline());
        console.log(temp);
        var toSend = {
            "packet": "playerlist",
            "list": temp.split('\n')
        };

        if (connected) {
            serverConnection.write(JSON.stringify(toSend));
        }
    }

    if (packet.type == "reqCoords") {
        var toSend = {
            "packet": "reqCoords",
            "list": []
        };

        var idkWhatToCallThis = await (getPlayerCoords());

        for (var i = 0; i < idkWhatToCallThis.length; i++) {
            var player = idkWhatToCallThis[i].split(':')[0];
            var coords = idkWhatToCallThis[i].split(':')[1];
            var toPush = {
                "player": player,
                "x": coords.split(',')[0],
                "y": coords.split(',')[1],
                "z": coords.split(',')[2]
            }

            toSend.list.push(toPush);
        }

        if (connected) {
            sendMessage(JSON.stringify(toSend));
        }
    }

    if (packet.type == "command") {
        minecraft.stdin.write(packet.command.toString() + "\n");
    }

    if (packet.type == "restart") {
        restartMinecraft();
    }
}

var reconnector;

function reconnect() {
    reconnector = setInterval(() => {
        if (connected == false) {
            //console.log("Attempting connection to CamelBot");
            connectToCamelBot();
        }
    }, 10000);
}

reconnect();

// Once all listeners are removed, they must be called again.
function setupServerEvents() {
    serverConnection.removeAllListeners();

    serverConnection.on('close', () => {
        console.log("Connection to CamelBot lost, reconnecting.");
        connected = false;
        reconnect();
    });

    serverConnection.on('error', (data) => {
        //console.log(data)
    });

    serverConnection.on('data', (data) => {
        packetInterpreter(data);
    });

    serverConnection.on('connect', () => {
        connected = true;
        clearInterval(reconnector);
        console.log("Connected to CamelBot");
        //sendMessage("yeet")
    });
}

// Wow, jkcoxson is the best

// Minecraft code

const child_process = require('child_process');
const { kill } = require("process");

var minecraft = child_process.spawn('java', ['-server', '-XX:ParallelGCThreads=8', '-Xmx8G', '-Xms4G', '-jar', config.jarname]);
minecraft.stdout.setEncoding("utf-8");
minecraft.stdin.setEncoding("utf-8");

minecraftGarbage();

function getPlayerCoords() {
    return new Promise((resolve, reject) => {
        minecraft.stdin.write('coordprint\n');

        function processData(data) {
            if (data.toString().split('\n')[1] == "coordprint") {
                var toSend = [];
                var splitData = data.toString().split('\n');
                for (var i = 2; i < splitData.length; i++) {
                    if (splitData[i] !== '8675309') {
                        toSend.push(splitData[i]);
                    }
                }

                // Remove just this event listener.
                minecraft.stdout.off('data', processData);

                resolve(toSend);
            }
        }

        minecraft.stdout.on('data', processData);
    });
}


function getPlayersOnline() {
    return new Promise((resolve, reject) => {
        minecraft.stdin.write('playerlist\n');

        function processData(data) {
            if (data.toString().split('\n')[1] == "playerlist") {
                var toSend = "";
                var splitData = data.toString().split('\n');
                for (var i = 2; i < splitData.length; i++) {
                    if (splitData[i] !== '8675309') {
                        toSend += splitData[i];
                        toSend += ('\n');
                    }
                }

                // Take out the trash Eddy
                minecraft.stdout.off('data', processData);

                resolve(toSend);
            }
        }

        minecraft.stdout.on('data', processData);
    });
}

function minecraftGarbage() {
    minecraft.stdout.removeAllListeners();
    minecraft.stdout.on('data', async data => {
        console.log(data);
        var toSend = {
            'packet': 'log',
            'log': data
        };

        if (connected) {
            serverConnection.write(JSON.stringify(toSend));
        }

        let splitData = data.toString().split(' ');
        if (splitData[3].toString().startsWith('<')) {
            var toSend = {
                'packet': 'chat',
                'sender': splitData[3].toString().split('<')[1].split('>')[0],
                'message': splitData.splice(4, splitData.length).join(' ').split('\n')[0]
            }

            if (connected) {
                serverConnection.write(JSON.stringify(toSend));
            }
        } else if (splitData[1] == "[main/FATAL]:" && data.toString().includes("Failed to start the minecraft server")) {
            console.log("Process already running, unleash the killer robots!"); // https://media.discordapp.net/attachments/775059056460824587/795869093978701834/unhoxi8s4d961.png?width=543&height=444
            minecraft.kill("SIGKILL");
            restartMinecraft();
        }
    });
}

function waitForKilled() {
    return new Promise((resolve, reject) => {
        let int = setInterval(() => {
            if (minecraft.killed) {
                resolve();
                clearInterval(int);
            }
        }, 1000);
    });
}

async function restartMinecraft() {
    console.log("Restarting Minecraft...")
    kill(minecraft.pid)
    minecraft.removeAllListeners();
    await waitForKilled();

    minecraft = null
    minecraft = child_process.spawn('java', ['-Xmx4G', '-Xms4G', '-jar', config.jarname]);
    minecraft.stdout.setEncoding("utf-8");
    minecraft.stdin.setEncoding("utf-8");
    minecraftGarbage();
}



// [22:45:23] [Server thread/INFO]: [STDOUT]:
// coordprint
// jkcoxson: -576.7862361776911,63.0,1992.699999988079
// 8675309

// [22:49:57] [Server thread/INFO]: [STDOUT]:
// playerlist
// jkcoxson
// 8675309

// [22:50:31] [Server thread/INFO]: <jkcoxson> Hello World!
// 33

// [22:53:04] [main/FATAL]: Failed to start the minecraft server

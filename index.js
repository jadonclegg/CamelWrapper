////////////////////////////////
/// CamelWrapper by jkcoxson ///
///  Pls don't steal license ///
////////////////////////////////

// Javascript > Java

// Rappers bad
// Wrappers good, like candy wrappers that people throw away. Except M&M's.

const { spawn } = require("child_process");
const config = require("./config.json");
const Net = require('net');

var serverConnection = new Net.Socket();

var connected = false

function connectpls(){
    //serverConnection = new Net.Socket();
    serverConnection.connect({port: config.mother_port,host: config.IP}, () =>{
        //Nothing goes in here, so that's cool
    });
}

function sendMessage(toSend){
    if (connected==true){
        serverConnection.write(toSend)
        return true
    }else{
        return false
    }
}




async function packetInterpreter(raw){
    var packet = null
    try {
        // If packet parses as JSON, continue. Otherwise exit
        packet = JSON.parse(raw)
        // Test if it has a packet type, or discard
        var temp = packet.packet
    } catch{
        console.log('Recieved bad packet, dropped')
        return
    }
    if (packet.type=="playerList"){
        var toSend = {
            "packet":"playerlist",
            "list":await(getPlayersOnline()).split('\n')
        }
        if (connected){
            serverConnection.write(JSON.stringify(toSend));
        }

    }
    if (packet.type=="reqCoords"){
        var toSend = {
            "packet":"reqCoords",
            "list":[]
        }
        var idkWhatToCallThis = await(getPlayerCoords())
        for (var i = 0; i<idkWhatToCallThis.length;i++){
            var player = idkWhatToCallThis[i].split(':')[0];
            var coords = idkWhatToCallThis[i].split(':')[1];
            var toPush = {
                "player": player,
                "x":coords.split(',')[0],
                "y":coords.split(',')[1],
                "z":coords.split(',')[2]
            }
            toSend.list.push(toPush)
        }
        if (connected){
            serverConnection.write(JSON.stringify(toSend));
        }
    }
    if (packet.type=="command"){
        minecraft.stdin.write(packet.command)
    }
    if (packet.type=="restart"){
        restartMinecraft();
    }
}


serverGarbage();

//console.log("Attempting connection to CamelBot");
connectpls();

setInterval(()=>{
    if (connected==false){
        //console.log("Attempting connection to CamelBot");
        serverGarbage();
        connectpls();
    }
},10000);


// Once all listeners are removed, they must be called again.
function serverGarbage(){
    serverConnection.on('close',()=>{
        console.log("Connection to CamelBot lost, reconnecting.")
        // Prevent memory leak, but they are super fun. It's not a mem leak, it's a surprise backup.
        serverConnection.removeAllListeners();
        connected=false
    });
    serverConnection.on('error', (data)=>{
        //console.log(data)
    });
    serverConnection.on('data', (data)=>{
        packetInterpreter(data)
    });
    serverConnection.on('connect',()=>{
        connected=true
        console.log("Connected to CamelBot")
        sendMessage("yeet")
    });
}


// Wow, jkcoxson is the best

// Minecraft code

const child_process = require('child_process');
const { resolve } = require("path");
const { rejects } = require("assert");
const { Socket } = require("dgram");
const { kill } = require("process");

var minecraft = child_process.spawn('java', ['-Xmx4G','-Xms4G','-jar',config.jarname]); 
minecraft.stdout.setEncoding("utf-8");
minecraft.stdin.setEncoding("utf-8");

var interpreter = "any"

minecraftGarbage();

async function getPlayerCoords(){
    return new Promise((resolve, reject) => {
        minecraft.stdin.write('coordprint')
        minecraft.stdout.on('data', async data =>{
            // This is called forever now... but it doesn't call new ones so little need to worry. 
            // It doesn't resolve unless a function is called.
            if (data.toString().split('\n')[1]=="coordprint"){
                var toSend = [];
                var splitData = data.toString().split('\n');
                for (var i = 2; i<splitData.length;i++){
                    if (splitData[i]!=='8675309'){
                        toSend.push(splitData[i]);
                    }
                }
                minecraftGarbage();
                return resolve(toSend);
            }
        });
    });
}


async function getPlayersOnline(){
    return new Promise((resolve, reject) => {
        minecraft.stdin.write('playerlist')
        minecraft.stdout.on('data', async data =>{
            // This is called forever now... but it doesn't call new ones so little need to worry. 
            // It doesn't resolve unless a function is called.
            if (data.toString().split('\n')[1]=="playerlist"){
                var toSend = "";
                var splitData = data.toString().split('\n');
                for (var i = 2; i<splitData.length;i++){
                    if (splitData[i]!=='8675309'){
                        toSend+=splitData[i];
                        toSend+=('\n')
                    }
                }
                // Take out the trash Eddy
                minecraftGarbage();
                return resolve(toSend);
            }
        });
    });
}

function minecraftGarbage(){
    minecraft.stdout.removeAllListeners()
    minecraft.stdout.on('data', async data =>{
        console.log(data)
        var toSend = {
            'packet':'log',
            'log':data
        }
        if (connected){
            serverConnection.write(JSON.stringify(toSend));
        }
        if (data.toString().split(' ')[3].toString().startsWith('<')){
            var toSend = {
                'packet':'chat',
                'sender':data.toString().split(' ')[3].toString().split('<')[1].split('>')[0],
                'message':data.toString().split(' ').splice(4,data.toString().split(' ').length).join(' ').split('\n')[0]
            }
            if (connected){
                serverConnection.write(JSON.stringify(toSend));
            }
        }
        if (data.toString().split(' ')[1]="[main/FATAL]:"&&data.toString().includes("Failed to start the minecraft server")){
            console.log("Process already running, unleash the killer robots!"); // https://media.discordapp.net/attachments/775059056460824587/795869093978701834/unhoxi8s4d961.png?width=543&height=444
            var killerRobot = child_process.spawn('ps',['-aux'])
            killerRobot.stdout.setEncoding('utf-8');
            killerRobot.stdout.on('data',(data)=>{
                var rogueFound = false
                for (var i = 0; i < data.toString().split('\n').length;i++){
                    if (data.toString().split('\n')[i].includes('java -Xmx4G -Xms4G -jar '+config.jarname)){
                        rogueFound=true
                        var psLine=data.toString().split('\n')[i].split(' ')
                        if (psLine[0]==''){
                            psLine.splice(0,1)
                        }
                        psLine.splice(0,1)
                        var pid =-1
                        while (pid==-1){
                            if (psLine[0]==''){
                                psLine.splice(0,1)
                            }else{
                                pid=psLine.join(' ').split(' ')[0]
                            }
                        }
                        if (!pid.includes(':')){
                            child_process.exec('kill '+pid)
                            console.log("Rogue server found and destroyed.")
                            // Disarm the killer robots
                            killerRobot.removeAllListeners();
                            restartMinecraft();
                        }
                    }
                }
            });
            
        }
    });
}

function restartMinecraft(){
    kill(minecraft.pid)
    minecraft = null
    minecraft = child_process.spawn('java', ['-Xmx4G','-Xms4G','-jar',config.jarname]); 
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
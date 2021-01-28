////////////////////////////////
/// CamelWrapper by jkcoxson ///
////////////////////////////////

// Javascript > Java

// Rappers bad
// Wrappers good, like candy wrappers that people throw away. Except M&M's.

const { spawn } = require("child_process");
const config = require("./config.json");
const Net = require('net');

const serverConnection = new Net.Socket();

var connected = false

function connectpls(){
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

function packetInterpreter(raw){
    var packet = null
    try {
        // If packet parses as JSON, continue. Otherwise exit
        packet = JSON.parse(raw)
    } catch{
        return
    }
    if (packet.type=="playerList"){
        // Run the command in the java server and send it over
    }
    if (packet.type=="coordsOf"){
        // Run java command to get packet.player then sendMessage(x,y,z)
    }
    if (packet.type=="command"){
        // Pretty easy, just run packet.command in the server
    }
}

// Code for reconnections

serverConnection.on('close',()=>{
    console.log("Connection to CamelBot lost, reconnecting.")
    connected=false
});
serverConnection.on('error', (data)=>{
    console.log(data)
});
serverConnection.on('data', (data)=>{
    console.log(Buffer.from(data).toString('ascii'));
});
serverConnection.on('connect',()=>{
    connected=true
    console.log("Connected to CamelBot")
    sendMessage("yeet")
});

console.log("Attempting connection to CamelBot");
connectpls();

setInterval(()=>{
    if (connected==false){
        console.log("Attempting connection to CamelBot");
        connectpls();
    }
},10000);




// Minecraft code

const child_process = require('child_process');
const { resolve } = require("path");
const { rejects } = require("assert");

var minecraft = child_process.spawn('java', ['-Xmx4G','-Xms4G','-jar',config.jarname]); 
minecraft.stdout.setEncoding("utf-8");
minecraft.stdin.setEncoding("utf-8");

var interpreter = "any"

minecraft.stdout.on('data', async data =>{
    console.log(data)
    
});

async function getPlayerCoords(){
    return new Promise((resolve, reject) => {
        minecraft.stdin.write('coordprint')
        minecraft.stdout.on('data', async data =>{
            // This is called forever now... but it doesn't call new ones so little need to worry. 
            // It doesn't resolve unless a function is called.
            if (data.toString().split('\n')[1]=="coordprint"){
                var toSend = "";
                var splitData = data.toString().split('\n');
                for (var i = 2; i<splitData.length;i++){
                    if (splitData[i]!=='8675309'){
                        toSend+=splitData[i];
                    }
                }
                return resolve(toSend);
            }
        });
    });
}

async function test(){
    console.log(await getPlayerCoords());
}

test();

// [22:45:23] [Server thread/INFO]: [STDOUT]:
// coordprint
// jkcoxson: -576.7862361776911,63.0,1992.699999988079
// 8675309

// [22:49:57] [Server thread/INFO]: [STDOUT]:
// playerlist
// jkcoxson
// 8675309

// [22:50:31] [Server thread/INFO]: <jkcoxson> Hello World!
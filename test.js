const dgram = require('node:dgram');
const server = dgram.createSocket('udp4');

const {
    setupLight
} = require('./setup.js')

const MULTICAST_ADDRESS = "239.255.255.250";
const device = {};

server.on('error', (err) => {
    console.error(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    let resp;
    try {
        resp = JSON.parse(msg);
    } catch (err) {
        console.error("Failed to parse message: ", msg);
        console.error(err);
        return;
    }

    if (!resp.msg) {
        console.error("Invalid response", resp);
        return;
    } else {
        if (!resp.msg.data?.ip) {
            console.error("Missing ip address from response", resp);
            return;
        } else {
            device.ip = resp.msg.data.ip;
            device.device = resp.msg.data.device;
            device.sku = resp.msg.data.sku;
            device.bleVersionHard = resp.msg.data.bleVersionHard;
            device.bleVersionSoft = resp.msg.data.bleVersionSoft;
            device.wifiVersionHard = resp.msg.data.wifiVersionHard;
            device.wifiVersionSoft = resp.msg.data.wifiVersionSoft;

            console.log("Received response", device);

            setupLight(device, server);
        }
    }
});

server.on('response scan', (res) => {
    const response = JSON.parse(res);

    console.log(response);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
    server.addMembership(MULTICAST_ADDRESS);

    console.log("sending scan request");

    const reqMessage = JSON.stringify({
        msg: {
            cmd: "scan",
            data: {
                account_topic: "reserved"
            }
        }
    });

    server.send(Buffer.from(reqMessage),
        0,
        reqMessage.length,
        4001,
        MULTICAST_ADDRESS,
        err => {
            if (err) console.error(err);
            else console.log("Message sent");
        }
    )
});

server.bind(4002, '0.0.0.0');

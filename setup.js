function turnOn(device, server) {
    const ip = device.ip;
    const port = 4003;

    const msg = JSON.stringify({
        msg: {
            cmd: "turn",
            data: {
                value: 1
            }
        }
    });

    return new Promise((res, rej) => {
        server.send(Buffer.from(msg), 0, msg.length, port, ip, err => {
            if (err) console.error("Error while setting up", rej(err));
            else res();
        });
    })
}

function brightness(device, server) {
    const ip = device.ip;
    const port = 4003;

    const createMsg = (brightness) => JSON.stringify({
        msg: {
            cmd: "brightness",
            data: {
                value: brightness
            }
        }
    });

    let brightness = 10;
    let dir = 1;
    const key = setInterval(() => {
        const msg = createMsg(brightness)

        server.send(Buffer.from(msg), 0, msg.length, port, ip, err => {
            if (err) console.error("Error while setting up", err);
        })

        brightness = brightness + (dir) * 5;
        if (brightness >= 80) {
            brightness = 80;
            dir = -1;
        }

        if (brightness <= 20) {
            brightness = 20;
            dir = 1;
        }
        console.log("brightness", brightness);
    }, 300);


    return key;
}

exports.setupLight = (device, server) => {
    turnOn(device, server).then(() => {
        console.log("Turned on");
    }).catch(err => console.error(err));

    const key = brightness(device, server);
}

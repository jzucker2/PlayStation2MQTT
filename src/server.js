'use strict';

const express = require('express');
const promBundle = require("express-prom-bundle");
const bodyParser = require('body-parser');
const spawn = require('await-spawn');
const mqtt = require("mqtt");
const Constants = require('./constants');
const metricsMiddleware = promBundle({includeMethod: true});
// actual framework is broken as a module :(
// const playactor = require('playactor');

// Constants
const PORT = Constants.PORT;
const HOST = Constants.HOST;

// MQTT
const client = mqtt.connect(Constants.MQTT_BROKER_URL, Constants.mqttConnectionOptions);

// App
const app = express();

// add monitoring
app.use(metricsMiddleware);

// https://stackoverflow.com/questions/10005939/how-do-i-consume-the-json-post-data-in-an-express-application
// parse application/json
app.use(bodyParser.json());

// simple route
app.get('/', (req, res) => {
    res.send('Hello World');
});

const STANDBY_STATUS = 'STANDBY'; // eslint-disable-line no-unused-vars

function PlayactorException(spawnException) {
    this.spawnException = spawnException;
    this.toString = function() {
        return `${this.spawnException.code} => ${this.spawnException.stderr}`;
    };
    this.code = this.spawnException.code;
}

function ResponseParseException(value) {
    this.value = value;
    this.toString = function() {
        return `${this.value}`;
    };
}

const parseOutput = (commandLineOutput) => {
    return JSON.parse(commandLineOutput);
}

const formatDeviceStatusResponse = (commandLineOutput) => {
    try {
        const parsedJSON = parseOutput(commandLineOutput);
        const { type, status, name, id } = parsedJSON;
        return {
            'device': type,
            'name': name,
            'status': status,
            'id': id
        };
    } catch (e) {
        throw new ResponseParseException(e.toString());
    }

}

// https://www.npmjs.com/package/await-spawn
const executePlayactorScript = async (playactor_args) => {
    // https://www.npmjs.com/package/await-spawn
    try {
        // playactor browse --timeout 10000
        const result = await spawn('playactor', playactor_args);
        return result.stdout.toString();
    } catch (e) {
        // console.error(`stdout: ${e.stdout.toString()}`);
        // console.error(`stderr: ${e.stderr.toString()}`);
        console.error(`got error code: ${e.code}`);
        if (e.code === 1) {
            return e.stdout.toString();
        }
        throw new PlayactorException(e);
    }
}

// get
app.get('/playactor/ps5/:ps5_ip', async(req, res) => {
    // cool tutorial
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    console.log(`starting with ip: ${ps5_ip}`);

    const playactor_args = ['check', '--ip', ps5_ip, '--timeout', '5000'];
    console.log(`playactor_args: ${playactor_args}`);
    try {
        const results = await executePlayactorScript(playactor_args);
        console.log(`got results ===> ${results}`);
        const currentStatus = formatDeviceStatusResponse(results)
        return res.json(currentStatus);
    } catch (e) {
        console.error(`returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
});

app.get('/playactor/ps5/:ps5_ip/wake', async(req, res) => {
    // cool tutorial
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    console.log(`starting with ip: ${ps5_ip}`);

    const playactor_args = ['wake', '--ip', ps5_ip, '--timeout', '5000', '--no-auth', '--connect-timeout', '5000'];
    console.log(`playactor_args: ${playactor_args}`);
    try {
        const results = await executePlayactorScript(playactor_args);
        console.log(`got results ===> ${results}`);
        return res.json({
            'message': 'ps5 awakened'
        });
    } catch (e) {
        console.error(`returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
});

app.get('/playactor/ps5/:ps5_ip/standby', async(req, res) => {
    // cool tutorial
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    console.log(`starting with ip: ${ps5_ip}`);

    const playactor_args = ['standby', '--ip', ps5_ip, '--timeout', '5000'];
    console.log(`playactor_args: ${playactor_args}`);
    try {
        const results = await executePlayactorScript(playactor_args);
        console.log(`got results ===> ${results}`);
        return res.json({
            'message': 'ps5 asleep'
        });
    } catch (e) {
        console.error(`returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

// MQTT implementation stuff here
client.on("connect", () => {
    client.subscribe("playstation", (err) => {
        if (!err) {
            client.publish("playstation", "Hello mqtt");
        }
    });
});

client.on("message", (topic, message) => {
    // message is Buffer
    console.log(message.toString());
    client.end();
});

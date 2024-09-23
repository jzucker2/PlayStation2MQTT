'use strict';

const express = require('express');
const promBundle = require("express-prom-bundle");
const bodyParser = require('body-parser');
const mqtt = require("mqtt");
const Constants = require('./constants');
const { HassSwitch } = require("./hassSwitch");
const { setPlaystationWake, setPlaystationStandby, getPlaystationInfo } = require("./playstation");
const metricsMiddleware = promBundle({includeMethod: true});
// actual framework is broken as a module :(
// const playactor = require('playactor');

// Constants
const PORT = Constants.PORT;
const HOST = Constants.HOST;
const SERVER_NAME = Constants.SERVER_NAME;

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

// get
app.get('/-/health', async(req, res) => {
    // cool tutorial
    return res.json({
        "message": "healthy",
    });
});

// get
app.get('/playactor/ps5/:ps5_ip', async(req, res) => {
    // cool tutorial
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    console.debug(`server info starting with ip: ${ps5_ip}`);

    try {
        const results = await getPlaystationInfo(ps5_ip);
        console.debug(`server info got results ===> ${results}`);
        return res.json(results);
    } catch (e) {
        console.error(`server info returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
});

app.get('/playactor/ps5/:ps5_ip/wake', async(req, res) => {
    // cool tutorial
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    console.debug(`server wake starting with ip: ${ps5_ip}`);

    try {
        const results = await setPlaystationWake(ps5_ip);
        console.debug(`server wake got results ===> ${results}`);
        return res.json({
            'message': 'ps5 awakened'
        });
    } catch (e) {
        console.error(`server wake returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
});

app.get('/playactor/ps5/:ps5_ip/standby', async(req, res) => {
    // cool tutorial
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    console.debug(`server standby starting with ip: ${ps5_ip}`);

    try {
        const results = await setPlaystationStandby(ps5_ip);
        console.debug(`server standby got results ===> ${results}`);
        return res.json({
            'message': 'ps5 asleep'
        });
    } catch (e) {
        console.error(`server standby returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
});

app.listen(PORT, HOST);
console.debug(`Running on http://${HOST}:${PORT}`);

// MQTT implementation stuff here
const subscribeTopic = "playstation";

const nodeID = Constants.NODE_ID;
const objectID = "playstation";
const playstationSwitch = new HassSwitch(client, nodeID, objectID, SERVER_NAME, Constants.PS5_IP_ADDRESS);
const playstationIP = playstationSwitch.playstationIP;

client.on("connect", () => {
    console.debug('MQTT Connected');

    client.subscribe(subscribeTopic, (err) => {
        console.debug(`Subscribed to subscribeTopic '${subscribeTopic}'`);
        if (!err) {
            client.publish(subscribeTopic, "Subscribed mqtt");
        }
    });

    playstationSwitch.publishDiscoveryMessage();
    const commandTopic = playstationSwitch.getCommandTopic()
    client.subscribe(commandTopic, (err) => {
        console.debug(`Subscribed to commandTopic '${commandTopic}'`);
        if (err) {
            console.error(`Subscribed to commandTopic: ${commandTopic} err => '${err}'`);
        }
    });
});

client.on("message", async(topic, payload) => {
    // message is Buffer
    const message = payload.toString();
    console.debug('Received Message:', topic, message);
    await playstationSwitch.handleMessage(topic, message);
});

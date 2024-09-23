'use strict';

const express = require('express');
const promBundle = require("express-prom-bundle");
const bodyParser = require('body-parser');
const mqtt = require("mqtt");
const Constants = require('./constants');
const { HassSwitch, HassDiagnosticSensor } = require("./hassSensors");
const { handleGetPlaystationInfoRequest, handleStandbyPlaystationRequest, handleWakePlaystationRequest } = require("./httpHandlers");
const metricsMiddleware = promBundle({includeMethod: true});
// actual framework is broken as a module :(
// const playactor = require('playactor');

const FileStore = require('fs-store').FileStore;

// Create a store
const serverStore = new FileStore('playstation2mqtt.json');

// Get a value, providing a default
const serverID = serverStore.get('server_id');

if (!serverID) {
    // Store a value (will be written to disk asynchronously)
    serverStore.set('server_id', 7);
}

console.log(`The server store serverID: ${serverStore.get('server_id')}`);

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

// get
app.get('/-/health', async(req, res) => {
    // cool tutorial
    return res.json({
        "message": "healthy",
    });
});

// get
app.get('/playactor/ps5/:ps5_ip', async(req, res) => {
    return await handleGetPlaystationInfoRequest(req, res);
});

app.get('/playactor/ps5/:ps5_ip/wake', async(req, res) => {
    return await handleWakePlaystationRequest(req, res);
});

app.get('/playactor/ps5/:ps5_ip/standby', async(req, res) => {
    return await handleStandbyPlaystationRequest(req, res);
});

app.listen(PORT, HOST);
console.debug(`Running on http://${HOST}:${PORT}`);

// MQTT implementation stuff here
const playstationSwitch = new HassSwitch(client);
const serverSensor = new HassDiagnosticSensor(client, "Server Version", "server_version");

client.on("connect", () => {
    console.debug('MQTT Connected');

    playstationSwitch.publishDiscoveryMessage();
    serverSensor.publishDiscoveryMessage();
    serverSensor.publishState();
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

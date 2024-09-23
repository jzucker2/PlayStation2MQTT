'use strict';

const express = require('express');
const promBundle = require("express-prom-bundle");
const bodyParser = require('body-parser');
const mqtt = require("mqtt");
const Constants = require('./constants');
const { HassSwitch, HassDiagnosticSensor, HassPublishAllStatesButton } = require("./hassSensors");
const { handleGetPlaystationInfoRequest, handleStandbyPlaystationRequest, handleWakePlaystationRequest } = require("./httpHandlers");
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
const publishAllStatesButton = new HassPublishAllStatesButton(client);

client.on("connect", () => {
    console.debug('MQTT Connected');

    playstationSwitch.publishDiscoveryMessage();
    serverSensor.publishDiscoveryMessage();
    publishAllStatesButton.publishDiscoveryMessage();
    serverSensor.publishState();
    const allSubscribedTopics = [
        playstationSwitch.getCommandTopic(),
        publishAllStatesButton.getCommandTopic(),
    ];
    client.subscribe(allSubscribedTopics, (err) => {
        console.debug(`Subscribed to allSubscribedTopics '${allSubscribedTopics}'`);
        if (err) {
            console.error(`Subscribe error to allSubscribedTopics: ${allSubscribedTopics} with err => '${err}'`);
        }
    });
});

client.on("message", async(topic, payload) => {
    // message is Buffer
    const message = payload.toString();
    console.debug('Received Message:', topic, message);
    await playstationSwitch.handleMessage(topic, message);
    await publishAllStatesButton.handleMessage(topic, message);
    console.debug('Done processing all mqtt messages: ', topic, message);
});

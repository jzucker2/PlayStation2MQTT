'use strict';

const express = require('express');
const { pinoHTTPLogger, logger } = require("./logging");

// App
const app = express();
app.use(pinoHTTPLogger);

// add monitoring
const promBundle = require("express-prom-bundle");
const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

const bodyParser = require('body-parser');
const mqtt = require("mqtt");
const Constants = require('./constants');
const { HassPlayStationPowerSwitch, HassServerIDSensor, HassVersionSensor, HassPublishAllStatesButton } = require("./hassSensors");
const { handleGetPlaystationInfoRequest, handleStandbyPlaystationRequest, handleWakePlaystationRequest } = require("./httpHandlers");

// actual framework is broken as a module :(
// const playactor = require('playactor');

// Constants
const PORT = Constants.PORT;
const HOST = Constants.HOST;

// MQTT
const client = mqtt.connect(Constants.MQTT_BROKER_URL, Constants.mqttConnectionOptions);

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
logger.info(`Running on http://${HOST}:${PORT}`);

// MQTT implementation stuff here
const playstationPowerSwitch = new HassPlayStationPowerSwitch(client);
const serverVersionSensor = new HassVersionSensor(client);
const serverIDSensor = new HassServerIDSensor(client);
const publishAllStatesButton = new HassPublishAllStatesButton(client);

const publishAllDiscoveryMessages = () => {
    logger.info("Publish All Discovery Messages");
    playstationPowerSwitch.publishDiscoveryMessage();
    serverVersionSensor.publishDiscoveryMessage();
    serverIDSensor.publishDiscoveryMessage();
    publishAllStatesButton.publishDiscoveryMessage();
}

const publishAllStatesAction = () => {
    logger.info("Publish All States");
    serverVersionSensor.publishState();
    serverIDSensor.publishState();
}

const allSubscribeTopics = [
    playstationPowerSwitch.getCommandTopic(),
    publishAllStatesButton.getCommandTopic(),
];

client.on("connect", () => {
    logger.debug('MQTT Connected');

    publishAllDiscoveryMessages();
    publishAllStatesAction();
    
    client.subscribe(allSubscribeTopics, (err) => {
        logger.debug(`Subscribed to allSubscribeTopics '${allSubscribeTopics}'`);
        if (err) {
            logger.error(`Subscribe error to allSubscribeTopics: ${allSubscribeTopics} with err => '${err}'`);
        }
    });
});



client.on("message", async(topic, payload) => {
    // message is Buffer
    const message = payload.toString();
    logger.debug('Received Message:', topic, message);
    await playstationPowerSwitch.handleMessage(topic, message);
    await publishAllStatesButton.handleMessage(topic, message, publishAllStatesAction);
    logger.debug('Done processing all mqtt messages: ', topic, message);
});

'use strict';

const express = require('express');
const { pinoHTTPLogger, logger } = require("./logging");

// App
const app = express();
app.use(pinoHTTPLogger);

// add monitoring
const { promMiddleware, promMetrics } = require('./prometheus');
app.use(promMiddleware);

const bodyParser = require('body-parser');
const { MQTTClient } = require('./mqttClient');
const Constants = require('./constants');
const { HassPlayStationPowerSwitch, HassPlayStationStateSensor, HassServerIDSensor, HassVersionSensor, HassPublishAllStatesButton } = require("./hassSensors");
const { handleGetPlaystationInfoRequest, handleStandbyPlaystationRequest, handleWakePlaystationRequest } = require("./httpHandlers");
const {getOrCreateServerID} = require("./serverStore");

// actual framework is broken as a module :(
// const playactor = require('playactor');

// Constants
const PORT = Constants.PORT;
const HOST = Constants.HOST;
const serverID = getOrCreateServerID();

// MQTT
const mqttClient = new MQTTClient(Constants.MQTT_BROKER_URL, Constants.mqttConnectionOptions);

// https://stackoverflow.com/questions/10005939/how-do-i-consume-the-json-post-data-in-an-express-application
// parse application/json
app.use(bodyParser.json());

// simple route
app.get('/', (req, res) => {
    res.send('Hello World');
});

// get
app.get('/-/health', async(req, res) => {
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
logger.info(`Running on http://${HOST}:${PORT} with serverID: ${serverID}`);

// MQTT implementation stuff here
const playstationPowerSwitch = new HassPlayStationPowerSwitch(mqttClient);
const playstationStateSensor = new HassPlayStationStateSensor(mqttClient);
const serverVersionSensor = new HassVersionSensor(mqttClient);
const serverIDSensor = new HassServerIDSensor(mqttClient);
const publishAllStatesButton = new HassPublishAllStatesButton(mqttClient);

const publishAllDiscoveryMessages = () => {
    promMetrics.publishAllMQTTDiscoveryMessagesCounter.inc();
    logger.info("Publish All Discovery Messages");
    playstationPowerSwitch.publishDiscoveryMessage();
    playstationStateSensor.publishDiscoveryMessage();
    serverVersionSensor.publishDiscoveryMessage();
    serverIDSensor.publishDiscoveryMessage();
    publishAllStatesButton.publishDiscoveryMessage();
}

const publishPlayStationStateAction = async (source) => {
    logger.info(`Starting Publish PS State from source: ${source}`);
    promMetrics.publishPlayStationMQTTStateMessagesCounter.labels({ source: source }).inc();
    await playstationStateSensor.publishPlayStationState();
}

const publishAllStatesAction = async(source) => {
    promMetrics.publishAllMQTTStatesMessagesCounter.inc();
    logger.info("Starting Publish All States");
    serverVersionSensor.publishState();
    serverIDSensor.publishState();
    await publishPlayStationStateAction(source);
    logger.info("Done with publishing all states");
}

const allSubscribeTopics = [
    playstationPowerSwitch.getCommandTopic(),
    publishAllStatesButton.getCommandTopic(),
];

mqttClient.client.on("connect", async() => {
    logger.debug('MQTT Connected');
    promMetrics.connectedToMQTTBrokerCounter.inc();

    publishAllDiscoveryMessages();
    await publishAllStatesAction("initial_connection");

    const updatePlayStationStateInvervalID = setInterval(async() => {
        // runs every 60 seconds
        logger.info("Running ps update interval check");
        await publishPlayStationStateAction("interval_update");
    }, Constants.PS_UPDATE_INTERVAL_SECONDS * 1000);
    logger.debug(`updatePlayStationStateInvervalID: ${updatePlayStationStateInvervalID}`);

    mqttClient.subscribe(allSubscribeTopics, (err) => {
        logger.info(`Subscribed to allSubscribeTopics '${allSubscribeTopics}'`);
        promMetrics.subscribedToMQTTTopicsCounter.inc();
        if (err) {
            logger.error(`Subscribe error to allSubscribeTopics: ${allSubscribeTopics} with err => '${err}'`);
            promMetrics.subscribedToMQTTTopicsWithErrorCounter.inc();
        }
    });
});



mqttClient.client.on("message", async(topic, payload) => {
    // message is Buffer
    promMetrics.receivedMQTTMessageCounter.labels({ topic: topic }).inc();
    const message = payload.toString();
    logger.debug('Received Message:', topic, message);
    await playstationPowerSwitch.handleMessage(topic, message);
    await publishAllStatesButton.handleMessage(topic, message, publishAllStatesAction);
    logger.debug('Done processing all mqtt messages: ', topic, message);
});

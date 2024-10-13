'use strict';

const mqtt = require("mqtt");
const { promMetrics } = require('./prometheus');


class MQTTClient {
    client;

    constructor(brokerURL, options) {
        this.client = mqtt.connect(brokerURL, options);
    }

    publish = (topic, message) => {
        const options = {
            retain: true,
        };

        promMetrics.publishMQTTMessageCounter.labels({ topic: topic }).inc();
        this.client.publish(topic, message, options);
    }

    subscribe = (topics, callback) => {
        this.client.subscribe(topics, callback);
    }

}

exports.MQTTClient = MQTTClient;

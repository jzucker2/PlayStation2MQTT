'use strict';

const mqtt = require("mqtt");


class MQTTClient {
    client;

    constructor(brokerURL, options) {
        this.client = mqtt.connect(brokerURL, options);
    }

    publish = (topic, message) => {
        const options = {
            retain: true,
        };
        this.client.publish(topic, message, options);
    }

    subscribe = (topics, callback) => {
        this.client.subscribe(topics, callback);
    }

}

exports.MQTTClient = MQTTClient;

'use strict';

const mqtt = require("mqtt");


class MQTTClient {
    client;

    constructor(brokerURL, options) {
        this.client = mqtt.connect(brokerURL, options);
    }

    publish = (topic, message) => {
        this.client.publish(topic, message);
    }

}

exports.MQTTClient = MQTTClient;

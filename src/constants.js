const process = require('process');

module.exports = {
    PS5_IP_ADDRESS: process.env.PS5_IP_ADDRESS || '10.0.1.100',
    HOST: process.env.HOST || '0.0.0.0',
    PORT: process.env.PORT || 4242,
    MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || 'mqtt://mosquitto:1883',
    MQTT_USERNAME: process.env.MQTT_USERNAME || 'foo',
    MQTT_PASSWORD: process.env.MQTT_PASSWORD || 'bar',
    MQTT_CLIENT_ID: process.env.MQTT_CLIENT_ID || 'playstation2mqtt',
    MQTT_DISCOVERY_PREFIX: process.env.MQTT_DISCOVERY_PREFIX || 'homeassistant',
    SERVER_NAME: process.env.SERVER_NAME || 'dev',
    NODE_ID: process.env.NODE_ID || 'playstation2mqtt',
    VERSION: '0.8.0',
    APP_URL_HOST: process.env.APP_URL_HOST || `playstation2mqtt.local`,
    SUPPORT_URL: 'https://github.com/jzucker2/PlayStation2MQTT',

    POWER_DEVICE_CLASS: 'power',
    POWER_SWITCH_DEVICE_CLASS: 'switch',

    get mqttConnectionOptions() {
        delete this.mqttConnectionOptions;
        const connectionOptions = {
            clientId: this.MQTT_CLIENT_ID,
            username: this.MQTT_USERNAME,
            password: this.MQTT_PASSWORD,
        }
        return this.mqttConnectionOptions = connectionOptions;
    },
    get appURL() {
        delete this.appURL;
        const finalURL = `http://${this.APP_URL_HOST}:${this.PORT}`;
        return this.appURL = finalURL;
    },
    get originPayload() {
        delete this.originPayload;
        const finalPayload = {
            name: "PlayStation2MQTT",
            sw_version: this.VERSION,
            support_url: this.SUPPORT_URL,
        }
        return this.originPayload = finalPayload;
    },
};

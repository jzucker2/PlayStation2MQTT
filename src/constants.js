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
};

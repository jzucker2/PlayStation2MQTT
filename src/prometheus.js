'use strict';

const promBundle = require("express-prom-bundle");
const promMiddleware = promBundle({includeMethod: true});

const promMetrics = {
    get publishAllMQTTDiscoveryMessagesCounter() {
        delete this.publishAllMQTTDiscoveryMessagesCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_publish_all_mqtt_discovery_messages_total',
            help: 'Total count of publishing all MQTT discovery messages',
        });
        return this.publishAllMQTTDiscoveryMessagesCounter = finalMetric;
    },
    get publishAllMQTTStatesMessagesCounter() {
        delete this.publishAllMQTTStatesMessagesCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_publish_all_mqtt_states_messages_total',
            help: 'Total count of publishing all MQTT states messages',
        });
        return this.publishAllMQTTStatesMessagesCounter = finalMetric;
    },
    get connectedToMQTTBrokerCounter() {
        delete this.connectedToMQTTBrokerCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_connected_to_mqtt_broker_total',
            help: 'Total count of server connected to mqtt broker',
        });
        return this.connectedToMQTTBrokerCounter = finalMetric;
    },
    get subscribedToMQTTTopicsCounter() {
        delete this.subscribedToMQTTTopicsCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_subscribed_to_mqtt_topics_total',
            help: 'Total count of server subscribed to MQTT topics',
        });
        return this.subscribedToMQTTTopicsCounter = finalMetric;
    },
    get subscribedToMQTTTopicsWithErrorCounter() {
        delete this.subscribedToMQTTTopicsWithErrorCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_subscribed_to_mqtt_topics_with_error_total',
            help: 'Total count of server subscribed to MQTT topics with error',
        });
        return this.subscribedToMQTTTopicsWithErrorCounter = finalMetric;
    },
    get receivedMQTTMessageCounter() {
        delete this.receivedMQTTMessageCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_received_mqtt_message_total',
            help: 'Total count of MQTT messages received',
            labelNames: ['topic'],
        });
        return this.receivedMQTTMessageCounter = finalMetric;
    },
    get publishMQTTMessageCounter() {
        delete this.publishMQTTMessageCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_publish_mqtt_message_total',
            help: 'Total count of MQTT messages published',
            labelNames: ['topic'],
        });
        return this.publishMQTTMessageCounter = finalMetric;
    },
    get playstationActionSucceededCounter() {
        delete this.playstationActionSucceededCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_playstation_action_succeeded_total',
            help: 'Total count of successfully interacting with PlayStation',
            labelNames: ['action'],
        });
        return this.playstationActionSucceededCounter = finalMetric;
    },
    get playstationActionErrorCounter() {
        delete this.playstationActionErrorCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_playstation_action_error_total',
            help: 'Total count of errors interacting with the PlayStation',
            labelNames: ['action'],
        });
        return this.playstationActionErrorCounter = finalMetric;
    },
    get hassPublishPlaystationStateSucceededCounter() {
        delete this.hassPublishPlaystationStateSucceededCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_hass_publish_playstation_state_succeeded_total',
            help: 'Total count of successfully publishing playstation state to MQTT for hass',
        });
        return this.hassPublishPlaystationStateSucceededCounter = finalMetric;
    },
    get hassPublishPlaystationStateErrorCounter() {
        delete this.hassPublishPlaystationStateErrorCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_hass_publish_playstation_state_error_total',
            help: 'Total count of errors publishing playstation state to MQTT for hass',
        });
        return this.hassPublishPlaystationStateErrorCounter = finalMetric;
    },
    get executeCLIScriptSucceededCounter() {
        delete this.executeCLIScriptSucceededCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_execute_cli_script_succeeded_total',
            help: 'Total count of successfully executing CLI script',
        });
        return this.executeCLIScriptSucceededCounter = finalMetric;
    },
    get executeCLIScriptErrorCounter() {
        delete this.executeCLIScriptErrorCounter;
        const finalMetric = new promMiddleware.promClient.Counter({
            name: 'playstation2mqtt_execute_cli_script_error_total',
            help: 'Total count of errors executing CLI script',
        });
        return this.executeCLIScriptErrorCounter = finalMetric;
    },
};

exports.promBundle = promBundle;
exports.promMiddleware = promMiddleware;
exports.promMetrics = promMetrics;

'use strict';

const Constants = require('./constants');
const {setPlaystationWake, setPlaystationStandby} = require("./playstation");
const { getOrCreateServerID, getOrCreatePlayStationID } = require("./serverStore");

const serverID = getOrCreateServerID();
const playstationID = getOrCreatePlayStationID();

const getDevicePayload = (identifier, deviceName, model, version, manufacturer, viaDevice= undefined) => {
    const finalPayload = {
        "identifiers": [
            identifier,
        ],
        "name": deviceName,
        "manufacturer": manufacturer,
        "model": model,
        "sw_version": version,
    };
    if (viaDevice) {
        finalPayload["via_device"] = viaDevice;
    }
    return finalPayload;
}

const getServerDevicePayload = () => {
    return getDevicePayload(serverID, "PlayStation2MQTT Bridge", "Bridge", Constants.VERSION, Constants.APP_NAME);
}

const getPlaystationDevicePayload = () => {
    return getDevicePayload(playstationID, "PlayStation", "PlayStation", "5", "Sony", serverID);
}

class HassBase {
    constructor(mqtt, sensorType, name, objectID, deviceClass = undefined, includeStateTopic = false, includeCommandTopic = false, entityCategory = undefined) {
        this.mqtt = mqtt;
        this.nodeID = Constants.NODE_ID;
        this.objectID = objectID;
        this.deviceClass = deviceClass;
        this.identifier = Constants.SERVER_NAME;
        this.name = name;
        this.sensorType = sensorType;
        this.playstationIP = Constants.PS5_IP_ADDRESS;
        this.discoveryPrefix = Constants.MQTT_DISCOVERY_PREFIX;
        this.includeStateTopic = includeStateTopic;
        this.includeCommandTopic = includeCommandTopic;
        this.entityCategory = entityCategory;
    }

    getBaseTopic() {
        // `homeassistant/switch/${this.nodeID}/${this.objectID}`
        // `homeassistant/switch/playstation2mqtt/${this.objectID}`
        return `${this.discoveryPrefix}/${this.sensorType}/${this.nodeID}/${this.objectID}`;
    }

    getOriginPayload() {
        return Constants.originPayload;
    }

    getConfigTopic() {
        return `${this.getBaseTopic()}/config`;
    }

    getUniqueID() {
        // FIXME: needs to always be unique
        let startingString = this.deviceClass;
        if (!startingString) {
            startingString = this.sensorType;
        }
        return `${serverID}_${startingString}${this.objectID}${this.identifier}`;
    }

    getObjectID() {
        return `${this.objectID}_${this.sensorType}`;
    }

    getDevicePayload() {
        return getPlaystationDevicePayload();
    }

    getConfigPayload() {
        const basePayload = {
            "name": this.name,
            "object_id": this.getObjectID(),
            "unique_id": this.getUniqueID(),
            "origin": this.getOriginPayload(),
            "device": this.getDevicePayload(),
        };
        if (this.includeStateTopic) {
            basePayload["state_topic"] = this.getStateTopic();
        }
        if (this.deviceClass) {
            basePayload["device_class"] = this.deviceClass;
        }
        if (this.includeCommandTopic) {
            basePayload["command_topic"] = this.getCommandTopic();
        }
        if (this.entityCategory) {
            basePayload["entity_category"] = this.entityCategory;
        }
        return basePayload;
    }

    getConfigPayloadString() {
        const finalPayload = this.getConfigPayload();
        console.debug(finalPayload);
        return JSON.stringify(finalPayload);
    }

    getDiscoveryTopic() {
        return this.getConfigTopic();
    }

    getDiscoveryPayload() {
        return this.getConfigPayloadString();
    }

    publishDiscoveryMessage() {
        this.mqtt.publish(this.getDiscoveryTopic(), this.getDiscoveryPayload());
    }

    getStateTopic() {
        return `${this.getBaseTopic()}/state`;
    }

    getCommandTopic() {
        return `${this.getBaseTopic()}/set`;
    }

    getStatePayload() {
        return "replace_me"
    }

    publishState() {
        this.mqtt.publish(this.getStateTopic(), this.getStatePayload());
    }
}

class HassServerSensor extends HassBase {
    getDevicePayload() {
        return getServerDevicePayload();
    }
}

class HassDiagnosticSensor extends HassServerSensor {
    constructor(mqtt, name, objectID, deviceClass = undefined) {
        const sensorType = "sensor";
        super(mqtt, sensorType, name, objectID, deviceClass, true, false, 'diagnostic');
    }

    getStatePayload() {
        return Constants.VERSION
    }
}

class HassSwitch extends HassBase {
    constructor(mqtt) {
        const sensorType = "switch";
        super(mqtt, sensorType, "Playstation Power", "power", sensorType,true, true);
        this.onPayload = "ON";
        this.offPayload = "OFF";
    }

    getDevicePayload() {
        return getPlaystationDevicePayload();
    }

    getIsOnPayload = (message) => {
        return message === this.onPayload;
    }

    getIsOffPayload = (message) => {
        return message === this.offPayload;
    }

    handleMessage = async(topic, message) => {
        if (topic === this.getCommandTopic()) {
            console.debug('mqtt switch got playstation switch message: ', message);
            if (this.getIsOnPayload(message)) {
                console.debug('mqtt switch => Turn on playstation');
                try {
                    const results = await setPlaystationWake(this.playstationIP);
                    console.debug(`mqtt switch wake got results ===> ${results}`);
                } catch (e) {
                    console.error(`mqtt switch wake returning error --> ${e.toString()}`);
                }
            } else {
                console.debug('mqtt switch => Turn off playstation');
                try {
                    const results = await setPlaystationStandby(this.playstationIP);
                    console.debug(`mqtt switch standby got results ===> ${results}`);
                } catch (e) {
                    console.error(`mqtt switch standby returning error --> ${e.toString()}`);
                }
            }
        }
    }
}

class HassPublishAllStatesButton extends HassServerSensor {
    constructor(mqtt) {
        const sensorType = "button";
        super(mqtt, sensorType, "Publish All States", "publish_all_states", undefined,false, true);
        this.pressPayload = "PRESS";
    }

    getDevicePayload() {
        return getServerDevicePayload();
    }

    handleMessage = async(topic, message, publishAction) => {
        if (topic === this.getCommandTopic()) {
            console.debug('mqtt switch got bridge publish all states message: ', message);
            if (message === this.pressPayload) {
                publishAction();
            }
        }
        return Promise.resolve();
    }
}

exports.HassDiagnosticSensor = HassDiagnosticSensor;
exports.HassSwitch = HassSwitch;
exports.HassPublishAllStatesButton = HassPublishAllStatesButton;

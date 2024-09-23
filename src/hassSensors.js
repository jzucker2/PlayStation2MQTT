const Constants = require('./constants');
const {setPlaystationWake, setPlaystationStandby} = require("./playstation");

class HassBase {
    constructor(mqtt, sensorType, name, objectID, deviceClass = undefined, includeCommandTopic = false, entityCategory = undefined) {
        this.mqtt = mqtt;
        this.nodeID = Constants.NODE_ID;
        this.objectID = objectID;
        this.deviceClass = deviceClass;
        this.identifier = Constants.SERVER_NAME;
        this.deviceName = "Playstation";
        this.serverDevice = Constants.SERVER_NAME;
        this.name = name;
        this.sensorType = sensorType;
        this.playstationIP = Constants.PS5_IP_ADDRESS;
        this.discoveryPrefix = Constants.MQTT_DISCOVERY_PREFIX;
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
        return `${startingString}${this.objectID}${this.identifier}`;
    }

    getObjectID() {
        return `${this.objectID}_${this.sensorType}`;
    }

    getDevicePayload(includeViaDevice=false) {
        const finalPayload = {
            "identifiers": [
                this.identifier,
            ],
            "name": this.deviceName,
            "manufacturer": "Sony",
        };
        if (includeViaDevice) {
            finalPayload["via_device"] = this.serverDevice;
        }
        return finalPayload;
    }

    getConfigPayload(isPlaystation=true) {
        const basePayload = {
            "name": this.name,
            "object_id": this.getObjectID(),
            "state_topic": this.getStateTopic(),
            "unique_id": this.getUniqueID(),
            "origin": this.getOriginPayload(),
            "device": this.getDevicePayload(isPlaystation),
        };
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

class HassDiagnosticSensor extends HassBase {
    constructor(mqtt, name, objectID, deviceClass = undefined) {
        const sensorType = "sensor";
        super(mqtt, sensorType, name, objectID, deviceClass, false, 'diagnostic');
    }

    getStatePayload() {
        return Constants.VERSION
    }
}

class HassSwitch extends HassBase {
    constructor(mqtt) {
        const sensorType = "switch";
        super(mqtt, sensorType, "Playstation Power", "power", sensorType,true);
        this.onPayload = "ON";
        this.offPayload = "OFF";
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

exports.HassDiagnosticSensor = HassDiagnosticSensor;
exports.HassSwitch = HassSwitch;

const Constants = require('./constants');
const {setPlaystationWake, setPlaystationStandby} = require("./playstation");

// <discovery_prefix>/<component>/[<node_id>/]<object_id>/config
// homeassistant/switch/playstation2mqtt/playstation/config
// homeassistant/switch/playstation2mqtt/playstation/state
// homeassistant/switch/playstation2mqtt/playstation/set
// homeassistant/switch/playstation/config
// homeassistant/switch/playstation/state
// homeassistant/switch/playstation/set
class HassBase {
    constructor(mqtt, sensorType, deviceClass, nodeID, objectID, identifier, playstationIP, includeCommandTopic = false) {
        this.mqtt = mqtt;
        this.nodeID = nodeID;
        this.objectID = objectID;
        this.deviceClass = deviceClass;
        this.identifier = identifier;
        this.name = "Playstation";
        this.sensorType = sensorType;
        this.playstationIP = playstationIP;
        this.discoveryPrefix = Constants.MQTT_DISCOVERY_PREFIX;
        this.includeCommandTopic = includeCommandTopic;
    }

    getBaseTopic() {
        // return `homeassistant/switch/${this.nodeID}/${this.objectID}`
        return `${this.discoveryPrefix}/${this.sensorType}/${this.nodeID}/${this.objectID}`
    }

    getConfigTopic() {
        return `${this.getBaseTopic()}/config`;
    }

    getUniqueID() {
        return `${this.deviceClass}${this.identifier}`;
    }

    getConfigPayload() {
        const basePayload = {
            "name": this.name,
            "device_class": this.deviceClass,
            "state_topic": this.getStateTopic(),
            "unique_id": this.getUniqueID(),
            "device": {
                "identifiers": [
                    this.identifier,
                ],
                "name": this.name,
                "manufacturer": "Sony",
            },
        };
        if (this.includeCommandTopic) {
            basePayload["command_topic"] = this.getCommandTopic();
        }
        return basePayload;
    }

    getConfigPayloadString() {
        const finalPayload = this.getConfigPayload();
        console.debug(finalPayload);
        return JSON.stringify(finalPayload);
    }

    getDiscoveryTopic() {
        return this.getConfigPayloadString();
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
}

class HassSwitch extends HassBase {
    constructor(mqtt, nodeID, objectID, identifier, playstationIP) {
        const sensorType = "switch";
        super(mqtt, sensorType, sensorType, nodeID, objectID, identifier, playstationIP, true);
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

exports.HassSwitch = HassSwitch;

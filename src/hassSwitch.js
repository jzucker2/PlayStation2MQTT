const Constants = require('./constants');

// <discovery_prefix>/<component>/[<node_id>/]<object_id>/config
// homeassistant/switch/playstation2mqtt/playstation/config
// homeassistant/switch/playstation2mqtt/playstation/state
// homeassistant/switch/playstation2mqtt/playstation/set
// homeassistant/switch/playstation/config
// homeassistant/switch/playstation/state
// homeassistant/switch/playstation/set
class HassBase {
    constructor(sensorType, deviceClass, nodeID, objectID, identifier, playstationIP, includeCommandTopic = false) {
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

    getStateTopic() {
        return `${this.getBaseTopic()}/state`;
    }

    getCommandTopic() {
        return `${this.getBaseTopic()}/set`;
    }
}

class HassSwitch extends HassBase {
    constructor(nodeID, objectID, identifier, playstationIP) {
        const sensorType = "switch";
        super(sensorType, sensorType, nodeID, objectID, identifier, playstationIP, true);
        this.onPayload = "ON";
        this.offPayload = "OFF";
    }

    getIsOnPayload = (message) => {
        return message === this.onPayload;
    }

    getIsOffPayload = (message) => {
        return message === this.offPayload;
    }
}

exports.HassSwitch = HassSwitch;

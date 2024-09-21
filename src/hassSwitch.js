const Constants = require('./constants');

// <discovery_prefix>/<component>/[<node_id>/]<object_id>/config
// homeassistant/switch/playstation2mqtt/playstation/config
// homeassistant/switch/playstation2mqtt/playstation/state
// homeassistant/switch/playstation2mqtt/playstation/set
// homeassistant/switch/playstation/config
// homeassistant/switch/playstation/state
// homeassistant/switch/playstation/set
class HassSwitch {
    constructor(nodeID, objectID, uniqueID, playstationIP) {
        this.nodeID = nodeID;
        this.objectID = objectID;
        this.uniqueID = uniqueID;
        this.name = "Playstation";
        this.playstationIP = playstationIP;
        this.discoveryPrefix = Constants.MQTT_DISCOVERY_PREFIX;
        this.onPayload = "ON";
        this.offPayload = "OFF";
    }

    getBaseTopic() {
        // return `homeassistant/switch/${this.nodeID}/${this.objectID}`
        return `${this.discoveryPrefix}/switch/${this.nodeID}/${this.objectID}`
    }

    getConfigTopic() {
        return `${this.getBaseTopic()}/config`;
    }

    getConfigPayload() {
        return {
            "name": this.name,
            "command_topic": this.getCommandTopic(),
            "state_topic": this.getStateTopic(),
            "unique_id": this.uniqueID,
            "device": {
                "identifiers": [
                    this.uniqueID,
                ],
                "name": this.name,
                "manufacturer": "Sony",

            },
        };
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

    getIsOnPayload = (message) => {
        return message === this.onPayload;
    }

    getIsOffPayload = (message) => {
        return message === this.offPayload;
    }
}

module.exports = HassSwitch;

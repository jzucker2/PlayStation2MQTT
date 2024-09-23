'use strict';

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateUUID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function getServerUUID() {
    const serverUUIDSuffix = generateUUID(10);
    return `playstation2mqtt_${serverUUIDSuffix}`;
}

function getPlayStationUUID() {
    const psUUIDSuffix = generateUUID(10);
    return `playstation_${psUUIDSuffix}`;
}

exports.generateUUID = generateUUID;
exports.getServerUUID = getServerUUID;
exports.getPlayStationUUID = getPlayStationUUID;

'use strict';

const Constants = require("./constants");
const {generateUUID} = require("./utils");
const FileStore = require('fs-store').FileStore;

// Create a store
const serverStore = new FileStore(Constants.CONFIG_PATH);

const SERVER_ID_KEY = 'server_id';

const getServerID = function() {
    return serverStore.get(SERVER_ID_KEY);
}

const checkForServerID = function() {
    const serverID = getServerID();

    if (!serverID) {
        // Store a value (will be written to disk asynchronously)
        const createdUUID = generateUUID(5);
        console.log(`Generated a new serverID createdUUID: ${createdUUID}`);
        serverStore.set('server_id', createdUUID);
    }
    console.log(`Checkd and ended up with serverStore getServerID: ${getServerID()}`);
}

exports.serverStore = serverStore;
exports.getServerID = getServerID;
exports.checkForServerID = checkForServerID;

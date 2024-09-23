'use strict';

const Constants = require("./constants");
const {getServerUUID} = require("./utils");
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
        const createdUUID = getServerUUID();
        console.log(`Generated a new serverID createdUUID: ${createdUUID}`);
        serverStore.set('server_id', createdUUID);
    }
    console.log(`Checked and ended up with serverStore getServerID: ${getServerID()}`);
}

const getOrCreateServerID = function() {
    const serverID = getServerID();

    if (!serverID) {
        // Store a value (will be written to disk asynchronously)
        const createdUUID = generateUUID(5);
        console.log(`Generated a new serverID createdUUID: ${createdUUID}`);
        serverStore.set('server_id', createdUUID);
    }
    console.log(`Checked and ended up with serverStore getServerID: ${getServerID()}`);
    return getServerID();
}

exports.serverStore = serverStore;
exports.getServerID = getServerID;
exports.checkForServerID = checkForServerID;
exports.getOrCreateServerID = getOrCreateServerID;

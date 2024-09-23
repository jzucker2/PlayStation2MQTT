'use strict';

const { logger } = require("./logging");
const Constants = require("./constants");
const { getServerUUID, getPlayStationUUID } = require("./utils");
const FileStore = require('fs-store').FileStore;

// Create a store
const serverStore = new FileStore(Constants.CONFIG_PATH);

const SERVER_ID_KEY = 'server_id';
const PLAYSTATION_ID_KEY = 'playstation_id';

const getServerID = function() {
    return serverStore.get(SERVER_ID_KEY);
}

const getPlayStationID = function() {
    return serverStore.get(PLAYSTATION_ID_KEY);
}

const getOrCreateServerID = function() {
    const serverID = getServerID();

    if (!serverID) {
        // Store a value (will be written to disk asynchronously)
        const createdUUID = getServerUUID();
        logger.debug(`Generated a new serverID createdUUID: ${createdUUID}`);
        serverStore.set(SERVER_ID_KEY, createdUUID);
    }
    const fetchedID = getServerID();
    logger.debug(`Checked and ended up with serverStore fetchedID: ${fetchedID}`);
    return fetchedID;
}

const getOrCreatePlayStationID = function() {
    const playStationID = getPlayStationID();

    if (!playStationID) {
        // Store a value (will be written to disk asynchronously)
        const createdUUID = getPlayStationUUID();
        logger.debug(`Generated a new playstationID createdUUID: ${createdUUID}`);
        serverStore.set(PLAYSTATION_ID_KEY, createdUUID);
    }
    const fetchedID = getPlayStationID();
    logger.debug(`Checked and ended up with serverStore fetchedID: ${fetchedID}`);
    return fetchedID;
}

exports.serverStore = serverStore;
exports.getServerID = getServerID;
exports.getOrCreateServerID = getOrCreateServerID;
exports.getOrCreatePlayStationID = getOrCreatePlayStationID;

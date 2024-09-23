'use strict';

const { logger } = require("./logging");
const { executeCLIScript, formatDeviceStatusResponse } = require("./cli");

const STANDBY_STATUS = 'STANDBY'; // eslint-disable-line no-unused-vars
const AWAKE_STATUS = 'AWAKE'; // eslint-disable-line no-unused-vars

// https://www.npmjs.com/package/await-spawn
function PlayactorException(cliException) {
    this.cliException = cliException;
    this.toString = function() {
        return `${this.cliException.toString()}`;
    };
    this.code = this.spawnException.code;
}

const executePlayactorScript = async (playactorArgs) => {
    // https://www.npmjs.com/package/await-spawn
    try {
        // playactor browse --timeout 10000
        const result = await executeCLIScript("playactor", playactorArgs);
        logger.debug(`executePlayactorScript: ${playactorArgs} got result: ${result}`);
        return result;
    } catch (e) {
        logger.error(`got error code: ${e.code}`);
        if (e.code === 1) {
            return e.stdout.toString();
        }
        throw new PlayactorException(e);
    }
}

class PlayStationInfo {
    constructor(info) {
        this.device = info['device'];
        this.name = info['name'];
        this.status = info['status'];
        this.id = info['id'];
    }

    getInfoDict = () => {
        return {
            'device': this.device,
            'name': this.name,
            'status': this.status,
            'id': this.id,
        }
    }
}

const getPlaystationInfo = async (playstationIP) => {
    // https://www.npmjs.com/package/await-spawn
    logger.debug(`info starting with playstationIP: ${playstationIP}`);

    const playactorArgs = ['check', '--ip', playstationIP, '--timeout', '5000'];
    logger.debug(`info playactorArgs: ${playactorArgs}`);
    try {
        const results = await executePlayactorScript(playactorArgs);
        logger.debug(`info got results ===> ${results}`);
        const currentStatus = formatDeviceStatusResponse(results);
        logger.info(`info got formatted currentStatus ===> ${currentStatus}`);
        return new PlayStationInfo(currentStatus);
    } catch (e) {
        logger.error(`info returning error --> ${e.toString()}`);
        throw e;
    }
}

const setPlaystationStandby = async (playstationIP) => {
    // https://www.npmjs.com/package/await-spawn
    logger.debug(`standby starting with playstationIP: ${playstationIP}`);

    const playactorArgs = ['standby', '--ip', playstationIP, '--timeout', '5000'];
    logger.debug(`standby playactorArgs: ${playactorArgs}`);
    try {
        const results = await executePlayactorScript(playactorArgs);
        logger.debug(`standby got results ===> ${results}`);
        return {
            'message': 'ps5 asleep'
        };
    } catch (e) {
        logger.error(`standby returning error --> ${e.toString()}`);
        throw e;
    }
}

const setPlaystationWake = async (playstationIP) => {
    // https://www.npmjs.com/package/await-spawn
    logger.debug(`wake starting with playstationIP: ${playstationIP}`);

    const playactorArgs = ['wake', '--ip', playstationIP, '--timeout', '5000', '--no-auth', '--connect-timeout', '5000'];
    logger.debug(`wake playactorArgs: ${playactorArgs}`);
    try {
        const results = await executePlayactorScript(playactorArgs);
        logger.debug(`wake got results ===> ${results}`);
        return {
            'message': 'ps5 awakened'
        };
    } catch (e) {
        logger.error(`wake returning error --> ${e.toString()}`);
        throw e;
    }
}

exports.executePlayactorScript = executePlayactorScript;
exports.formatDeviceStatusResponse = formatDeviceStatusResponse;
exports.getPlaystationInfo = getPlaystationInfo;
exports.setPlaystationStandby = setPlaystationStandby;
exports.setPlaystationWake = setPlaystationWake;

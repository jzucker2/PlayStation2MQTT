const spawn = require('await-spawn');
const { executeCLIScript, formatDeviceStatusResponse } = require("./cli");

const STANDBY_STATUS = 'STANDBY'; // eslint-disable-line no-unused-vars

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
        console.log(`executePlayactorScript: ${playactorArgs} got result: ${result}`);
        return result;
    } catch (e) {
        // console.error(`stdout: ${e.stdout.toString()}`);
        // console.error(`stderr: ${e.stderr.toString()}`);
        console.error(`got error code: ${e.code}`);
        if (e.code === 1) {
            return e.stdout.toString();
        }
        throw new PlayactorException(e);
    }
}

const getPlaystationInfo = async (playstationIP) => {
    // https://www.npmjs.com/package/await-spawn
    console.log(`info starting with playstationIP: ${playstationIP}`);

    const playactorArgs = ['check', '--ip', playstationIP, '--timeout', '5000'];
    console.log(`info playactorArgs: ${playactorArgs}`);
    try {
        const results = await executePlayactorScript(playactorArgs);
        console.log(`info got results ===> ${results}`);
        const currentStatus = formatDeviceStatusResponse(results);
        console.log(`info got formatted currentStatus ===> ${currentStatus}`);
        return currentStatus;
    } catch (e) {
        console.error(`info returning error --> ${e.toString()}`);
        throw e;
    }
}

const setPlaystationStandby = async (playstationIP) => {
    // https://www.npmjs.com/package/await-spawn
    console.log(`standby starting with playstationIP: ${playstationIP}`);

    const playactorArgs = ['standby', '--ip', playstationIP, '--timeout', '5000'];
    console.log(`standby playactorArgs: ${playactorArgs}`);
    try {
        const results = await executePlayactorScript(playactorArgs);
        console.log(`standby got results ===> ${results}`);
        return {
            'message': 'ps5 asleep'
        };
    } catch (e) {
        console.error(`standby returning error --> ${e.toString()}`);
        throw e;
    }
}

const setPlaystationWake = async (playstationIP) => {
    // https://www.npmjs.com/package/await-spawn
    console.log(`wake starting with playstationIP: ${playstationIP}`);

    const playactorArgs = ['wake', '--ip', playstationIP, '--timeout', '5000', '--no-auth', '--connect-timeout', '5000'];
    console.log(`wake playactorArgs: ${playactorArgs}`);
    try {
        const results = await executePlayactorScript(playactorArgs);
        console.log(`wake got results ===> ${results}`);
        return {
            'message': 'ps5 awakened'
        };
    } catch (e) {
        console.error(`wake returning error --> ${e.toString()}`);
        throw e;
    }
}

exports.executePlayactorScript = executePlayactorScript;
exports.formatDeviceStatusResponse = formatDeviceStatusResponse;
exports.getPlaystationInfo = getPlaystationInfo;
exports.setPlaystationStandby = setPlaystationStandby;
exports.setPlaystationWake = setPlaystationWake;

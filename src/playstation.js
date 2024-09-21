const spawn = require('await-spawn');

const STANDBY_STATUS = 'STANDBY'; // eslint-disable-line no-unused-vars

function ResponseParseException(value) {
    this.value = value;
    this.toString = function() {
        return `${this.value}`;
    };
}

const parseOutput = (commandLineOutput) => {
    return JSON.parse(commandLineOutput);
}

const formatDeviceStatusResponse = (commandLineOutput) => {
    try {
        const parsedJSON = parseOutput(commandLineOutput);
        const { type, status, name, id } = parsedJSON;
        return {
            'device': type,
            'name': name,
            'status': status,
            'id': id
        };
    } catch (e) {
        throw new ResponseParseException(e.toString());
    }

}

// https://www.npmjs.com/package/await-spawn
function PlayactorException(spawnException) {
    this.spawnException = spawnException;
    this.toString = function() {
        return `${this.spawnException.code} => ${this.spawnException.stderr}`;
    };
    this.code = this.spawnException.code;
}

const executePlayactorScript = async (playactor_args) => {
    // https://www.npmjs.com/package/await-spawn
    try {
        // playactor browse --timeout 10000
        const result = await spawn('playactor', playactor_args);
        return result.stdout.toString();
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

    const playactor_args = ['check', '--ip', playstationIP, '--timeout', '5000'];
    console.log(`info playactor_args: ${playactor_args}`);
    try {
        const results = await executePlayactorScript(playactor_args);
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

    const playactor_args = ['standby', '--ip', playstationIP, '--timeout', '5000'];
    console.log(`standby playactor_args: ${playactor_args}`);
    try {
        const results = await executePlayactorScript(playactor_args);
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

    const playactor_args = ['wake', '--ip', playstationIP, '--timeout', '5000', '--no-auth', '--connect-timeout', '5000'];
    console.log(`wake playactor_args: ${playactor_args}`);
    try {
        const results = await executePlayactorScript(playactor_args);
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

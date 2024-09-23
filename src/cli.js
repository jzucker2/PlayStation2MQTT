const spawn = require('await-spawn');

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
function CLIException(spawnException) {
    this.spawnException = spawnException;
    this.toString = function() {
        return `${this.spawnException.code} => ${this.spawnException.stderr}`;
    };
    this.code = this.spawnException.code;
}

const executeCLIScript = async (scriptName, scriptArgs) => {
    // https://www.npmjs.com/package/await-spawn
    try {
        // playactor browse --timeout 10000
        console.log(`executeCLIScript: ${scriptName} with args: ${scriptArgs}`);
        const result = await spawn(scriptName, scriptArgs);
        return result.stdout.toString();
    } catch (e) {
        // console.error(`stdout: ${e.stdout.toString()}`);
        // console.error(`stderr: ${e.stderr.toString()}`);
        console.error(`got error code: ${e.code}`);
        if (e.code === 1) {
            return e.stdout.toString();
        }
        throw new CLIException(e);
    }
}

exports.CLIException = CLIException;
exports.formatDeviceStatusResponse = formatDeviceStatusResponse;
exports.executeCLIScript = executeCLIScript;

'use strict';

const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const { logger } = require("./logging");
const { promMetrics } = require("./prometheus");

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
function CLIException(processException) {
    this.processException = processException;
    this.toString = function() {
        return `${this.processException.code} => ${this.processException.stderr}`;
    };
    this.code = this.processException.code;
}

const getCommandString = (scriptName, scriptArgs) => {
    return `${scriptName} ${scriptArgs.join(' ')}`;
}

const executeCLIScript = async (scriptName, scriptArgs) => {
    // playactor browse --timeout 10000
    logger.debug(`executeCLIScript: ${scriptName} with args: ${scriptArgs}`);
    const commandString = getCommandString(scriptName, scriptArgs);
    try {
        const { stdout, stderr } = await exec(commandString);
        logger.info('process stdout:', stdout);
        logger.error('process stderr:', stderr);
        promMetrics.executeCLIScriptSucceededCounter.inc();
        return stdout.toString();
    } catch (e) {
        const errorString = e.toString()
        logger.error(`executeCLIScript returning error --> ${errorString}`);
        promMetrics.executeCLIScriptErrorCounter.inc();
        return JSON.stringify({'error': errorString});
    }
}

exports.CLIException = CLIException;
exports.formatDeviceStatusResponse = formatDeviceStatusResponse;
exports.executeCLIScript = executeCLIScript;

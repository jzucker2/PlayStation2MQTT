'use strict';

const pinoHTTPLogger = require('pino-http')();

const logger = pinoHTTPLogger.logger;

exports.pinoHTTPLogger = pinoHTTPLogger;
exports.logger = logger;

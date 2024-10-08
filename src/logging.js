'use strict';

const process = require('process');
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const pino = require('pino');

// https://github.com/pinojs/pino-http?tab=readme-ov-file#logger-options
const pinoHTTPLogger = require('pino-http')({
    // Reuse an existing logger instance
    logger: pino({
        level: LOG_LEVEL,
    }),

    // Logger level is `info` by default
    useLevel: LOG_LEVEL,

    autoLogging: {
        ignore: function (req) {
            if (req.path === "/-/health") {
                return true;
            } else if (req.path === "/metrics") {
                return true;
            }
            return false;
        }
    },
});

const logger = pinoHTTPLogger.logger;

exports.pinoHTTPLogger = pinoHTTPLogger;
exports.logger = logger;

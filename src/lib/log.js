const logger = require('@lab325/log');
const { CONSOLE_LOGGING_LEVELS } = require('../config/env');

const log = logger.default({
    consoleLoggingLevels: CONSOLE_LOGGING_LEVELS,
    writeFiles: false
    // logDir
});

module.exports = log;

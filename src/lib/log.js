import logger from '@lab325/log';
import { CONSOLE_LOGGING_LEVELS } from '@config/env';

const log = logger({
	consoleLoggingLevels: CONSOLE_LOGGING_LEVELS,
	writeFiles: false
	// logDir
});

export default log;

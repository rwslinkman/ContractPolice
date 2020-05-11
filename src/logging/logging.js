const supportedLogLevels = {
    "error": 3,
    "warn": 2,
    "info": 1,
    "debug": 0
};

function Logging(loglevel, enableAppLogsConsole, enableAppLogsFile) {
    this.loglevel = supportedLogLevels[loglevel];
    this.consoleEnabled = enableAppLogsConsole;
    this.fileEnabled = enableAppLogsFile;
    this.logLines = [];
}

Logging.prototype.log = function(logTag, logSeverity, logMessage) {
    let lineLevel = supportedLogLevels[logSeverity];
    if(lineLevel >= this.loglevel) {
        const logLine = `${(new Date()).toISOString()}: [${logSeverity.toUpperCase()}] ${logTag}: ${logMessage}`;
        if(this.consoleEnabled) {
            console.log(logLine);
        }
        if(this.fileEnabled) {
            this.logLines.push(logLine);
        }
    }
};

Logging.prototype.writeLogs = function(outputDirectory) {
    if(!this.fileEnabled) return;
    // TODO: Write loglines to file
}
module.exports = Logging;
const helper = require("../helper-functions.js");

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

Logging.prototype.error = function(logTag, logMessage) {
    this.log(logTag, "error", logMessage);
}

Logging.prototype.warn = function(logTag, logMessage) {
    this.log(logTag, "warn", logMessage);
}

Logging.prototype.info = function(logTag, logMessage) {
    this.log(logTag, "info", logMessage);
}

Logging.prototype.debug = function(logTag, logMessage) {
    this.log(logTag, "debug", logMessage);
}

Logging.prototype.writeLogs = function(outputDirectory, timestamp) {
    if(!this.fileEnabled) {
        return;
    }
    const lineEnd = "\r\n";
    let output = "";
    this.logLines.forEach(logLine => output += logLine + lineEnd);
    let outputFileName = outputDirectory + "/contractpolice-logs-" + timestamp + ".txt";

    return helper.writeFile(outputFileName, output);
}
module.exports = Logging;
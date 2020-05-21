const fs = require('fs');

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
    const isFileEnabled = this.fileEnabled;
    const allLogs = this.logLines;

    const lineEnd = "\r\n";
    return new Promise(function(resolve, reject) {
        if(!isFileEnabled) {
            resolve();
            return;
        }

        let output = "";
        allLogs.forEach(logLine => output += logLine + lineEnd);
        let outputFileName = outputDirectory + "/contractpolice-logs-" + timestamp + ".txt";
        fs.writeFile(outputFileName, output, function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}
module.exports = Logging;
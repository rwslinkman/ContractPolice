function Logging(enabled, logWriters = []) {
    this.isEnabled = enabled;
    this.writers = logWriters;
    this.logs = [];
}

Logging.prototype.log = function(logTag, logSeverity, logMessage) {
    if(!this.isEnabled) return;
    this.logs.push({
        tag: logTag,
        severity: logSeverity,
        message: logMessage
    });
};

Logging.prototype.writeLogs = function(outputDirectory) {
    if(!this.isEnabled) return;
    // TODO:
}
module.exports = Logging;
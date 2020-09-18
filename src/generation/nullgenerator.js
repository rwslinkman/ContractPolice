function NullGenerator(logger) {
    this.logger = logger;
}

NullGenerator.prototype.generate = function() {
    this.logger.warn(LOG_TAG, "Unable to detect API version; no contracts generated");
    return [];
};

module.exports = NullGenerator;
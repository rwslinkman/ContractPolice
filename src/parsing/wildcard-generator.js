module.exports = WildcardGenerator;

function WildcardGenerator(logger) {
    this.logger = logger;
}

WildcardGenerator.prototype.isGenerateWildcard = function(value) {
    let valueType = typeof value;
    return valueType === 'string'
};

WildcardGenerator.prototype.generateWildcardValue = function(value) {
    return value;
};
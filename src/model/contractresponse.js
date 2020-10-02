function ContractResponse(statusCode, body = {}) {
    this.statusCode = statusCode;
    this.body = body;
}

/**
 * Removes all properties that have null value for cleaner data
 * @returns {ContractResponse}
 */
ContractResponse.prototype.clean = function() {
    Object.keys(this).forEach((key) => (this[key] == null) && delete this[key]);
    return this;
}

module.exports = ContractResponse;
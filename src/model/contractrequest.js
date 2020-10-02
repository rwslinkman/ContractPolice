function ContractRequest(path, method = "GET", headers = null, params = null, body = null) {
    this.path = path;
    this.method = method;
    this.headers = headers;
    this.params = params;
    this.body = body;
}

/**
 * Removes all properties that have null value for cleaner data
 * @returns {ContractRequest}
 */
ContractRequest.prototype.clean = function() {
    Object.keys(this).forEach((key) => (this[key] == null) && delete this[key]);
    return this;
}

module.exports = ContractRequest;
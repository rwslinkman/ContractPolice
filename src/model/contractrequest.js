function ContractRequest(path, method = "GET", headers = {}, params = {}) {
    this.path = path;
    this.method = method;
    this.headers = headers;
    this.params = params;
}

module.exports = ContractRequest;
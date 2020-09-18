function ContractRequest(path, method = "GET", headers = null, params = null, body = null) {
    this.path = path;
    this.method = method;
    this.headers = headers;
    this.params = params;
    this.body = body;
}

module.exports = ContractRequest;
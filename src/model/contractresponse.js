function ContractResponse(statusCode, body = {}) {
    this.statusCode = statusCode;
    this.body = body;
}

module.exports = ContractResponse;
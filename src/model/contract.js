function Contract(contractName, request, response) {
    this.name = contractName;
    this.request = request;
    this.response = response;
}
module.exports = Contract;
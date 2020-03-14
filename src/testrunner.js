const needle = require("needle");

function TestRunner(name, contract, endpoint) {
    this.testName = name;
    this.contract = contract;
    this.endpoint = endpoint;
}

TestRunner.prototype.runTest = function() {
    const method = this.contract.request.method || "GET";
    const url = this.endpoint + this.contract.request.path;
    const options = {
        json: true
    };

    return needle(method.toLowerCase(), url, options)
        .then(function(response) {
            console.log(response);
        })
        .catch(function(err) {
            console.error(err);
        });
};

module.exports = TestRunner;
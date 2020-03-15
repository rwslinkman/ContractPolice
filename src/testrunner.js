const needle = require("needle");

function TestRunner(name, contractRequest, endpoint, validator) {
    this.testName = name;
    this.contractRequest = contractRequest;
    this.endpoint = endpoint;
    this.validator = validator;
}

TestRunner.prototype.runTest = function() {
    const contractRequest = this.contractRequest;
    const validator = this.validator;
    const testNameLocal = this.testName;
    const method = contractRequest.method || "GET";
    const url = this.endpoint + contractRequest.path;
    const options = {
        json: true
    };
    const data = contractRequest.body || {};

    let request;
    if(method.toUpperCase() === "GET") {
        request = needle('get', url, options);
    } else {
        request = needle(method.toLowerCase(), url, data, options);
    }
    return request
        .then(function(response) {
            // Validate HTTP response
            return validator
                .validate(response)
                .then(function(violationReport) {
                    // Convert violationReport to testResult
                    let testResult = violationReport.hasViolations() ? "FAIL" : "PASS";
                    return {
                        testName: testNameLocal,
                        report: violationReport.getViolationTexts(),
                        result: testResult
                    };
                })
        })
        .catch(function(err) {
            console.error(err);
        });
};

module.exports = TestRunner;
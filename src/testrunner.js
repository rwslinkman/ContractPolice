const needle = require("needle");
const TestOutcome = require("./testoutcome.js");
const helper = require("./helper-functions.js");

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
    let contractHeaders = contractRequest.headers || [];
    contractHeaders = helper.normalizeHeaders(contractHeaders);
    if(contractHeaders.length > 0) {
        options["headers"] = contractHeaders;
    }

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
                    return new TestOutcome(testNameLocal, violationReport.getViolationTexts(), testResult);
                })
        })
        .catch(function(ignored) {
            // HTTP request error
            let violationText = `ContractPolice contacted ${url} but was unable to reach it`;
            return new TestOutcome(testNameLocal, [violationText], "FAIL");
        });
};

module.exports = TestRunner;
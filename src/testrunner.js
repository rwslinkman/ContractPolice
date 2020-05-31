const needle = require("needle");
const TestOutcome = require("./testoutcome.js");
const helper = require("./helper-functions.js");
const LOG_TAG = "TestRunner";

function TestRunner(logger, name, contractRequest, endpoint, validator) {
    this.logger = logger;
    this.testName = name;
    this.contractRequest = contractRequest;
    this.endpoint = endpoint;
    this.validator = validator;
}

TestRunner.prototype.runTest = function() {
    const loggerLocal = this.logger;
    const contractRequest = this.contractRequest;
    const validator = this.validator;
    const testNameLocal = this.testName;
    loggerLocal.info(LOG_TAG, `Executing "${testNameLocal}" contract test `)

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
    loggerLocal.debug(LOG_TAG, `Creating request to endpoint: ${method.toUpperCase()} ${url}`);

    let request;
    if(method.toUpperCase() === "GET") {
        request = needle('get', url, options);
    } else {
        request = needle(method.toLowerCase(), url, data, options);
    }
    return request
        .then(function(response) {
            loggerLocal.debug(LOG_TAG, `Response statuscode [${response.statusCode}] at ${method.toUpperCase()} ${url}`);
            // Validate HTTP response
            return validator
                .validate(response)
                .then(function(violationReport) {
                    // Convert violationReport to testResult
                    loggerLocal.debug(LOG_TAG, `Contract test "${testNameLocal}" resulted in ${violationReport.getViolationCount()} contract violation(s)`);
                    let testResult = violationReport.hasViolations() ? "FAIL" : "PASS";
                    loggerLocal.info(LOG_TAG, `Contract test "${testNameLocal}" completed with result ${testResult}`);
                    return new TestOutcome(testNameLocal, violationReport.getViolationTexts(), testResult);
                })
                .catch(function(validatorError) {
                    // Validation error
                    let violationText = `Unable to validate ${testNameLocal} due to error`;
                    loggerLocal.error(LOG_TAG, `${violationText}: ${validatorError.message}`);
                    return new TestOutcome(testNameLocal, [violationText], "FAIL");
                })
        })
        .catch(function(needleError) {
            // HTTP request error
            loggerLocal.error(LOG_TAG, `Cannot reach testing target at "${needleError.address}:${needleError.port}" (errorcode: ${needleError.code})`);
            let violationText = `ContractPolice contacted ${url} but was unable to reach it`;
            return new TestOutcome(testNameLocal, [violationText], "FAIL");
        });
};

module.exports = TestRunner;
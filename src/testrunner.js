const needle = require("needle");
const TestOutcome = require("./testoutcome.js");
const helper = require("./helper-functions.js");
const LOG_TAG = "TestRunner";

function formatUrl(target, endpoint, queryParams) {
    if (target.endsWith("/") && endpoint.startsWith("/")) {
        endpoint = endpoint.substr(1);
    }
    let url = new URL(target + endpoint);
    queryParams.forEach(function (param) {
        let key = Object.keys(param)[0];
        url.searchParams.append(key, param[key]);
    })
    return url.toString();
}

function TestRunner(logger, name, contractRequest, target, validator) {
    this.logger = logger;
    this.testName = name;
    this.contractRequest = contractRequest;
    this.target = target;
    this.validator = validator;
}

TestRunner.prototype.runTest = async function () {
    const loggerLocal = this.logger;
    const contractRequest = this.contractRequest;
    const validator = this.validator;
    const testNameLocal = this.testName;
    loggerLocal.info(LOG_TAG, `Executing "${testNameLocal}" contract test `)

    const method = contractRequest.method || "GET";
    const options = {
        json: true,
        compressed: true
    };
    const data = contractRequest.body || {};
    // Headers
    let contractHeaders = contractRequest.headers || [];
    contractHeaders = helper.normalizeObject(contractHeaders);
    if (contractHeaders.length > 0) {
        options["headers"] = contractHeaders;
    }
    // Query params
    let contractQueryParams = contractRequest.params || [];
    contractQueryParams = helper.normalizeObject(contractQueryParams);
    // Endpoint
    const endpoint = formatUrl(this.target, contractRequest.path, contractQueryParams);
    loggerLocal.debug(LOG_TAG, `Creating request to endpoint: ${method.toUpperCase()} ${endpoint}`);

    try {
        // Execute HTTP request
        let request;
        if (method.toUpperCase() === "GET") {
            request = needle('get', endpoint, options);
        } else {
            request = needle(method.toLowerCase(), endpoint, data, options);
        }
        let response = await request;
        loggerLocal.debug(LOG_TAG, `Response statuscode [${response.statusCode}] at ${method.toUpperCase()} ${endpoint}`);

        try {
            // Validate HTTP response
            let violationReport = await validator.validate(response);

            loggerLocal.debug(LOG_TAG, `Contract test "${testNameLocal}" resulted in ${violationReport.getViolationCount()} contract violation(s)`);
            let testResult = violationReport.hasViolations() ? "FAIL" : "PASS";
            loggerLocal.info(LOG_TAG, `Contract test "${testNameLocal}" completed with result ${testResult}`);
            return new TestOutcome(testNameLocal, violationReport.getViolationTexts(), testResult);
        } catch (validatorError) {
            // Validation error
            let violationText = `Unable to validate ${testNameLocal} due to error`;
            loggerLocal.error(LOG_TAG, `${violationText}: ${validatorError.message}`);
            return new TestOutcome(testNameLocal, [violationText], "FAIL");
        }
    } catch (needleError) {
        // HTTP request error
        let errorTarget = (needleError.address === undefined) ? this.target : `${needleError.address}:${needleError.port}`
        loggerLocal.error(LOG_TAG, `Cannot reach testing target at "${errorTarget}" (errorcode: ${needleError.code})`);
        let violationText = `ContractPolice contacted ${endpoint} but was unable to reach it`;
        return new TestOutcome(testNameLocal, [violationText], "FAIL");
    }
};

module.exports = TestRunner;
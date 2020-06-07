const ViolationReport = require("./report.js");
const Violation = require("./violation.js");
const deepCompare = require("./deepcompare.js");
const LOG_TAG = "ContractValidator";

function validateStatusCode(logger, expectedResponse, actualResponse) {
    logger.debug(LOG_TAG, `Validating response status code...`);
    if(expectedResponse.statusCode !== actualResponse.statusCode) {
        logger.debug(LOG_TAG, `Status code validation failed`);
        return [new Violation("statusCode", expectedResponse.statusCode, actualResponse.statusCode)];
    }
    logger.debug(LOG_TAG, `Status code ${expectedResponse.statusCode} is valid`);
    return [];
}

function validateAllKeysExist(logger, expectedResponse, actualResponse) {
    let violations = validateMatchingBodyType(logger, expectedResponse, actualResponse);
    violations = violations.concat(validateStatusCode(logger, expectedResponse, actualResponse));
    if(violations.length === 0) {
        // Validation is only needed when types are the same
        return deepCompare(expectedResponse.body, actualResponse.body);
    }
    return [];
}

function validateMatchingBodyType(logger, expectedResponse, actualResponse) {
    if(!expectedResponse.hasOwnProperty("body")) {
        // No body expectations
        return [];
    }

    logger.debug(LOG_TAG, "Validating response body type...");
    let expectedBodyType = typeof expectedResponse.body;
    let actualBodyType = typeof actualResponse.body;
    if(expectedBodyType !== actualBodyType) {
        logger.debug(LOG_TAG, "Body type validation failed");
        return [new Violation("type of 'body'", expectedBodyType, actualBodyType)];
    }
    logger.debug(LOG_TAG, `Body type ${expectedBodyType} is valid`);
    return [];
}

function validateHeaders(logger, expectedResponse, actualResponse) {
    let expectedHeaders = expectedResponse.headers;
    if(expectedHeaders === null || expectedHeaders === undefined) {
        // No expectation = no violation
        return [];
    }
    let actualHeaders = actualResponse.headers;

    logger.debug(LOG_TAG, `Validating response headers...`);
    let violations = [];
    expectedHeaders.forEach(function(expectedHeader) {
        let headerViolations = deepCompare(expectedHeader, actualHeaders, false);
        violations = violations.concat(headerViolations);
    });
    logger.debug(LOG_TAG, `Header validation completed with ${violations.length} contract violation(s)`);
    return violations;
}

function ContractValidator(logger, contractResponse, validationRules = []) {
    let defaultRules = [
        validateStatusCode,
        validateMatchingBodyType,
        validateAllKeysExist,
        validateHeaders
    ];
    this.expectedResponse = contractResponse;
    this.validationRules = defaultRules.concat(validationRules);
    this.logger = logger;
}

ContractValidator.prototype.validate = async function(serverResponse) {
    const expected = this.expectedResponse;
    this.logger.info(LOG_TAG, "Validating server response against Contract Definition...");

    let violationsTotal = [];
    for(let r = 0; r < this.validationRules.length; r++) {
        let rule = this.validationRules[r];
        let violations = rule(this.logger, expected, serverResponse);
        violationsTotal = violationsTotal.concat(violations);
    }
    this.logger.info(LOG_TAG, "Creating validation report");
    return new ViolationReport(violationsTotal);
};

module.exports = ContractValidator;
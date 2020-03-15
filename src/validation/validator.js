const ViolationReport = require("./report.js");
const Violation = require("./violation.js");
const deepCompare = require("./deepcompare.js");

function validateStatusCode(expectedResponse, actualResponse) {
    if(expectedResponse.statuscode !== actualResponse.statusCode) {
        return [new Violation("statusCode", expectedResponse.statuscode, actualResponse.statusCode)];
    }
    return [];
}

function validateAllKeysExist(expectedResponse, actualResponse) {
    let bodyTypeViolations = validateMatchingBodyType(expectedResponse, actualResponse);
    if(bodyTypeViolations.length === 0) {
        // Validation is only needed when types are the same
        return deepCompare(expectedResponse.body, actualResponse.body);
    }
    return [];
}

function validateMatchingBodyType(expectedResponse, actualResponse) {
    if(expectedResponse == null || actualResponse == null) {
        return [new Violation("Response", "response", null)];
    }
    if(!expectedResponse.hasOwnProperty("body")) {
        // No body expectations
        return [];
    }

    let expectedBodyType = typeof expectedResponse.body;
    let actualBodyType = typeof actualResponse.body;
    if(expectedBodyType !== actualBodyType) {
        return [new Violation("type of 'body'", expectedBodyType, actualBodyType)];
    }
    return [];
}

function ContractValidator(contractResponse, validationRules = []) {
    let defaultRules = [
        // TODO: Create more violation checks
        validateStatusCode,
        validateMatchingBodyType,
        validateAllKeysExist
    ];
    this.expectedResponse = contractResponse;
    this.validationRules = defaultRules.concat(validationRules);
}

ContractValidator.prototype.validate = async function(serverResponse) {
    const expected = this.expectedResponse;

    let violationsTotal = [];
    for(let r = 0; r < this.validationRules.length; r++) {
        let rule = this.validationRules[r];
        let violations = rule(expected, serverResponse);
        violationsTotal = violationsTotal.concat(violations);
    }
    return new ViolationReport(violationsTotal);
};

module.exports = ContractValidator;
const ViolationReport = require("./report.js");
const Violation = require("./violation.js");
const deepCompare = require("./deepcompare.js");

function validateStatusCode(expectedResponse, actualResponse) {
    if(expectedResponse.statuscode !== actualResponse.statusCode) {
        return new Violation("statusCode", expectedResponse.statuscode, actualResponse.statusCode);
    }
    return null;
}

function validateAllKeysExist(expectedResponse, actualResponse) {
    if(validateMatchingBodyType(expectedResponse.body, actualResponse.body) == null) {
        let result = deepCompare(expectedResponse.body, actualResponse.body);
        // TODO: Add to violations list
    }
}

function validateMatchingBodyType(expectedResponse, actualResponse) {
    if(expectedResponse == null || actualResponse == null) {
        return new Violation("Response", "response", null)
    }
    let expectedBodyType = typeof expectedResponse.body;
    let actualBodyType = typeof actualResponse.body;
    if(expectedBodyType !== actualBodyType) {
        return new Violation("bodyType", expectedBodyType, actualBodyType);
    }
    return null;
}

function ContractValidator(contractResponse, validationRules = []) {
    this.expectedResponse = contractResponse;
    this.validationRules = [
        // TODO: Create more violation checks
        validateStatusCode,
        validateAllKeysExist,
        validateMatchingBodyType
    ];
    this.validationRules.concat(validationRules);
}

ContractValidator.prototype.validate = async function(serverResponse) {
    const expected = this.expectedResponse;

    let violations = [];
    this.validationRules.forEach(function(rule) {
        let violation = rule(expected, serverResponse);
        if(violation != null) {
            violations.push(violation);
        }
    });
    return new ViolationReport(violations);
};

module.exports = ContractValidator;
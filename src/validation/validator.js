const ViolationReport = require("./report.js");
const Violation = require("./violation.js");

function validateStatusCode(expectedResponse, actualResponse) {
    if(expectedResponse.statuscode !== actualResponse.statusCode) {
        return new Violation("statusCode", expectedResponse.statuscode, actualResponse.statusCode);
    }
    return null;
}

function ContractValidator(contractResponse, validationRules = []) {
    this.expectedResponse = contractResponse;
    this.validationRules = [
        validateStatusCode
        // TODO: Create more violation checks
        // TODO: Validation rule to see if all keys are present
    ].concat(validationRules);
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
const Violation = require("./violation.js");

function compareSpecialCase(key, expectedValue, actualValue) {
    let actualType = typeof actualValue;
    if(expectedValue === "<anyString>") {
        // validate that expectedValue is any String
        if(actualType !== "string") {
            return new Violation(key, "any String", actualType);
        }
        return null;
    } else if(expectedValue === "<anyNumber>") {
        if(actualType !== "number") {
            return new Violation(key, "any number", actualType);
        }
        return null;
    }
    return new Violation(key, expectedValue, "not supported");
}

// TODO: Add prefix property to print deeper children more correctly
function deepCompare(expected, actual, caseSensitive = true) {
    let violations = [];

    for (let propertyName in expected) {
        if (expected.hasOwnProperty(propertyName)) {
            let propName = caseSensitive ? propertyName : propertyName.toLowerCase();

            let expectedPropertyValue = expected[propertyName];
            let expectedPropertyValueType = typeof expectedPropertyValue;

            if (expectedPropertyValueType === "object") {
                if (Array.isArray(expectedPropertyValue)) {
                    for (let p = 0; p < expectedPropertyValue.length; p++) {
                        // Compare each item in array
                        let expectedItem = expectedPropertyValue[p];
                        let actualItem = actual[propertyName][p];

                        let itemViolations = deepCompare(expectedItem, actualItem);
                        violations = violations.concat(itemViolations);
                    }
                } else {
                    if (actual.hasOwnProperty(propertyName)) {
                        // Compare object property
                        let actualPropertyValue = actual[propertyName];
                        let itemViolations = deepCompare(expectedPropertyValue, actualPropertyValue);
                        violations = violations.concat(itemViolations);
                    } else {
                        violations.push(new Violation(propertyName, "present", "missing"));
                    }
                }
            } else {
                // Does it exist in actual
                if (actual.hasOwnProperty(propName)) {
                    let actualPropertyValue = actual[propName];
                    let actualPropertyValueType = typeof actualPropertyValue;

                    if (expectedPropertyValueType !== actualPropertyValueType && !expectedPropertyValue.startsWith("<any")) {
                        violations.push(new Violation(`type of '${propertyName}'`, expectedPropertyValueType, actualPropertyValueType));
                    } else {
                        // Check for special cases
                        if (typeof expectedPropertyValue === "string" && expectedPropertyValue.startsWith("<any") && expectedPropertyValue.endsWith(">")) {
                            let specialCaseViolation = compareSpecialCase(propertyName, expectedPropertyValue, actualPropertyValue);
                            if(specialCaseViolation !== null) {
                                violations.push(specialCaseViolation);
                            }
                        } else if (expectedPropertyValue !== actualPropertyValue) {
                            // Variable type comparison
                            violations.push(new Violation(propertyName, expectedPropertyValue, actualPropertyValue));
                        }
                    }
                } else {
                    violations.push(new Violation(propertyName, "present", "missing"));
                }
            }
        }
    }
    return violations;
}

module.exports = deepCompare;
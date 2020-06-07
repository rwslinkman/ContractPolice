const Violation = require("./violation.js");

function hasOwnPropertyCaseInsensitive(obj, property) {
    let props = [];
    for (let i in obj) if (obj.hasOwnProperty(i)) props.push(i);
    let prop;
    while (prop = props.pop()) if (prop.toLowerCase() === property.toLowerCase()) return prop;
    return null;
}

function isSpecialCase(property) {
    return (typeof property === "string")
        && property.startsWith("<any")
        && property.endsWith(">")
}

function compareSpecialCase(key, expectedValue, actualValue, prefix = "") {
    let actualType = typeof actualValue;
    if(expectedValue === "<anyString>") {
        // validate that expectedValue is any String
        if(actualType !== "string") {
            return new Violation(prefix + key, "any string", actualType);
        }
        return null;
    } else if(expectedValue === "<anyNumber>") {
        if(actualType !== "number") {
            return new Violation(prefix + key, "any number", actualType);
        }
        return null;
    } else if(expectedValue === "<anyBool>") {
        if(actualType !== "boolean") {
            return new Violation(prefix + key, "any boolean", actualType);
        }
        return null;
    }
    return new Violation(key, expectedValue, "not supported");
}

function deepCompare(expected, actual, caseSensitive = true, prefix = "") {
    let violations = [];

    for (let propertyName in expected) {
        if (expected.hasOwnProperty(propertyName)) {
            let expectedPropertyValue = expected[propertyName];
            let expectedPropertyValueType = typeof expectedPropertyValue;

            if (expectedPropertyValueType === "object") {
                if (Array.isArray(expectedPropertyValue)) {
                    for (let p = 0; p < expectedPropertyValue.length; p++) {
                        // Compare each item in array
                        let expectedItem = expectedPropertyValue[p];
                        let actualItem = actual[propertyName][p];

                        if(typeof expectedItem === "object") {
                            let itemViolations = deepCompare(expectedItem, actualItem, caseSensitive, `${prefix + propertyName}.`);
                            violations = violations.concat(itemViolations);
                        } else {
                            let actualArray = actual[propertyName];
                            if(!actualArray.includes(expectedItem) && !isSpecialCase(expectedItem)) {
                                let arrayViolation = new Violation(prefix + propertyName, expectedItem, "missing");
                                violations.push(arrayViolation);
                            }
                        }
                    }
                } else {
                    if (actual.hasOwnProperty(propertyName)) {
                        // Compare object property
                        let actualPropertyValue = actual[propertyName];
                        let itemViolations = deepCompare(expectedPropertyValue, actualPropertyValue, caseSensitive, `${prefix + propertyName}.`);
                        violations = violations.concat(itemViolations);
                    } else {
                        violations.push(new Violation(prefix + propertyName, "present", "missing"));
                    }
                }
            } else {
                // Does it exist in actual
                let propName = null;
                let actualPropertyValue = null;
                if(caseSensitive) {
                    if(actual.hasOwnProperty(propertyName)) {
                        propName = propertyName;
                        actualPropertyValue = actual[propertyName];
                    }
                } else {
                    let propertyNameCaseInsensitive = hasOwnPropertyCaseInsensitive(actual, propertyName);
                    if(propertyNameCaseInsensitive !== null && propertyNameCaseInsensitive !== undefined) {
                        propName = propertyNameCaseInsensitive;
                        actualPropertyValue = actual[propertyNameCaseInsensitive];
                    }
                }

                if(propName === null) {
                    // Property does not exist (even case-insensitive)
                    violations.push(new Violation(prefix + propertyName, "present", "missing"));
                }
                else {
                    // Compare property
                    let actualPropertyValueType = typeof actualPropertyValue;
                    if(expectedPropertyValueType === actualPropertyValueType && !isSpecialCase(expectedPropertyValue)) {
                        if (expectedPropertyValue !== actualPropertyValue) {
                            violations.push(new Violation(prefix + propertyName, expectedPropertyValue, actualPropertyValue));
                        }
                    }
                    else if(isSpecialCase(expectedPropertyValue)){
                        // anyString, anyNumber
                        let specialCaseViolation = compareSpecialCase(propertyName, expectedPropertyValue, actualPropertyValue, prefix);
                        if(specialCaseViolation !== null) {
                            violations.push(specialCaseViolation);
                        }
                    }
                    else {
                        // Type violation
                        violations.push(new Violation(`type of '${prefix + propertyName}'`, expectedPropertyValueType, actualPropertyValueType));
                    }
                }
            }
        }
    }
    return violations;
}

module.exports = deepCompare;
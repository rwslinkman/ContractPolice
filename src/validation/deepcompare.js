function deepCompare(expected, actual) {
    // console.log("Expected response");
    // console.log(expected);
    // console.log("Actual response");
    // console.log(actual);
    // console.log();
    let violations = [];

    for (let propertyName in expected) {
        if (expected.hasOwnProperty(propertyName)) {
            // TODO Compare propertyName names
            let expectedPropertyValue = expected[propertyName];
            let expectedPropertyValueType = typeof expectedPropertyValue;

            if (expectedPropertyValueType === "object") {
                if (Array.isArray(expectedPropertyValue)) {
                    for (let p = 0; p < expectedPropertyValue.length; p++) {
                        let expectedItem = expectedPropertyValue[p];
                        let actualItem = actual[propertyName][p];

                        let itemViolations = deepCompare(expectedItem, actualItem);
                        violations.concat(itemViolations);

                        // console.log(expectedItem);
                        // console.log(actualItem);
                        // console.log();
                        // deepCompare(expectedItem, actualItem);
                    }
                } else {
                    let itemViolations = deepCompare(expectedItem, actualItem);
                    violations.concat(itemViolations);
                    // TODO: Compare objects
                    // TODO: Add found violations to existing ones
                    // deepCompare(expected[propertyName], actual[propertyName]);
                }
            } else {
                // Does it exist in actual
                if(actual.hasOwnProperty(propertyName)) {
                    let actualPropertyValue = actual[propertyName];
                    let actualPropertyValueType = typeof actualPropertyValue;

                    console.log("Expect Property " + propertyName + " = " + expectedPropertyValue + " [" + expectedPropertyValueType + "]");
                    console.log("Actual Property " + propertyName + " = " + actualPropertyValue + " [" + actualPropertyValueType + "]");
                    // TODO Compare items
                } else {
                    // console.log(expected);
                    // console.log(actual);
                    console.log("Property " + propertyName + " is missing in actual!!");
                    // TODO Add violation
                }
            }
        }
    }
    return violations;
}

module.exports = deepCompare;
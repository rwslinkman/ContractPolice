function deepCompare(expected, actual) {
    // console.log("Expected response");
    // console.log(expected);
    // console.log("Actual response");
    // console.log(actual);
    // console.log();
    let violations = [];

    for (let property in expected) {
        if (expected.hasOwnProperty(property)) {
            // TODO Compare property names
            console.log("PropertyName " + property);
            let propertyValue = expected[property];
            let valueType = typeof propertyValue;

            if (valueType === "object") {
                if (Array.isArray(propertyValue)) {
                    for (let p = 0; p < propertyValue.length; p++) {
                        // TODO: Collect all violations of item compare
                        // TODO: Add found violations to existing ones
                        let expectedItem = propertyValue[p];
                        let actualItem = actual[property][p];
                        // TODO: Check if actualItem exists, if not: expectation is not met => Violation

                        console.log(expectedItem);
                        console.log(actualItem);
                        console.log();
                        // deepCompare(expectedItem, actualItem);
                    }
                } else {
                    // TODO: Compare objects
                    // TODO: Add found violations to existing ones
                    // deepCompare(expected[property], actual[property]);
                }
            }
        }
    }
    return violations;
}

module.exports = deepCompare;
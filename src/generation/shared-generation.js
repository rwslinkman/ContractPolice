const helper = require("../helper-functions.js");

function generateSchemaValue(schema, useWildcards = false) {
    let createdObject;
    if (schema.hasOwnProperty("properties")) {
        createdObject = {};

        let propertyList = Object.keys(schema.properties);

        propertyList.forEach(prop => {
            if(prop === "configuration") {
                return;
            }
            let createdValue;
            let property = schema.properties[prop];
            switch (property.type) {
                case "string":
                    createdValue = (useWildcards) ? "<anyString>" : helper.generateRandomString();
                    break;
                case "integer":
                    createdValue = (useWildcards) ? "<anyNumber>" : helper.generateRandomNumber(1, 100);
                    break;
                case "boolean":
                    createdValue = (useWildcards) ? "<anyBool>" : helper.generateRandomBoolean();
                    break;
                case "array":
                    createdValue = [
                        generateSchemaValue(property.items, useWildcards)
                    ];
                    break;
                default:
                    // Could be object (without 'type=object') or unknown
                    if(property.hasOwnProperty("properties")) {
                        createdValue = generateSchemaValue(property, useWildcards);
                    }
                    else if(property.type === "object" && property.hasOwnProperty("additionalProperties")) {
                        // Map or Dictionary type
                        createdValue = `unsupportedPropType[map]`;
                    }
                    else {
                        if(property.hasOwnProperty("anyOf")) {
                            createdValue = "unsupported[anyOf]";
                        } else {
                            createdValue = `unsupportedProperty[${property.type || prop}]`;
                        }
                    }
                    break;
            }
            createdObject[prop] = createdValue;
        });
    } else if (schema.type === "array") {
        createdObject = [
            generateSchemaValue(schema.items, useWildcards)
        ];
    } else if (schema.type === "string") {
        createdObject = helper.generateRandomString();
    } else if (schema.type === "integer") {
        createdObject = helper.generateRandomNumber();
    } else if (schema.type === "boolean") {
        createdObject = helper.generateRandomBoolean();
    } else {
        let type = schema.type;
        if(schema.type === "object") {
            // TODO: Log warning
            type = "emptyObject";
        }
        createdObject = `unsupportedSchema[${type}]`;
    }
    return createdObject;
}

module.exports = {
    generateValueBySchema: generateSchemaValue
};
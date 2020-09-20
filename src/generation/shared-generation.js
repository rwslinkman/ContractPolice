const helper = require("../helper-functions.js");

function generateSchemaValue(schema, useWildcards = false) {
    let createdObject;
    if (schema.type === "object") {
        createdObject = {};
        if(!schema.hasOwnProperty("properties")) {
            return createdObject;
        }

        let propertyList = Object.keys(schema.properties);
        propertyList.forEach(prop => {
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
                case "object":
                    createdValue = generateSchemaValue(property, useWildcards);
                    break;
                default:
                    createdValue = `unsupported[${property.type}]`;
                    break;
            }
            createdObject[prop] = createdValue;
        });
    } else if (schema.type === "array") {
        createdObject = [
            generateSchemaValue(schema.items, useWildcards)
        ];
    } else {
        createdObject = `unsupported[${schema.type}]`;
    }
    return createdObject;
}

module.exports = {
    generateValueBySchema: generateSchemaValue
};
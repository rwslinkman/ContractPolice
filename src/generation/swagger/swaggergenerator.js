const ContractRequest = require("../../model/contractrequest.js");
const helper = require("../../helper-functions.js");
const ContractEntry = require("../../model/contractentry.js");
const ContractResponse = require("../../model/contractresponse.js");

function parseQueryParams(parameters) {
    return parameters
        .filter(param => param.in === "query")
        .map(pathParam => {
            let generatedValue;
            switch (pathParam.type) {
                case "integer":
                    generatedValue = helper.generateRandomNumber(1, 100);
                    break;
                default:
                    generatedValue = `unsupported[${pathParam.type}]`
                    break;
            }
            return new ContractEntry(pathParam.name, generatedValue);
        });
}

function replacePathParams(path, parameters) {
    parameters
        .filter(param => param.in === "path")
        .forEach(param => {
            path = path.replace(`{${param.name}}`, helper.generateRandomString())
        });
    return path;
}

function generateValueBySchema(schema, onlyRequired = false) {
    let createdObject;
    if (schema.type === "object") {
        createdObject = {};

        let propertyList = Object.keys(schema.properties);
        if(onlyRequired && schema.hasOwnProperty("required")) {
            propertyList = schema.required;
        }
        propertyList.forEach(prop => {
            let createdValue;
            let property = schema.properties[prop];
            switch (property.type) {
                case "string":
                    createdValue = helper.generateRandomString();
                    break;
                case "integer":
                    createdValue = helper.generateRandomNumber(1, 100);
                    break;
                default:
                    createdValue = `unsupported[${property.type}]`;
                    break;
            }
            createdObject[prop] = createdValue;
        });
    } else if(schema.type === "array") {
        createdObject = [
            generateValueBySchema(schema.items)
        ];
    } else {
        createdObject = `unsupported[${schema.type}]`;
    }
    return createdObject;
}

const LOG_TAG = "SwaggerGenerator";

function SwaggerGenerator(logger) {
    this.logger = logger;
}

SwaggerGenerator.prototype.generate = function (swaggerDefinition) {
    let contractDefinitions = [];
    let paths = Object.keys(swaggerDefinition.paths);
    paths.forEach(path => {
        let pathDef = swaggerDefinition.paths[path];
        let pathMethods = Object.keys(pathDef);
        pathMethods.forEach(pathMethod => {


            let methodDef = pathDef[pathMethod];
            let methodDefParams = methodDef["parameters"];
            let url = replacePathParams(path, methodDefParams);

            let params = parseQueryParams(methodDefParams);
            if (params.length > 0) {
                let paramsString = params.map(p => p.toQueryString());
                // TODO: Create additional definition for URL with paramsString
                // url += "?" + paramsString.join("&")
            }
            // console.log(params);
            // console.log(`${pathMethod.toUpperCase()}\t${url}`);

            let requestBody = {};
            methodDefParams
                .filter(param => param.in === "body")
                .forEach(param => {
                    requestBody[param.name] = generateValueBySchema(param.schema);
                    if (param.schema.hasOwnProperty("required")) {
                        // TODO: Create additional definition for missing required param
                    }
                });

            if (Object.keys(requestBody).length > 0) {
                console.log(requestBody);
            }
            else {
                requestBody = null;
            }
            let request = new ContractRequest(url, pathMethod.toUpperCase(), null, null, requestBody);


            let expectedResponses = Object.keys(methodDef["responses"]);
            expectedResponses.forEach(responseStatusCode => {
                // console.log(`${responseStatusCode}\t${pathMethod.toUpperCase()}\t${url}`);
                console.log(request);
                let expectedResponse = methodDef["responses"][responseStatusCode];
                // console.log(expectedResponse);

                let statusCode = parseInt(responseStatusCode);
                let responseBody = {};
                if(expectedResponse.hasOwnProperty("schema")) {
                    responseBody = generateValueBySchema(expectedResponse.schema);
                }
                let response = new ContractResponse(statusCode, responseBody);
                console.log(response);
                console.log();
            });
        });
    });
    return contractDefinitions;
};

module.exports = SwaggerGenerator;
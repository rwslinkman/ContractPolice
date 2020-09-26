const ContractRequest = require("../../model/contractrequest.js");
const helper = require("../../helper-functions.js");
const ContractEntry = require("../../model/contractentry.js");
const ContractResponse = require("../../model/contractresponse.js");
const Contract = require("../../model/contract.js");
const sharedGeneratorFunctions = require("../shared-generation.js");

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
            let replacement = helper.generateRandomString();
            path = path.replace(`{${param.name}}`, replacement);
        });
    return path;
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
        let pathMethods = Object
            .keys(pathDef)
            .filter(method => method !== "parameters");

        let pathLevelParameters = [];
        if(pathDef.hasOwnProperty("parameters")) {
            pathLevelParameters = pathDef.parameters;
        }

        pathMethods.forEach(pathMethod => {
            let methodDef = pathDef[pathMethod];
            let methodDefParams = methodDef["parameters"] || pathLevelParameters;
            let methodSummary = methodDef['operationId'] || methodDef['summary'] || "";
            let url = replacePathParams(path, methodDefParams);

            // let params = parseQueryParams(methodDefParams);
            // if (params.length > 0) {
            //     // TODO: Create additional definition for URL with paramsString
            //     url += "?" + paramsString.map(p => p.toQueryString()).join("&")
            // }

            let requestBody = {};
            methodDefParams
                .filter(param => param.in === "body")
                .forEach(param => {
                    requestBody[param.name] = sharedGeneratorFunctions.generateValueBySchema(param.schema);
                    // if (param.schema.hasOwnProperty("required")) {
                    //     let requiredProps = param.schema.required;
                    //     let bodyCopy = Object.assign({}, requestBody[param.name]);
                    //     requiredProps.forEach(prop => {
                    //         delete bodyCopy[prop];
                    //     });
                    //     // TODO: Create new request with bodyCopy (missing body param)
                    // }
                });

            requestBody = (Object.keys(requestBody).length > 0) ? requestBody : null;
            let request = new ContractRequest(url, pathMethod.toUpperCase(), null, null, requestBody);

            let expectedResponses = Object.keys(methodDef["responses"]);
            expectedResponses.forEach(responseStatusCode => {
                let expectedResponse = methodDef["responses"][responseStatusCode];

                let statusCode = parseInt(responseStatusCode);
                if(!isNaN(statusCode)) {
                    let responseBody = null;
                    if(expectedResponse.hasOwnProperty("schema")) {
                        responseBody = sharedGeneratorFunctions.generateValueBySchema(expectedResponse.schema, true);
                    }
                    let response = new ContractResponse(statusCode, responseBody);

                    if(methodSummary.length === 0) {
                        methodSummary = request.path.substr(1, request.path.length);
                    }
                    methodSummary = methodSummary.split(" ").join("-").split("/").join("-");
                    contractDefinitions.push(new Contract(`test_${request.method}_${methodSummary}_${statusCode}`, request, response));
                }
            });
        });
    });
    return contractDefinitions;
};

module.exports = SwaggerGenerator;
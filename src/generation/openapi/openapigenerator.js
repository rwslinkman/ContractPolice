const ContractRequest = require("../../model/contractrequest.js");
const helper = require("../../helper-functions.js");
const ContractEntry = require("../../model/contractentry.js");
const ContractResponse = require("../../model/contractresponse.js");
const Contract = require("../../model/contract.js");
const sharedGeneratorFunctions = require("../shared-generation.js");

function replacePathParams(path, parameters, replacement = helper.generateRandomString()) {
    parameters
        .filter(param => param.in === "path")
        .forEach(param => {
            path = path.replace(`{${param.name}}`, replacement);
        });
    return path;
}

const LOG_TAG = "OpenApiGenerator";
function OpenApiGenerator(logger) {
    this.logger = logger;
}

OpenApiGenerator.prototype.generate = function(openApiDefinition) {
    let contractDefinitions = [];
    let paths = Object.keys(openApiDefinition.paths);
    paths.forEach(path => {
        let pathDef = openApiDefinition.paths[path];
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

            let requestBody = null;
            if(methodDef.hasOwnProperty("requestBody")) {
                // console.log(methodDef.requestBody.content);
                let requestBodyTypes = Object.keys(methodDef.requestBody.content);
                requestBodyTypes.forEach(type => {
                    // TODO: Create request for each body type (application/json; application/xml; etc)
                    let requestBodySchema = methodDef.requestBody.content[type].schema;
                    requestBody = sharedGeneratorFunctions.generateValueBySchema(requestBodySchema);
                })
            }

            let request = new ContractRequest(url, pathMethod.toUpperCase(), null, null, requestBody);

            let expectedResponses = Object.keys(methodDef["responses"]);
            expectedResponses.forEach(responseStatusCode => {
                let expectedResponse = methodDef["responses"][responseStatusCode];

                let statusCode = parseInt(responseStatusCode);
                if(!isNaN(statusCode)) {
                    let responseBody = null;
                    if(expectedResponse.hasOwnProperty("content")) {
                        let responseBodyTypes = Object.keys(expectedResponse.content);
                        responseBodyTypes.forEach(type => {
                            // TODO: Create response for each body type (application/json; application/xml; etc)
                            let responseBodySchema = expectedResponse.content[type].schema;
                            responseBody = sharedGeneratorFunctions.generateValueBySchema(responseBodySchema, true);
                        });
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

module.exports = OpenApiGenerator;
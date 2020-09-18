const ContractRequest = require("../../model/contractrequest.js");
const helper = require("../../helper-functions.js");
const ContractEntry = require("../../model/contractentry.js");

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

const LOG_TAG = "SwaggerGenerator";

function SwaggerGenerator(logger) {
    this.logger = logger;
}

SwaggerGenerator.prototype.generate = function (swaggerDefinition) {

    let paths = Object.keys(swaggerDefinition.paths);

    paths.forEach(path => {
        let pathDef = swaggerDefinition.paths[path];
        let pathMethods = Object.keys(pathDef);
        pathMethods.forEach(pathMethod => {


            let methodDef = pathDef[pathMethod];
            let methodDefParams = methodDef["parameters"];
            let url = replacePathParams(path, methodDefParams);

            let params = parseQueryParams(methodDefParams);
            if(params.length > 0) {
                let paramsString = params.map(p => p.toQueryString());
                url += "?" + paramsString.join("&")
            }
            // console.log(params);
            console.log(url);


            // let request = new ContractRequest(path, pathMethod.toUpperCase());
            //
            //
            // let expectedResponses = Object.keys(methodDef["responses"]);
            // expectedResponses.forEach(response => {
            //     // console.log(methodDef["responses"][response]);
            //     // console.log(response);
            // });
        });
        // console.log(pathMethods);
    });
    return [];
};

module.exports = SwaggerGenerator;
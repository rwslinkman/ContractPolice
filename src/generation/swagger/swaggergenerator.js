const ContractRequest = require("../../model/contractrequest.js");

function parseQueryParams(parameters) {
    // console.log(parameters);
    return parameters;
    // return parameters.filter(param => param.in === "path").map(pathParam => {
    //     console.log("pathparam");
    //     console.log(pathParam);
    //     return pathParam;
    // });
}

function replacePathParams(path, parameters) {
    parameters.filter(param => param.in === "path").forEach(param => {
        // TODO: Inject generated value
        path = path.replace(`{${param.name}}`, "TODO")
    })
    return path;
}

const LOG_TAG = "SwaggerGenerator";
function SwaggerGenerator(logger) {
    this.logger = logger;
}

SwaggerGenerator.prototype.generate = function(swaggerDefinition) {

    let paths = Object.keys(swaggerDefinition.paths);

    paths.forEach(path => {
        let pathDef = swaggerDefinition.paths[path];
        let pathMethods = Object.keys(pathDef);
        pathMethods.forEach(pathMethod => {
            // console.log(pathMethod);
            console.log(`${pathMethod.toUpperCase()}\t${path}`);

            let methodDef = pathDef[pathMethod];
            // console.log(methodDef);
            let methodDefParams = methodDef["parameters"];
            console.log(methodDefParams);
            let params = parseQueryParams(methodDefParams);
            // console.log(`${pathMethod.toUpperCase()}\t${path}`);

            // console.log(path);
            // let url = replacePathParams(path, methodDefParams);
            // console.log(url);

            let request = new ContractRequest(path, pathMethod.toUpperCase());


            let expectedResponses = Object.keys(methodDef["responses"]);
            expectedResponses.forEach(response => {
                // console.log(methodDef["responses"][response]);
                // console.log(response);
            });
        });
        // console.log(pathMethods);
    });
    return [];
};

module.exports = SwaggerGenerator;
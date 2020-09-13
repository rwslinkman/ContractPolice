const SwaggerParser = require("@apidevtools/swagger-parser");

function ContractGenerator() {

}

ContractGenerator.prototype.generateContracts = function(apiDefinitionObjects) {
    // TODO: Analyse files
    // TODO: Return contract definition data
    try {
        // let swagger = await SwaggerParser.parse("openapi/openapi-example-github.yaml");
        let swagger = await SwaggerParser.parse("")
        let paths = Object.keys(swagger.paths);

        paths.forEach(path => {
            let pathDef = swagger.paths[path];
            let pathMethods = Object.keys(pathDef);
            pathMethods.forEach(pathMethod => {
                // console.log(`${pathMethod.toUpperCase()}\t${path}`);
                let methodDef = pathDef[pathMethod];
                let expectedResponses = Object.keys(methodDef["responses"]);
                expectedResponses.forEach(response => {
                    console.log(`${response}\t${pathMethod.toUpperCase()}\t${path}`);
                    console.log(methodDef["responses"][response]);
                    // console.log(response);
                });
            })
            // console.log(pathMethods);
        });
    }
    catch(e) {
        this.logger.warn(LOG_TAG, "Unable to read file. No contract tests generated.");
        console.error(e);
    }



}

module.exports = ContractGenerator;
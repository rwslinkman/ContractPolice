const LOG_TAG = "ContractGenerator";

function ContractGenerator(logger) {
    this.logger = logger;
}

ContractGenerator.prototype.generateContractDefinitions = function(apiDefinitionObjects) {
    // TODO: Analyse objects
    // TODO: Return contract definition data
    try {
        let paths = Object.keys(apiDefinitionObjects.paths);

        paths.forEach(path => {
            let pathDef = apiDefinitionObjects.paths[path];
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


    return [];
}

module.exports = ContractGenerator;
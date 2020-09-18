const SwaggerParser = require("@apidevtools/swagger-parser");
const SwaggerGenerator = require("./swagger/swaggergenerator.js");
const OpenApiGenerator = require("./openapi/openapigenerator.js");
const NullGenerator = require("./nullgenerator.js");

function isSwagger(api) {
    return api.swagger !== undefined && api.swagger.length > 0 && api.openapi === undefined;
}

function isOpenAPI(api) {
    return api.openapi !== undefined && api.openapi.length > 0 && api.swagger === undefined;
}

const LOG_TAG = "ContractGenerator";
function ContractGenerator(logger) {
    this.logger = logger;
}

ContractGenerator.prototype.generateContractDefinitions = async function(openApiFile) {
    let apiDefinition = null;
    try {
        apiDefinition = await SwaggerParser.dereference(openApiFile);
    } catch (e) {
        let errorMessage = e.message.substr(0, e.message.indexOf('\n'));
        this.logger.error(LOG_TAG, "Unable to parse OpenAPI file: " + errorMessage);
    }

    if (apiDefinition == null) {
        this.logger.warn(LOG_TAG, "No OpenAPI definition found. Skipping generate step.")
        return;
    }
    let apiGenerator = new NullGenerator();
    if(isSwagger(apiDefinition)) {
        apiGenerator = new SwaggerGenerator(this.logger);
    } else if(isOpenAPI(apiDefinition)) {
        apiGenerator = new SwaggerGenerator(this.logger);
        // apiGenerator = new OpenApiGenerator(this.logger);
    }

    return apiGenerator.generate(apiDefinition);
}

module.exports = ContractGenerator;
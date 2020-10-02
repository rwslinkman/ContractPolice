const SwaggerParser = require("@apidevtools/swagger-parser");
const SwaggerGenerator = require("./swagger/swaggergenerator.js");
const OpenApiGenerator = require("./openapi/openapigenerator.js");
const NullGenerator = require("./nullgenerator.js");
const helper = require("../helper-functions.js");

async function parseFile(file) {
    try {
        return await SwaggerParser.dereference(file);
    } catch(e) {
        // TODO: logging?
        return null;
    }
}

function clean(obj) {
    return Object.values(obj).filter(item => item !== null);
}

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

ContractGenerator.prototype.generateContractDefinitions = async function(sourceDir) {
    let allFiles = await helper.getFiles(sourceDir);
    let supportedFiles = allFiles.map(async (file) => await parseFile(file));
    let parsedApiDefinitions = clean(await Promise.all(supportedFiles));

    return parsedApiDefinitions.flatMap(apiDefinition => {
        let apiGenerator = new NullGenerator();
        if (isSwagger(apiDefinition)) {
            apiGenerator = new SwaggerGenerator(this.logger);
        } else if (isOpenAPI(apiDefinition)) {
            apiGenerator = new OpenApiGenerator(this.logger);
        }

        return apiGenerator.generate(apiDefinition);
    });
}

module.exports = ContractGenerator;
const ContractParser = require("./src/parsing/contractparser.js");
const TestRunner = require("./src/testrunner.js");
const ContractValidator = require("./src/validation/validator.js");
const ContractPoliceReporter = require("./src/reporting/contractpolicereporter.js");
const JUnitReporter = require("./src/reporting/junitreporter.js");
const fs = require('fs');
const Logging = require("./src/logging/logging.js");
//
const ContractGenerator = require("./src/generation/contractgenerator.js");
const yaml = require('js-yaml');
const helper = require("./src/helper-functions.js");

const LOG_TAG = "ContractPolice"
const defaultConfig = {
    contractDefinitionsDir: null, // required
    openApiFile: "",
    customValidationRules: [],
    failOnError: true,
    reportOutputDir: "/contractpolice/build",
    reporter: "default",
    enableAppLogsConsole: true,
    enableAppLogsFile: false,
    loglevel: "warn"
};

initializeConfig = function (logger, targetConfig, inputConfig) {
    targetConfig['customValidationRules'] = inputConfig.customValidationRules || defaultConfig.customValidationRules;
    targetConfig['failOnError'] = inputConfig.failOnError || defaultConfig.failOnError;
    targetConfig['reporter'] = inputConfig.reporter || defaultConfig.reporter;
    targetConfig['reportOutputDir'] = inputConfig.reportOutputDir || defaultConfig.reportOutputDir;
    targetConfig['enableAppLogsConsole'] = inputConfig.enableAppLogsConsole || defaultConfig.enableAppLogsConsole;
    targetConfig['enableAppLogsFile'] = inputConfig.enableAppLogsFile || defaultConfig.enableAppLogsFile;
    targetConfig['loglevel'] = inputConfig.loglevel || defaultConfig.loglevel;
    targetConfig['openApiFile'] = inputConfig.openApiFile || defaultConfig.openApiFile;

    if (!['error', 'warn', 'info', 'debug'].includes(inputConfig.loglevel)) {
        targetConfig.loglevel = defaultConfig.loglevel;
        logger.log(LOG_TAG, "warn", `Loglevel '${inputConfig.loglevel}' is not supported. Defaulting to '${defaultConfig.loglevel}' loglevel.`);
    }

    if (!["default", "junit"].includes(targetConfig.reporter)) {
        targetConfig.reporter = defaultConfig.reporter;
        logger.log(LOG_TAG, "warn", `Reporter '${inputConfig.reporter}' is not supported. Defaulting to '${defaultConfig.reporter}' reporter.`);
    }
}

function ContractPolice(endpoint, userConfig = {}) {
    let loglevel = userConfig.loglevel || defaultConfig.loglevel;
    if (!['error', 'warn', 'info', 'debug'].includes(loglevel)) {
        loglevel = defaultConfig.loglevel;
    }
    this.logger = new Logging(
        loglevel,
        userConfig.enableAppLogsConsole || defaultConfig.enableAppLogsConsole,
        userConfig.enableAppLogsFile || defaultConfig.enableAppLogsFile
    );

    let contractsDirectory = userConfig.contractDefinitionsDir || defaultConfig.contractDefinitionsDir;
    if (contractsDirectory === null || contractsDirectory === undefined) {
        this.logger.log(LOG_TAG, "error", "Required parameter 'config.contractDefinitionsDir' not found. Please provide the directory where contracts are stored.");
        throw Error("Required parameter 'config.contractDefinitionsDir' not found.");
    }
    if (endpoint === null || endpoint === undefined) {
        this.logger.log(LOG_TAG, "error", "Required parameter 'endpoint' not found. Please provide the endpoint that will be placed under test.");
        throw Error(`Required parameter 'endpoint' not found.`);
    }

    // Store parameters for later use
    this.endpoint = endpoint;
    this.contractsDirectory = contractsDirectory;
    this.config = {};
    initializeConfig(this.logger, this.config, userConfig);
}

ContractPolice.prototype.testContracts = async function () {
    this.logger.info(LOG_TAG, "Start contract test(s) with ContractPolice");

    // Parse contracts
    let contractParser = new ContractParser(this.logger);
    let contractFiles = await contractParser.findYamlFiles(this.contractsDirectory);
    let contracts = contractFiles.map((yamlFile) => {
        return contractParser.parseContract(this.contractsDirectory, yamlFile);
    });

    // Prepare test runners
    let testRunners = contracts.map((contractMeta) => {
        let validator = new ContractValidator(this.logger, contractMeta.response, this.config.validationRules);
        this.logger.info(LOG_TAG, `Created TestRunner for "${contractMeta.name}" Contract Definition`);
        return new TestRunner(this.logger, contractMeta.name, contractMeta.request, this.endpoint, validator);
    });

    // Run tests
    this.logger.info(LOG_TAG, "Running contract tests...");
    let testRuns = testRunners.map(it => it.runTest());
    let testResults = await Promise.all(testRuns);
    this.logger.info(LOG_TAG, "Contract tests completed. Gathering reports...");

    // Ensure output dir exists
    if (!fs.existsSync(this.config.reportOutputDir)) {
        this.logger.debug(LOG_TAG, `Output directory ${this.config.reportOutputDir} does not existing, creating...`);
        fs.mkdirSync(this.config.reportOutputDir);
    }
    // Collect execution report variables
    const runSuccess = !(testResults.map(it => it.result).includes("FAIL"));
    const timestamp = new Date().getTime();

    // Write test report
    this.logger.info(LOG_TAG, "Writing contract test report...")
    let reporter = new ContractPoliceReporter(this.logger, this.config.reportOutputDir);
    if (this.config.reporter === "junit") {
        reporter = new JUnitReporter(this.logger, this.config.reportOutputDir);
    }
    await reporter.writeTestReport(testResults, timestamp)
    this.logger.log(LOG_TAG, "info", "Contract test report written to file")

    // Write application logs if applicable
    if (this.logger.fileEnabled) {
        this.logger.debug(LOG_TAG, "Writing application logs to file");
    } else {
        this.logger.debug(LOG_TAG, "Skipped writing logs to file");
    }
    await this.logger.writeLogs(this.config.reportOutputDir, timestamp)
    if (this.logger.fileEnabled) {
        this.logger.debug(LOG_TAG, "Contract testing logs written to file");
    }

    // Finish execution
    const logEnd = runSuccess ? "successfully!" : "with violations and/or errors!"
    const message = "ContractPolice finished contract testing " + logEnd;
    this.logger.log(LOG_TAG, "info", message)
    // Throw error on failure to influence process exit code
    if (!runSuccess && this.config.failOnError) {
        this.logger.debug(LOG_TAG, "Quitting with error for runner's awareness");
        throw Error(message)
    }
};

ContractPolice.prototype.generateContractTests = async function () {
    // Convert data from OpenAPI file to (ContractPolice) Contract Definitions
    let generator = new ContractGenerator(this.logger);
    let generatedContractDefinitions = await generator.generateContractDefinitions(this.config.openApiFile);

    console.log(`Generated ${generatedContractDefinitions.length} contract definitions`);

    // Write newly created Contract Definitions to YAML files.
    const generatedSourcesDir = `${this.contractsDirectory}/generated`;
    if (!fs.existsSync(generatedSourcesDir)) {
        // Ensure output dir exists
        this.logger.debug(LOG_TAG, `Contracts directory ${generatedSourcesDir} does not existing, creating...`);
        fs.mkdirSync(generatedSourcesDir);
    }

    for (const definition of generatedContractDefinitions) {
        // Write each definition to file
        let contractWrapper = {
            contract: {
                request: definition.request.clean(),
                response: definition.response.clean()
            }
        }
        let contractYaml = yaml.safeDump(contractWrapper);
        await helper.writeFile(`${this.contractsDirectory}/generated/${definition.name}.yaml`, contractYaml);
    }
    // TODO: Write all generated contract definitions to file
};

module.exports = ContractPolice;
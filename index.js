const ContractParser = require("./src/parsing/contractparser.js");
const TestRunner = require("./src/testrunner.js");
const ContractValidator = require("./src/validation/validator.js");
const ContractPoliceReporter = require("./src/reporting/contractpolicereporter.js");
const JUnitReporter = require("./src/reporting/junitreporter.js");
const fs = require('fs');
const Logging = require("./src/logging/logging.js");

const LOG_TAG = "ContractPolice"
const defaultConfig = {
    customValidationRules: [],
    failOnError: true,
    reportOutputDir: "/contractpolice/build",
    reporter: "default",
    enableAppLogsConsole: false,
    enableAppLogsFile: false,
    loglevel: "warn"
};

initializeConfig = function (logger, targetConfig, inputConfig) {
    targetConfig['customValidationRules']    = inputConfig.customValidationRules || defaultConfig.customValidationRules;
    targetConfig['failOnError']              = inputConfig.failOnError || defaultConfig.failOnError;
    targetConfig['reporter']                 = inputConfig.reporter || defaultConfig.reporter;
    targetConfig['reportOutputDir']          = inputConfig.reportOutputDir || defaultConfig.reportOutputDir;
    targetConfig['enableAppLogsConsole']     = inputConfig.enableAppLogsConsole || defaultConfig.enableAppLogsConsole;
    targetConfig['enableAppLogsFile']        = inputConfig.enableAppLogsFile || defaultConfig.enableAppLogsFile;
    targetConfig['loglevel']                 = inputConfig.loglevel || defaultConfig.loglevel;

    if(!['error', 'warn', 'info', 'debug'].includes(inputConfig.loglevel)) {
        targetConfig.loglevel = defaultConfig.loglevel;
        logger.log(LOG_TAG, "warn", `Loglevel '${inputConfig.loglevel}' is not supported. Defaulting to '${defaultConfig.loglevel}' loglevel.`);
    }

    if(!["default", "junit"].includes(targetConfig.reporter)) {
        targetConfig.reporter = defaultConfig.reporter;
        logger.log(LOG_TAG, "warn", `Reporter '${inputConfig.reporter}' is not supported. Defaulting to '${defaultConfig.reporter}' reporter.`);
    }
}

function ContractPolice(contractsDirectory, endpoint, userConfig = {}) {
    let loglevel = userConfig.loglevel || defaultConfig.loglevel;
    if(!['error', 'warn', 'info', 'debug'].includes(loglevel)) {
        loglevel = defaultConfig.loglevel;
    }
    this.logger = new Logging(
        loglevel,
        userConfig.enableAppLogsConsole || defaultConfig.enableAppLogsConsole,
        userConfig.enableAppLogsFile || defaultConfig.enableAppLogsFile
    );

    if(contractsDirectory === null || contractsDirectory === undefined) {
        this.logger.log(LOG_TAG, "error", "Required parameter 'contractsDirectory' not found. Please provide the directory where contracts are stored.");
        throw Error("Required parameter 'contractsDirectory' not found.");
    }
    if(endpoint === null || endpoint === undefined) {
        this.logger.log(LOG_TAG, "error", "Required parameter 'endpoint' not found. Please provide the endpoint that will be placed under test.");
        throw Error(`Required parameter 'endpoint' not found.`);
    }
    this.contractsDirectory = contractsDirectory;
    this.endpoint = endpoint;

    this.config = {};
    initializeConfig(this.logger, this.config, userConfig);
}

ContractPolice.prototype.testContracts = function() {
    const endpoint = this.endpoint;
    const validationRules = this.config.customValidationRules;
    const failOnError = this.config.failOnError;
    const reportOutputDir = this.config.reportOutputDir;
    const reporterType = this.config.reporter;
    const contractsDirectory = this.contractsDirectory;
    const logger = this.logger;

    logger.log(LOG_TAG, "info", "Start contract test(s) with ContractPolice");

    let contractParser = new ContractParser(logger);

    return contractParser
        .findYamlFiles(contractsDirectory)
        .then(function(filesArray){
            // Collect all contracts from YAML files
            let contracts = [];
            // TODO: map?
            filesArray.forEach(function(yamlFile) {
                let contractMeta = contractParser.parseContract(contractsDirectory, yamlFile);
                contracts.push(contractMeta);
            });
            return contracts;
        })
        .then(function (contracts) {
            // Compose test runs
            let tests = [];
            contracts.forEach(function(contractMeta) {
                let contract = contractMeta.data;
                let validator = new ContractValidator(logger, contract.response, validationRules);
                let runner = new TestRunner(logger, contractMeta.name, contract.request, endpoint, validator);
                logger.info(LOG_TAG, `Created TestRunner for "${contractMeta.name}" Contract Definition`);
                tests.push(runner);
            });
            return tests;
        })
        .then(function(testRunners) {
            // Run all tests
            logger.info(LOG_TAG, "Running contract tests...");
            let testRuns = testRunners.map(it => it.runTest());
            return Promise.all(testRuns);
        })
        .then(function(testResults) {
            // Prepare reporter
            logger.info(LOG_TAG, "Contract tests completed. Gathering reports...");
            let reporter = new ContractPoliceReporter(reportOutputDir);
            if(reporterType === "junit") {
                reporter = new JUnitReporter(reportOutputDir);
            }
            // Ensure output dir exists
            if(!fs.existsSync(reportOutputDir)) {
                logger.debug(LOG_TAG, `Output directory ${reportOutputDir} does not existing, creating...`);
                fs.mkdirSync(reportOutputDir);
            }
            // Collect execution report and pass on
            return {
                testReporter: reporter,
                timestamp: new Date().getTime(),
                results: testResults,
                runSuccess: !(testResults.map(it => it.result).includes("FAIL"))
            }
        })
        .then(function(executionReport) {
            // Write test report & application logs
            logger.info(LOG_TAG, "Writing contract test report...")
            return executionReport.testReporter
                .writeTestReport(executionReport.results, executionReport.timestamp)
                .then(function() {
                    logger.log(LOG_TAG, "info", "Contract test report written to file")
                    return executionReport;
                })
        })
        .then(function(executionReport) {
            // Write logs if applicable
            if(logger.fileEnabled) {
                logger.debug(LOG_TAG, "Writing logs to file");
            } else {
                logger.debug(LOG_TAG, "Skipped writing logs to file");
            }
            return logger
                .writeLogs(reportOutputDir, executionReport.timestamp)
                .then(function() {
                    if(logger.fileEnabled) {
                        logger.debug(LOG_TAG, "Contract testing logs written to file");
                    }
                    return executionReport;
                });
        })
        .then(function(executionReport) {
            // Finish execution
            const logEnd = executionReport.runSuccess ? "successfully!" : "with violations and/or errors!"
            const message = "ContractPolice finished contract testing " + logEnd;
            logger.log(LOG_TAG, "info", message)
            // Throw error on failure to influence process exit code
            if(!executionReport.runSuccess && failOnError) {
                logger.debug(LOG_TAG, "Quitting with error for runner's awareness");
                throw Error(message)
            }
        });
};

module.exports = ContractPolice;
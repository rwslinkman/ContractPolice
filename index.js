const ContractParser = require("./src/contractparser.js");
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
    const logger = this.logger;

    logger.log(LOG_TAG, "info", "Start contract test(s) with ContractPolice");

    let contractParser = new ContractParser(logger);
    return contractParser
        .findContractFiles(this.contractsDirectory)
        .then(function(filesArray){
            // Collect all contracts from YAML files
            let contracts = [];
            filesArray.forEach(function(contractFile) {
                let contract = contractParser.parseContract(contractFile);
                let contractName = contractParser.extractContractName(contractFile, false);
                let contractMeta = {
                    name: contractName,
                    data: contract
                };
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
                tests.push(runner);
            });
            return tests;
        })
        .then(function(testRunners) {
            // Run all tests
            let testRuns = testRunners.map(it => it.runTest());
            return Promise.all(testRuns);
        })
        .then(function(testResults) {
            // Prepare reporter
            let reporter = new ContractPoliceReporter(reportOutputDir);
            if(reporterType === "junit") {
                reporter = new JUnitReporter(reportOutputDir);
            }
            // Ensure output dir exists
            if(!fs.existsSync(reportOutputDir)) {
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
            return executionReport.testReporter
                .writeTestReport(executionReport.results, executionReport.timestamp)
                .then(function() {
                    logger.log(LOG_TAG, "info", "Contract test report written to file")
                    return executionReport;
                })
        })
        .then(function(executionReport) {
            // Finish execution
            const logEnd = executionReport.runSuccess ? "successfully!" : "with violations and/or errors!"
            const message = "ContractPolice finished contract testing " + logEnd;
            logger.log(LOG_TAG, "info", message)
            logger.writeLogs(reportOutputDir)
            // Throw error on failure to influence process exit code
            if(!executionReport.runSuccess && failOnError) {
                throw Error(message)
            }
        });
};

module.exports = ContractPolice;
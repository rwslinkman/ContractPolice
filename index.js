const ContractParser = require("./src/contractparser.js");
const TestRunner = require("./src/testrunner.js");
const ContractValidator = require("./src/validation/validator.js");
const ContractPoliceReporter = require("./src/reporting/contractpolicereporter.js");
const JUnitReporter = require("./src/reporting/junitreporter.js");
const fs = require('fs');
const Logging = require("./src/logging/logging.js");

const LOG_TAG = "ContractPolice"
const defaultConfig = {
    excludes: [],
    customValidationRules: [],
    failOnError: true,
    reportOutputDir: "/contractpolice/build",
    reporter: "default",
    enableAppLogs: false
};

function ContractPolice(contractsDirectory, endpoint, config = {}) {
    if(contractsDirectory === null || contractsDirectory === undefined) {
        throw Error(`Please provide the directory where contracts are stored`);
    }
    if(endpoint === null || endpoint === undefined) {
        throw Error(`Please provide the endpoint that will be placed under test`);
    }

    this.contractsDirectory = contractsDirectory;
    this.endpoint = endpoint;
    this.config = {};
    this.config['customValidationRules']    = config.customValidationRules || defaultConfig.customValidationRules;
    this.config['failOnError']              = config.failOnError || defaultConfig.failOnError;
    this.config['reporter']                 = config.reporter || defaultConfig.reporter;
    this.config['reportOutputDir']          = config.reportOutputDir || defaultConfig.reportOutputDir;
    this.config['enableAppLogs']            = config.enableAppLogs || defaultConfig.enableAppLogs;

    if(!["default", "junit"].includes(this.config.reporter)) {
        this.config.reporter = "default"
    }
}

ContractPolice.prototype.testContracts = function() {
    const endpoint = this.endpoint;
    const validationRules = this.config.customValidationRules;
    const failOnError = this.config.failOnError;
    const reportOutputDir = this.config.reportOutputDir;
    const reporterType = this.config.reporter;
    const logger = new Logging(this.config.enableAppLogs);

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
                    logger.log(LOG_TAG, "INFO", "Contract test written to file")
                    return executionReport;
                })
        })
        .then(function(executionReport) {
            // Finish execution
            const logEnd = executionReport.runSuccess ? "successfully!" : "with violations and/or errors!"
            logger.log(LOG_TAG, "INFO", "ContractPolice finished contract testing " + logEnd)
            logger.writeLogs(reportOutputDir)
            // Throw error on failure to influence process exit code
            if(!executionReport.runSuccess && failOnError) {
                throw "ContractPolice contract test execution has completed with violations!"
            }
        });
};

module.exports = ContractPolice;
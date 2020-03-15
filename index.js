const ContractParser = require("./src/contractparser.js");
const TestRunner = require("./src/testrunner.js");
const ContractValidator = require("./src/validation/validator.js");
const TestReporter = require("./src/report/reporter.js");

const defaultConfig = {
    endpoint: "http://127.0.0.1:8080",
    excludes: [],
    customValidationRules: [],
    failOnError: true,
    reportOutputDir: "build"
};

function ContractPolice(contractsDirectory, config) {
    this.contractsDirectory = contractsDirectory;
    this.config = {};
    this.config['endpoint']                 = config.endpoint || defaultConfig.endpoint;
    this.config['customValidationRules']    = config.customValidationRules || defaultConfig.customValidationRules;
    this.config['failOnError']              = config.failOnError || defaultConfig.failOnError;
    this.config['reportOutputDir']          = config.reportOutputDir || defaultConfig.reportOutputDir;
}

ContractPolice.prototype.testContracts = function() {
    const endpoint = this.config.endpoint;
    const validationRules = this.config.customValidationRules;
    const failOnError = this.config.failOnError;
    const reportOutputDir = this.config.reportOutputDir;

    let contractParser = new ContractParser();
    return contractParser
        .findContractFiles(this.contractsDirectory)
        .then(function(filesArray){
            // Collect all contracts from YAML files
            let contracts = [];
            filesArray.forEach(function(contractFile) {
                let contract = contractParser.parseContract(contractFile);
                let contractName = contractParser.extractContractName(contractFile, false);
                contracts.push({
                    name: contractName,
                    data: contract
                });
            });
            return contracts;
        })
        .then(function (contracts) {
            // Compose test runs
            let tests = [];
            contracts.forEach(function(contractMeta) {
                let contract = contractMeta.data;
                let validator = new ContractValidator(contract.response, validationRules);
                let runner = new TestRunner(contractMeta.name, contract.request, endpoint, validator);
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
            // Process test results
            let reporter = new TestReporter(process.cwd(), reportOutputDir);
            return reporter
                .writeTestReport(testResults)
                .then(function() {
                    // Finish execution
                    let testOutcomes = testResults.map(it => it.result);
                    if(testOutcomes.includes("FAIL") && failOnError) {
                        throw "ContractPolice contract test execution has completed with violations!"
                    }
                });
        });
};

module.exports = ContractPolice;
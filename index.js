const ContractParser = require("./src/contractparser.js");
const TestRunner = require("./src/testrunner.js");

const defaultConfig = {
    endpoint: "http://127.0.0.1:8080",
    excludes: []
};

function ContractPolice(contractsDirectory, config) {
    this.contractsDirectory = contractsDirectory;
    this.config = {};
    this.config['endpoint'] = config.endpoint || defaultConfig.endpoint;

    console.log("Endpoint: " + this.config.endpoint);
}

ContractPolice.prototype.testContracts = function() {
    const endpoint = this.config.endpoint;

    let contractParser = new ContractParser();
    return contractParser
        .findContractFiles(this.contractsDirectory)
        .then(function(filesArray){
            // Collect all contracts from YAML files
            let contracts = [];
            filesArray.forEach(function(contractFile) {
                let contract = contractParser.parseContract(contractFile);
                let contractName = contractParser.extractContractName(contractFile);
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
            contracts.forEach(function(contract) {
                let runner = new TestRunner(contract.name, contract.data, endpoint);
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
            console.log(testResults);
        });
};

module.exports = ContractPolice;
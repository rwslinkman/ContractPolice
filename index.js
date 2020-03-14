let ContractParser = require("./src/contractparser.js");

const defaultConfig = {
    endpoint: "http://127.0.0.1:8080",
    excludes: []
};

function ContractPolice(contractsDirectory, config) {
    this.contractsDirectory = contractsDirectory;
    this.config = {};
    this.config['endpoint'] = config.endpoint || defaultConfig.endpoint;
}

ContractPolice.prototype.verifyContracts = function() {
        console.log("Endpoint: " + this.config.endpoint);
        console.log("Excluding files: " + this.config.excludes);

        let contractParser = new ContractParser();
        return contractParser
            .findContractFiles(this.contractsDirectory)
            .then(function(filesArray){
                let contracts = [];
                filesArray.forEach(function(contractFile) {
                    let contract = contractParser.parseContract(contractFile);
                    contracts.push(contract);
                });
                return contracts
            })
            .then(function (contracts) {
                console.log("Contracts:");
                contracts.forEach(function(contract) {
                    console.log(contract);
                })
            });
};

module.exports = ContractPolice;
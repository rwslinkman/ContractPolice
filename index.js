let ContractParser = require("./src/contractparser.js");

const defaultConfig = {
    endpoint: "http://127.0.0.1:8080",
    excludes: []
};

function ContractPolice(contractsDirectory, config) {
    this.contractsDirectory = contractsDirectory;
    this.config = {};
    this.config['endpoint'] = config.endpoint || defaultConfig.endpoint;
    this.config['excludes'] = config.excludes || defaultConfig.excludes;
}

ContractPolice.prototype.verifyContracts = function() {
        console.log(this.config.endpoint);
        console.log(this.config.excludes);
        let contractParser = new ContractParser();
        return contractParser
            .findContractFiles(this.contractsDirectory)
            .then(function(filesArray){
                // console.log(filesArray);
                return filesArray.forEach(function(contractFile) {
                    console.log(contractFile);
                });
            })
            .catch(function(err) {
                console.error(err);
            });
};

module.exports = ContractPolice;
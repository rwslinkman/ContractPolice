let ContractPolice = require("./index.js");

let config = {
    endpoint: "http://localhost:3000",
    reportOutputDir: "report"
};
let contractPolice = new ContractPolice("contracts", config);

console.log("Start contract test(s) with ContractPolice");
contractPolice.testContracts()
    .then(function() {
        console.log("ContractPolice successfully finished executing contract tests");
    })
    .catch(function(err) {
        // TODO: Verify if this is the correct way to crash (if yes, move to ContractPolice)
        console.error(err);
        return process.exit(1);
    });
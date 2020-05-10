let ContractPolice = require("./index.js");

let config = {
    reportOutputDir: "report"
};
let contractPolice = new ContractPolice("contracts", "http://localhost:3000", config);

console.log("Start contract test(s) with ContractPolice");
contractPolice.testContracts()
    .then(function() {
        console.log("ContractPolice successfully finished executing contract tests");
        process.exitCode = 0; // success
    })
    .catch(function(err) {
        console.error(err);
        process.exitCode = 1; // failure
    });
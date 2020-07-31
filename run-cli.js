const ContractPolice = require("./index.js");

// Input
const config = {
    reportOutputDir: "report",
    // reporter: "junit",
    enableAppLogsConsole: true,
    enableAppLogsFile: false,
    loglevel: "info"
};
const contractsDirectory = "contracts";
const testTarget = "http://localhost:3000";

// Execution
console.log("Start contract test(s) with ContractPolice");
const contractPolice = new ContractPolice(contractsDirectory, testTarget, config);
contractPolice
    .generateContractTest()
    .then(function() {
        return contractPolice.testContracts()
    })
    .then(function() {
        // Successful test, no errors found
        console.log("ContractPolice successfully finished executing contract tests");
        process.exitCode = 0; // success
    })
    .catch(function(err) {
        // Show output of contract test
        console.error(err.message);
        process.exitCode = 1; // failure
    });
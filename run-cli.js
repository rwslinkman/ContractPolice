let ContractPolice = require("./index.js");

let config = {
    reportOutputDir: "report",
    // reporter: "junit",
    enableAppLogsConsole: true,
    enableAppLogsFile: true,
    loglevel: "info"
};

let contractPolice = new ContractPolice("contracts", "http://localhost:3000", config);
console.log("Start contract test(s) with ContractPolice");
contractPolice.testContracts()
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
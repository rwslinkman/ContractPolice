let ContractPolice = require("./index.js");

// Define used variables used by ContractPolice, injected by Docker
const targetUrl = process.env.CP_TARGET;
const contractsDirectory = "/contractpolice/ci-contracts";
const outputsDirectory = "/contractpolice/outputs";
const configFailOnError = (process.env.CP_FAIL_ON_ERROR !== "false");
const configReporter = (process.env.CP_REPORTER === "junit") ? "junit" : "default";
const configAppLogs = (process.env.CP_REPORT_LOGS_ENABLED === "true");

// Gather injected config into single object
let config = {
    reportOutputDir: outputsDirectory,
    failOnError: configFailOnError,
    reporter: configReporter,
    enableAppLogs: configAppLogs
};

let contractPolice = new ContractPolice(contractsDirectory, targetUrl, config);
console.log("Start contract test(s) with ContractPolice");
contractPolice.testContracts()
    .then(function() {
        // Successful test, no errors found
        console.log("ContractPolice successfully finished executing contract tests");
        process.exitCode = 0; // success
    })
    .catch(function(err) {
        // Show output of contract test
        console.error(err);
        process.exitCode = 1; // failure
    });
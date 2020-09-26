let ContractPolice = require("./index.js");

// Define used variables used by ContractPolice, injected by Docker
const targetUrl = process.env.CP_TARGET;
const contractsDirectory = "/contractpolice/ci-contracts";
const generatorSourceDir = "/contractpolice/generator";
const outputsDirectory = "/contractpolice/outputs";
const configFailOnError = (process.env.CP_FAIL_ON_ERROR !== "false");
const configReporter = (process.env.CP_REPORTER === "junit") ? "junit" : "default";
const configAppLogsFile = (process.env.CP_LOGS_FILE_ENABLED === "true");
const configAppLogsConsole = (process.env.CP_LOGS_CONSOLE_ENABLED === "true");
const configAppLogsLevel = (process.env.CP_LOGS_LEVEL === undefined) ? "warn" : process.env.CP_LOGS_LEVEL;

// Gather injected config into single object
let config = {
    contractDefinitionsDir: contractsDirectory,
    generatorSourceDir: generatorSourceDir,
    reportOutputDir: outputsDirectory,
    failOnError: configFailOnError,
    reporter: configReporter,
    enableAppLogsFile: configAppLogsFile,
    enableAppLogsConsole: configAppLogsConsole,
    loglevel: configAppLogsLevel
};

(async () => {
    try {
        // Execution
        console.log("Contract Police - Contract testing utility");
        const contractPolice = new ContractPolice(targetUrl, config);

        console.log("Generating contract test definitions (if applicable)...");
        await contractPolice.generateContractTests();

        console.log("Starting contract test execution with ContractPolice");
        await contractPolice.testContracts();

        // Successful test, no errors found
        console.log("ContractPolice successfully finished executing contract tests");
        process.exitCode = 0; // success
    } catch (err) {
        // Show output of contract test
        console.error(err.message);
        process.exitCode = 1; // failure
    }
})();
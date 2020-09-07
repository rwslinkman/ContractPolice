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

(async () => {
    try {
        // Execution
        const contractPolice = new ContractPolice(contractsDirectory, testTarget, config);
        await contractPolice.generateContractTests();
        console.log("Start contract test(s) with ContractPolice");
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
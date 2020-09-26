const ContractPolice = require("./index.js");

// Input
const config = {
    contractDefinitionsDir: "contracts",
    generatorSourceDir: "openapi",
    reportOutputDir: "report",
    // reporter: "junit",
    enableAppLogsConsole: true,
    enableAppLogsFile: false,
    loglevel: "info"
};
const testTarget = "http://localhost:3000";

(async () => {
    try {
        const contractPolice = new ContractPolice(testTarget, config);
        await contractPolice.generateContractTests();
        await contractPolice.testContracts();
        process.exitCode = 0; // success
    } catch (err) {
        // Show output of contract test
        console.error(err.message);
        process.exitCode = 1; // failure
    }
})();
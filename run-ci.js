let ContractPolice = require("./index.js");

const env = process.env;
console.log(env);
// TODO: Get config from ENV
const contractsDirectory = "/contractpolice/ci-contracts";
const targetUrl = process.env.CP_TARGET;
let config = {
    reportOutputDir: "outputs"
};
let contractPolice = new ContractPolice(contractsDirectory, targetUrl, config);

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
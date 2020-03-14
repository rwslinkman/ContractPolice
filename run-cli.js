let ContractPolice = require("./index.js");

let config = {
    endpoint: "http://localhost:3000"
};
let contractPolice = new ContractPolice("contracts", config);

console.log("Start contract test(s) with ContractPolice");
contractPolice.testContracts()
    .then(function() {
        console.log("ContractPolice finished executing contract tests");
    })
    .catch(function(err) {
        console.error("ContractPolice finished with an error!");
        console.error(err);
    });
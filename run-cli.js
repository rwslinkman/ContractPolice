let ContractPolice = require("./index.js");

let config = {
    endpoint: "localhost:3000"
};
let police = new ContractPolice("contracts", config);

console.log("Start contract test(s) with ContractPolice");
police.verifyContracts()
    .then(function() {
        console.log("ContractPolice finished executing contract tests");
    })
    .catch(function(err) {
        console.error("ContractPolice finished with an error!");
        console.error(err);
    });
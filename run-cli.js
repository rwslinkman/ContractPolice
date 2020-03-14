let ContractPolice = require("./index.js");

let config = {
    endpoint: "localhost:3000"
};
let police = new ContractPolice("contracts", config);
police.verifyContracts();
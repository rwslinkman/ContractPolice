const expect = require("chai").expect;
const ContractPolice = require("../index.js");

describe("ContractPolice", () => {
    it("should accept a directory parameter and a webserver parameter", () => {
        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");
        expect(contractPolice).to.not.be.null;
    });

    it("should throw an exception when directory parameter is null", () => {
        const contractPolice = new ContractPolice(null, "http://someserver.com");
        expect(contractPolice).to.throw();
    });

    it("should throw an exception when webserver parameter is null", () => {
        const contractPolice = new ContractPolice("some/directory");
        expect(contractPolice).to.throw();
    })
});

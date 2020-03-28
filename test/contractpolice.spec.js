const expect = require("chai").expect;
const ContractPolice = require("../index.js");

describe("ContractPolice", () => {
    it("should accept a directory parameter and a endpoint parameter", () => {
        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
    });

    it("should throw an exception when directory parameter is null", () => {
        expect(() =>  new ContractPolice(null, "http://someserver.com")).to.throw();
    });

    it("should throw an exception when endpoint parameter is null", () => {
        expect(() => new ContractPolice("some/directory")).to.throw();
    })
});

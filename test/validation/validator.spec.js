const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");

chai.use(chaiAsPromised);
let expect = chai.expect;

const ContractValidator = require("../../src/validation/validator.js");

describe("ContractValidator", () => {
    it("should return an empty violation report when given two equal responses", () => {
        const contractResponse = {
            statusCode: 200
        };
        const serverResponse = {
            statusCode: 200
        };
        const validator = new ContractValidator(contractResponse);

        const result = validator.validate(serverResponse);

        // console.log(result);
        expect(result).to.eventually.be.fulfilled;
        return result.then(function(violationReport) {
            console.log(violationReport);
            expect(violationReport.hasViolations()).to.equal(false);
            expect(violationReport.violations).to.be.empty;
        })
    });
});
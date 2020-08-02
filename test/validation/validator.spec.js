const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");
const Logging = require("../../src/logging/logging.js");

chai.use(chaiAsPromised);
let expect = chai.expect;

const ContractValidator = require("../../src/validation/validator.js");

describe("ContractValidator", () => {
    const testLogger = new Logging(false);

    it("should return an empty violation report when given two equal minimal responses", async () => {
        const contractResponse = {
            statusCode: 200
        };
        const serverResponse = {
            statusCode: 200
        };
        const validator = new ContractValidator(testLogger, contractResponse);

        const result = await validator.validate(serverResponse);
        expect(result.hasViolations()).to.equal(false);
        expect(result.violations).to.be.empty;
    });

    it("should return an empty violation report when given two equal basic responses", async () => {
        const contractResponse = {
            statusCode: 200,
            body: {
                someKey: "someValue"
            }
        };
        const serverResponse = {
            statusCode: 200,
            body: {
                someKey: "someValue"
            }
        };
        const validator = new ContractValidator(testLogger, contractResponse);

        const result = await validator.validate(serverResponse);

        expect(result.hasViolations()).to.equal(false);
        expect(result.violations).to.be.empty;
    });

    it("should return an empty violation report when given two equal extensive responses", async () => {
        const contractResponse = {
            statusCode: 200,
            body: {
                someKey: "someValue"
            },
            headers: [
                { "Content-Type": "application/json" },
                { "Accept": "application/json" }
            ]
        };
        const serverResponse = {
            statusCode: 200,
            body: {
                someKey: "someValue"
            },
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };
        const validator = new ContractValidator(testLogger, contractResponse);

        const result = await validator.validate(serverResponse);

        expect(result.hasViolations()).to.equal(false);
        expect(result.violations).to.be.empty;
    });

    it("should return a violation report when server responded with different statsuCode", async () => {
        const contractResponse = {
            statusCode: 200
        };
        const serverResponse = {
            statusCode: 404
        };
        const validator = new ContractValidator(testLogger, contractResponse);

        const result = await validator.validate(serverResponse);

        expect(result.hasViolations()).to.equal(true);
        expect(result.violations).to.have.length(1);

        const violation = result.violations[0];
        expect(violation).to.not.be.null;
        expect(violation.key).to.equal("statusCode");
        expect(violation.expected).to.equal(200);
        expect(violation.actual).to.equal(404);
    });

    it("should return a violation when response's body type is not expected", async () => {
        const contractResponse = {
            statusCode: 200,
            body: {
                someKey: "someValue"
            }
        };
        const serverResponse = {
            statusCode: 200,
            body: "stringBodyType"
        };
        const validator = new ContractValidator(testLogger, contractResponse);

        const result = await validator.validate(serverResponse);

        expect(result.hasViolations()).to.equal(true);
        expect(result.violations).to.have.length(1);

        const violation = result.violations[0];
        expect(violation).to.not.be.null;
        expect(violation.key).to.equal("type of 'body'");
        expect(violation.expected).to.equal("object");
        expect(violation.actual).to.equal("string");
    });
});
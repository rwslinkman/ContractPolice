const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");

chai.use(chaiAsPromised);
let expect = chai.expect;

const TestOutcome = require("../src/testoutcome.js");
const ContractPolice = rewire("../index.js");

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
    });

    it('should resolve a successful promise when given valid input and tests are passing', () => {
        let parserMock = function() { // constructor returns object with functions
            return {
                findContractFiles: function (directory) {
                    expect(directory).to.equal("some/directory");
                    return Promise.resolve(["/some/path/to/my-contract.yaml"]);
                },
                parseContract: function(contractFile) {
                    return Promise.resolve({
                        request: {
                            path: "/some/path"
                        },
                        response: {
                            statuscode: 200
                        }
                    });
                },
                extractContractName: function(contractFile, stripExtension) {
                    return "my-contract";
                }
            }
        };
        let testRunnerMock = function(contractName, contractRequest, endpoint, validator) { // constructor returns object with functions
            return {
                runTest: function() {
                    return new TestOutcome("my-contract", "Tests were executed", "PASS")
                }
            }
        };
        let reporterMock = function(currentDir, outputDir) { // constructor returns object with functions
            return {
                writeTestReport: function(testResults) {
                    return Promise.resolve();
                }
            }
        };
        // Injection
        ContractPolice.__set__({
            "ContractParser": parserMock,
            "TestRunner": testRunnerMock,
            "TestReporter": reporterMock
        });

        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");

        return expect(contractPolice.testContracts()).to.eventually.be.fulfilled;
    });

    it('should resolve a successful promise when given valid input and tests are failing', () => {
        let parserMock = function() { // constructor returns object with functions
            return {
                findContractFiles: function (directory) {
                    expect(directory).to.equal("some/directory");
                    return Promise.resolve(["/some/path/to/my-contract.yaml"]);
                },
                parseContract: function(contractFile) {
                    return Promise.resolve({
                        request: {
                            path: "/some/path"
                        },
                        response: {
                            statuscode: 200
                        }
                    });
                },
                extractContractName: function(contractFile, stripExtension) {
                    return "my-contract";
                }
            }
        };
        let testRunnerMock = function(contractName, contractRequest, endpoint, validator) { // constructor returns object with functions
            return {
                runTest: function() {
                    return new TestOutcome("my-contract", "Tests were executed", "FAIL")
                }
            }
        };
        let reporterMock = function(currentDir, outputDir) { // constructor returns object with functions
            return {
                writeTestReport: function(testResults) {
                    return Promise.resolve();
                }
            }
        };
        // Injection
        ContractPolice.__set__({
            "ContractParser": parserMock,
            "TestRunner": testRunnerMock,
            "TestReporter": reporterMock
        });

        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");

        return expect(contractPolice.testContracts()).to.eventually.be.rejectedWith("ContractPolice contract test execution has completed with violations!");
    })
});

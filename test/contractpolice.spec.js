const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");
const sinon = require("sinon");

chai.use(chaiAsPromised);
const expect = chai.expect;
const stub = sinon.stub;

const TestOutcome = require("../src/testoutcome.js");
const ContractPoliceReporter = require("../src/reporting/contractpolicereporter.js");
const JUnitReporter = require("../src/reporting/junitreporter.js");
// Subject
const ContractPolice = rewire("../index.js");

describe("ContractPolice", () => {
    function mockFileSystem(outputDirExists) {
        return {
            existsSync: function (dir) {
                return outputDirExists;
            },
            mkdirSync: function(dir) {
                // nop
            }
        };
    }

    it("should accept a directory parameter and a endpoint parameter", () => {
        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("default");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
    });

    it("should throw an exception when directory parameter is null", () => {
        expect(() =>  new ContractPolice(null, "http://someserver.com")).to.throw("Please provide the directory where contracts are stored");
    });

    it("should throw an exception when endpoint parameter is null", () => {
        expect(() => new ContractPolice("some/directory")).to.throw("Please provide the endpoint that will be placed under test");
    });

    it("should accept the parameters when config.reporter is 'default'", () => {
        const options = {
            reporter: "default"
        };
        const contractPolice = new ContractPolice("some/directory", "http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("default");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
    });

    it("should accept the parameters when config.reporter is 'junit'", () => {
        const options = {
            reporter: "junit"
        };
        const contractPolice = new ContractPolice("some/directory", "http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("junit");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
    });

    it("should fallback to default when config.reporter is not supported", () => {
        const options = {
            reporter: "somethingElse"
        };
        const contractPolice = new ContractPolice("some/directory", "http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("default");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
    });

    it('should resolve a successful promise when given valid input, outputDir exists and tests are passing', () => {
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
        const cprStub = stub().returns(Promise.resolve());
        const cpReporter = function() {
            return {
                writeTestReport: cprStub
            }
        };
        const junitStub = stub().returns(Promise.resolve());
        const junitReporter = function() {
            return {
                writeTestReport: junitStub
            }
        };
        // Injection
        ContractPolice.__set__({
            "ContractParser": parserMock,
            "TestRunner": testRunnerMock,
            "ContractPoliceReporter": cpReporter,
            "JUnitReporter": junitReporter,
            "fs": mockFileSystem(true)
        });

        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");

        return expect(contractPolice.testContracts())
            .to.eventually.be.fulfilled
            .then(function () {
                expect(cprStub.called).to.equal(true);
                expect(junitStub.called).to.equal(false);
            });
    });

    it('should resolve a successful promise when given valid input, outputDir does not exist and tests are passing', () => {
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
        const cprStub = stub().returns(Promise.resolve());
        const cpReporter = function() {
            return {
                writeTestReport: cprStub
            }
        };
        const junitStub = stub().returns(Promise.resolve());
        const junitReporter = function() {
            return {
                writeTestReport: junitStub
            }
        };
        // Injection
        ContractPolice.__set__({
            "ContractParser": parserMock,
            "TestRunner": testRunnerMock,
            "ContractPoliceReporter": cpReporter,
            "JUnitReporter": junitReporter,
            "fs": mockFileSystem(false)
        });

        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");

        return expect(contractPolice.testContracts())
            .to.eventually.be.fulfilled
            .then(function () {
                expect(cprStub.called).to.equal(true);
                expect(junitStub.called).to.equal(false);
            });
    });

    it('should resolve a successful promise when given valid input, tests are passing, outputDir exists and junit reporter is configured', () => {
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
        const cprStub = stub().returns(Promise.resolve());
        const cpReporter = function() {
            return {
                writeTestReport: cprStub
            }
        };
        const junitStub = stub().returns(Promise.resolve());
        const junitReporter = function() {
            return {
                writeTestReport: junitStub
            }
        };

        // Injection
        ContractPolice.__set__({
            "ContractParser": parserMock,
            "TestRunner": testRunnerMock,
            "ContractPoliceReporter": cpReporter,
            "JUnitReporter": junitReporter,
            "fs": mockFileSystem(true)
        });

        const config = {
            reporter: "junit"
        };
        const contractPolice = new ContractPolice("some/directory", "http://someserver.com", config);

        return expect(contractPolice.testContracts())
            .to.eventually.be.fulfilled
            .then(function () {
                expect(cprStub.called).to.equal(false);
                expect(junitStub.called).to.equal(true);
        });
    });

    it('should resolve a successful promise when given valid input, tests are passing, outputDir does not exist and junit reporter is configured', () => {
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
        const cprStub = stub().returns(Promise.resolve());
        const cpReporter = function() {
            return {
                writeTestReport: cprStub
            }
        };
        const junitStub = stub().returns(Promise.resolve());
        const junitReporter = function() {
            return {
                writeTestReport: junitStub
            }
        };

        // Injection
        ContractPolice.__set__({
            "ContractParser": parserMock,
            "TestRunner": testRunnerMock,
            "ContractPoliceReporter": cpReporter,
            "JUnitReporter": junitReporter,
            "fs": mockFileSystem(false)
        });

        const config = {
            reporter: "junit"
        };
        const contractPolice = new ContractPolice("some/directory", "http://someserver.com", config);

        return expect(contractPolice.testContracts())
            .to.eventually.be.fulfilled
            .then(function () {
                expect(cprStub.called).to.equal(false);
                expect(junitStub.called).to.equal(true);
            });
    });

    it('should resolve a successful promise when given valid input, outputDir exists and tests are failing', () => {
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
        const cprStub = stub().returns(Promise.resolve());
        const cpReporter = function() {
            return {
                writeTestReport: cprStub
            }
        };
        const junitStub = stub().returns(Promise.resolve());
        const junitReporter = function() {
            return {
                writeTestReport: junitStub
            }
        };
        // Injection
        ContractPolice.__set__({
            "ContractParser": parserMock,
            "TestRunner": testRunnerMock,
            "ContractPoliceReporter": cpReporter,
            "JUnitReporter": junitReporter,
            "fs": mockFileSystem(true)
        });

        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");

        return expect(contractPolice.testContracts())
            .to.eventually.be.rejectedWith("ContractPolice contract test execution has completed with violations!")
            .then(function () {
                expect(cprStub.called).to.equal(true);
                expect(junitStub.called).to.equal(false);
            });
    });

    it('should resolve a successful promise when given valid input, outputDir does not exist and tests are failing', () => {
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
        const cprStub = stub().returns(Promise.resolve());
        const cpReporter = function() {
            return {
                writeTestReport: cprStub
            }
        };
        const junitStub = stub().returns(Promise.resolve());
        const junitReporter = function() {
            return {
                writeTestReport: junitStub
            }
        };
        // Injection
        ContractPolice.__set__({
            "ContractParser": parserMock,
            "TestRunner": testRunnerMock,
            "ContractPoliceReporter": cpReporter,
            "JUnitReporter": junitReporter,
            "fs": mockFileSystem(false)
        });

        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");


        return expect(contractPolice.testContracts())
            .to.eventually.be.rejectedWith("ContractPolice contract test execution has completed with violations!")
            .then(function () {
                expect(cprStub.called).to.equal(true);
                expect(junitStub.called).to.equal(false);
            });
    });
});

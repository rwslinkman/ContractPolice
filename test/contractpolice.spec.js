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

    //region Tests to setup and config of ContractPolice
    it("should accept a directory parameter and a endpoint parameter", () => {
        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("default");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
    });

    it("should throw an exception when directory parameter is null", () => {
        expect(() =>  new ContractPolice(null, "http://someserver.com")).to.throw("Required parameter 'contractsDirectory' not found.");
    });

    it("should throw an exception when endpoint parameter is null", () => {
        expect(() => new ContractPolice("some/directory")).to.throw("Required parameter 'endpoint' not found.");
    });

    it("should fallback to defaults when config is not provided", () => {
        const defaultConfig = {
            customValidationRules: [],
            failOnError: true,
            reportOutputDir: "/contractpolice/build",
            reporter: "default",
            enableAppLogsConsole: false,
            enableAppLogsFile: false,
            loglevel: "warn"
        };

        const contractPolice = new ContractPolice("some/directory", "http://someserver.com", {});
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.customValidationRules).to.deep.equal(defaultConfig.customValidationRules);
        expect(contractPolice.config.failOnError).to.equal(defaultConfig.failOnError);
        expect(contractPolice.config.reportOutputDir).to.equal(defaultConfig.reportOutputDir);
        expect(contractPolice.config.reporter).to.equal(defaultConfig.reporter);
        expect(contractPolice.config.enableAppLogsConsole).to.equal(false, defaultConfig.enableAppLogsConsole);
        expect(contractPolice.config.enableAppLogsFile).to.equal(defaultConfig.enableAppLogsFile);
        expect(contractPolice.config.loglevel).to.equal(defaultConfig.loglevel);
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

    it("should accept the parameters when config.loglevel is 'error', 'warn', 'info', 'debug'", () => {
        ['error', 'warn', 'info', 'debug'].forEach(function(supportedLogLevel) {
            const options = {
                loglevel: supportedLogLevel
            };
            const contractPolice = new ContractPolice("some/directory", "http://someserver.com", options);
            expect(contractPolice).to.not.be.null;
            expect(contractPolice.contractsDirectory).to.equal("some/directory");
            expect(contractPolice.endpoint).to.equal("http://someserver.com");
            expect(contractPolice.config.reporter).to.equal("default");
            expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
            expect(contractPolice.config.loglevel).to.equal(supportedLogLevel);
        });
    });

    it("should fallback to default when config.loglevel is not supported", () => {
        const options = {
            loglevel: "appelflap"
        };
        const contractPolice = new ContractPolice("some/directory", "http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("default");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
        expect(contractPolice.config.loglevel).to.equal("warn");
    });
    //endregion

    //region Tests to verify behaviour of ContractPolice
    it('should resolve a successful promise when given valid input, outputDir exists and tests are passing', () => {
        //region mocks
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
        //endregion mocks

        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");

        return expect(contractPolice.testContracts())
            .to.eventually.be.fulfilled
            .then(function () {
                expect(cprStub.called).to.equal(true);
                expect(junitStub.called).to.equal(false);
            })
    });

    it('should resolve a successful promise when given valid input, outputDir does not exist and tests are passing', () => {
        //region mocks
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
        //region mocks
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
        //endregion mocks

        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");

        return expect(contractPolice.testContracts())
            .to.eventually.be.rejectedWith("ContractPolice finished contract testing with violations and/or errors!")
            .then(function () {
                expect(cprStub.called).to.equal(true);
                expect(junitStub.called).to.equal(false);
            });
    });

    it('should resolve a successful promise when given valid input, outputDir does not exist and tests are failing', () => {
        //region mocks
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
        //endregion mocks

        const contractPolice = new ContractPolice("some/directory", "http://someserver.com");

        return expect(contractPolice.testContracts())
            .to.eventually.be.rejectedWith("ContractPolice finished contract testing with violations and/or errors!")
            .then(function () {
                expect(cprStub.called).to.equal(true);
                expect(junitStub.called).to.equal(false);
            });
    });
    //endregion
});

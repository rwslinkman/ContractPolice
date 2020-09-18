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
const Logging = require("../src/logging/logging.js");
const Contract = require("../src/model/contract.js");
// Subject
const ContractPolice = rewire("../index.js");

describe("ContractPolice", () => {
    //region Mocks for all tests
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

    function parserMock() { // constructor returns object with functions
        return {
            findYamlFiles: function (directory) {
                // expect(directory).to.equal("some/directory");
                return Promise.resolve(["/some/path/to/my-contract.yaml"]);
            },
            parseContract: function(contractFile) {
                let contractObj = {
                    request: {
                        path: "/some/path"
                    },
                    response: {
                        statuscode: 200
                    }
                }
                return new Contract("contractName", contractObj);
            },
            extractContractName: function(contractFile, stripExtension) {
                return "my-contract";
            }
        }
    }

    function testRunnerMock(contractName, contractRequest, endpoint, validator) { // constructor returns object with functions
        return {
            runTest: function() {
                return new TestOutcome("my-contract", "Tests were executed", "PASS")
            }
        }
    }

    function failedTestRunnerMock(contractName, contractRequest, endpoint, validator) { // constructor returns object with functions
        return {
            runTest: function() {
                return new TestOutcome("my-contract", "Tests were executed", "FAIL")
            }
        }
    }
    //endregion

    //region Tests to setup and config of ContractPolice
    it("should accept a directory parameter and a endpoint parameter", () => {
        const options = {
            contractDefinitionsDir: "some/directory"
        };
        const contractPolice = new ContractPolice("http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("default");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
    });

    it("should throw an exception when 'contractDefinitionsDir' option is null", () => {
        const options = {
            contractDefinitionsDir: null
        };
        expect(() =>  new ContractPolice("http://someserver.com", options)).to.throw("Required parameter 'config.contractDefinitionsDir' not found.");
    });

    it("should throw an exception when 'contractDefinitionsDir' option is missing", () => {
        const options = {};
        expect(() =>  new ContractPolice("http://someserver.com", options)).to.throw("Required parameter 'config.contractDefinitionsDir' not found.");
    });

    it("should throw an exception when endpoint parameter is null", () => {
        const options = {
            contractDefinitionsDir: "some/directory"
        };
        expect(() => new ContractPolice(null, options)).to.throw("Required parameter 'endpoint' not found.");
    });

    it("should fallback to defaults when config is not provided", () => {
        const defaultConfig = {
            openApiFile: "",
            customValidationRules: [],
            failOnError: true,
            reportOutputDir: "/contractpolice/build",
            reporter: "default",
            enableAppLogsConsole: true,
            enableAppLogsFile: false,
            loglevel: "warn"
        };

        const contractPolice = new ContractPolice("http://someserver.com", {
            contractDefinitionsDir: "contracts"
        });
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("contracts");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.customValidationRules).to.deep.equal(defaultConfig.customValidationRules);
        expect(contractPolice.config.failOnError).to.equal(defaultConfig.failOnError);
        expect(contractPolice.config.reportOutputDir).to.equal(defaultConfig.reportOutputDir);
        expect(contractPolice.config.reporter).to.equal(defaultConfig.reporter);
        expect(contractPolice.config.enableAppLogsConsole).to.equal(defaultConfig.enableAppLogsConsole);
        expect(contractPolice.config.enableAppLogsFile).to.equal(defaultConfig.enableAppLogsFile);
        expect(contractPolice.config.loglevel).to.equal(defaultConfig.loglevel);
    });

    it("should accept the parameters when config.reporter is 'default'", () => {
        const options = {
            contractDefinitionsDir: "some/directory",
            reporter: "default"
        };
        const contractPolice = new ContractPolice("http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("default");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
    });

    it("should accept the parameters when config.reporter is 'junit'", () => {
        const options = {
            reporter: "junit",
            contractDefinitionsDir: "some/directory"
        };
        const contractPolice = new ContractPolice("http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("junit");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
    });

    it("should fallback to default when config.reporter is not supported", () => {
        const options = {
            reporter: "somethingElse",
            contractDefinitionsDir: "some/directory"
        };
        const contractPolice = new ContractPolice("http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("default");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
    });

    it("should fallback to default when config.reporter is not supported", () => {
        const options = {
            reporter: "somethingElse",
            contractDefinitionsDir: "some/directory"
        };
        const contractPolice = new ContractPolice("http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("default");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
    });

    it("should accept the parameters when config.loglevel is 'error', 'warn', 'info', 'debug'", () => {
        ['error', 'warn', 'info', 'debug'].forEach(function(supportedLogLevel) {
            const options = {
                loglevel: supportedLogLevel,
                contractDefinitionsDir: "some/directory"
            };
            const contractPolice = new ContractPolice("http://someserver.com", options);
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
            loglevel: "appelflap",
            contractDefinitionsDir: "some/directory"
        };
        const contractPolice = new ContractPolice("http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.endpoint).to.equal("http://someserver.com");
        expect(contractPolice.config.reporter).to.equal("default");
        expect(contractPolice.config.reportOutputDir).to.equal("/contractpolice/build");
        expect(contractPolice.config.loglevel).to.equal("warn");
    });

    it("should accept the openApiFile parameter when given", () => {
        ["yaml", "yml"].forEach((extension) => {
            const options = {
                openApiFile: "openapi/some-openapi-file." + extension,
                contractDefinitionsDir: "some/directory"
            };
            const contractPolice = new ContractPolice("http://someserver.com", options);
            expect(contractPolice).to.not.be.null;
            expect(contractPolice.contractsDirectory).to.equal("some/directory");
            expect(contractPolice.config.openApiFile).to.equal("openapi/some-openapi-file." + extension);
        });
    });

    it("should choose default for the openApiFile parameter when not given", () => {
        const options = {
            contractDefinitionsDir: "some/directory"
        };
        const contractPolice = new ContractPolice("http://someserver.com", options);
        expect(contractPolice).to.not.be.null;
        expect(contractPolice.contractsDirectory).to.equal("some/directory");
        expect(contractPolice.config.openApiFile).to.equal("");
    });
    //endregion

    //region Tests to verify behaviour of ContractPolice
    it('should resolve a successful promise when given valid input, outputDir exists and tests are passing', async () => {
        //region mocks
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

        const contractPolice = new ContractPolice("http://someserver.com", {
            contractDefinitionsDir: "some/directory",
        });
        await contractPolice.testContracts()

        expect(cprStub.called).to.equal(true);
        expect(junitStub.called).to.equal(false);
    });

    it('should resolve a successful promise when given valid input, outputDir does not exist and tests are passing', async () => {
        //region mocks
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

        const contractPolice = new ContractPolice("http://someserver.com", {
            contractDefinitionsDir: "some/directory"
        });
        await contractPolice.testContracts()

        expect(cprStub.called).to.equal(true);
        expect(junitStub.called).to.equal(false);
    });

    it('should resolve a successful promise when given valid input, tests are passing, outputDir exists and junit reporter is configured', async () => {
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
            contractDefinitionsDir: "some/directory",
            reporter: "junit"
        };
        const contractPolice = new ContractPolice("http://someserver.com", config);
        await contractPolice.testContracts()

        expect(cprStub.called).to.equal(false);
        expect(junitStub.called).to.equal(true);
    });

    it('should resolve a successful promise when given valid input, tests are passing, outputDir does not exist and junit reporter is configured', async () => {
        //region mocks
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
        //endregion

        // Injection
        ContractPolice.__set__({
            "ContractParser": parserMock,
            "TestRunner": testRunnerMock,
            "ContractPoliceReporter": cpReporter,
            "JUnitReporter": junitReporter,
            "fs": mockFileSystem(false)
        });

        const config = {
            contractDefinitionsDir: "some/directory",
            reporter: "junit"
        };
        const contractPolice = new ContractPolice("http://someserver.com", config);
        await contractPolice.testContracts()

        expect(cprStub.called).to.equal(false);
        expect(junitStub.called).to.equal(true);
    });

    it('should resolve a successful promise when given valid input, outputDir exists and tests are failing', async () => {
        //region mocks
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
            "TestRunner": failedTestRunnerMock,
            "ContractPoliceReporter": cpReporter,
            "JUnitReporter": junitReporter,
            "fs": mockFileSystem(true)
        });
        //endregion mocks

        const contractPolice = new ContractPolice("http://someserver.com", {
            contractDefinitionsDir: "some/directory",
        });
        let actualError = null
        try {
            await contractPolice.testContracts()
        } catch(err) {
            actualError = err;
        }

        expect(actualError).to.be.an('error');
        expect(actualError.message).to.equal("ContractPolice finished contract testing with violations and/or errors!")
        expect(cprStub.called).to.equal(true);
        expect(junitStub.called).to.equal(false);
    });

    it('should resolve a successful promise when given valid input, outputDir does not exist and tests are failing', async () => {
        //region mocks
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
            "TestRunner": failedTestRunnerMock,
            "ContractPoliceReporter": cpReporter,
            "JUnitReporter": junitReporter,
            "fs": mockFileSystem(false)
        });
        //endregion mocks

        const contractPolice = new ContractPolice("http://someserver.com", {
            contractDefinitionsDir: "some/directory",
        });

        let actualError = null
        try {
            await contractPolice.testContracts()
        } catch(err) {
            actualError = err;
        }

        expect(actualError).to.be.an('error');
        expect(actualError.message).to.equal("ContractPolice finished contract testing with violations and/or errors!")
        expect(cprStub.called).to.equal(true);
        expect(junitStub.called).to.equal(false);
    });

    it('should write additional logs when given valid input, outputDir exists and tests are passing', async () => {
        //region mocks
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
        const testLogger = function(){
            return {
                writeLogs: function() {return Promise.resolve()},
                log: sinon.stub(),
                error: sinon.stub(),
                warn: sinon.stub(),
                info: sinon.stub(),
                debug: sinon.stub(),
                fileEnabled: true
            };
        };
        // Injection
        ContractPolice.__set__({
            "ContractParser": parserMock,
            "TestRunner": testRunnerMock,
            "ContractPoliceReporter": cpReporter,
            "JUnitReporter": junitReporter,
            "fs": mockFileSystem(true),
            "Logging": testLogger
        });
        //endregion mocks

        const contractPolice = new ContractPolice("http://someserver.com", {
            contractDefinitionsDir: "some/directory",
            enableAppLogsFile: true
        });
        await contractPolice.testContracts();

        expect(cprStub.called).to.equal(true);
        expect(junitStub.called).to.equal(false);
    });
    //endregion
});

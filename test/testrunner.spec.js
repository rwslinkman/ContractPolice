const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");
const sinon = require("sinon");

chai.use(chaiAsPromised);
let expect = chai.expect;

const ViolationReport = require("../src/validation/report.js");
const Violation = require("../src/validation/violation.js");
const Validator = require("../src/validation/validator.js");
const Logging = require("../src/logging/logging.js");
const TestRunner = rewire("../src/testrunner.js");

describe("TestRunner", () => {
    const testLogger = new Logging("debug", false, false);
    let needleStub
    function mockValidator(violations = []) {
        return {
            validate: sinon
                .stub(new Validator(), "validate")
                .resolves(new ViolationReport(violations))
        };
    }

    function mockNeedleRequest(response, error = null) {
        const isSuccess = response !== null;
        const needleMock = isSuccess ? needleStub.resolves(response) : needleStub.rejects(error);
        TestRunner.__set__({
            "needle": needleMock
        });
    }

    function mockValidatorError() {
        return {
            validate: sinon
                .stub(new Validator(), "validate")
                .rejects(new Error("Unexpected error"))
        };
    }

    beforeEach(function () {
        needleStub = sinon.stub();
    });

    afterEach(function() {
        needleStub.reset();
    });

    it("should run the test when minimal request succeeds and validator returns no violations", async () => {
        const request = {
            path: "/v1/orders"
        };
        const violationList = [];
        const mockedResponse = {
            statusCode: 200
        };
        const validator = mockValidator(violationList);
        mockNeedleRequest(mockedResponse);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const testOutcome = await runner.runTest();

        expect(testOutcome).to.be.an('object');
        expect(testOutcome).to.have.property('result');
        expect(testOutcome.result).to.equal("PASS");
    });

    it("should run the test when 'POST' request succeeds and validator returns no violations", async () => {
        const request = {
            path: "/v1/orders",
            method: "POST"
        };
        const violationList = [];
        const mockedResponse = {
            statusCode: 200
        };
        const validator = mockValidator(violationList);
        mockNeedleRequest(mockedResponse);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const testOutcome = await runner.runTest();

        expect(testOutcome).to.be.an('object');
        expect(testOutcome).to.have.property('result');
        expect(testOutcome.result).to.equal("PASS");
    });

    it("should run the test when 'POST' request succeeds and validator returns no violations", async () => {
        const request = {
            path: "/v1/orders",
            method: "post"
        };
        const violationList = [];
        const mockedResponse = {
            statusCode: 200
        };
        const validator = mockValidator(violationList);
        mockNeedleRequest(mockedResponse);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const testOutcome = await runner.runTest();

        expect(testOutcome).to.be.an('object');
        expect(testOutcome).to.have.property('result');
        expect(testOutcome.result).to.equal("PASS");
    });

    it("should run the test when 'PUT' request succeeds and validator returns no violations", async () => {
        const request = {
            path: "/v1/orders",
            method: "PUT"
        };
        const violationList = [];
        const mockedResponse = {
            statusCode: 200
        };
        const validator = mockValidator(violationList);
        mockNeedleRequest(mockedResponse);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const testOutcome = await runner.runTest();

        expect(testOutcome).to.be.an('object');
        expect(testOutcome).to.have.property('result');
        expect(testOutcome.result).to.equal("PASS");
    });

    it("should run the test when 'PUT' request succeeds and validator returns no violations", async () => {
        const request = {
            path: "/v1/orders",
            method: "put"
        };
        const violationList = [];
        const mockedResponse = {
            statusCode: 200
        };
        const validator = mockValidator(violationList);
        mockNeedleRequest(mockedResponse);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const testOutcome = await runner.runTest();

        expect(testOutcome).to.be.an('object');
        expect(testOutcome).to.have.property('result');
        expect(testOutcome.result).to.equal("PASS");
    });

    it("should run the test when 'POST' request succeeds and validator returns a violation", async () => {
        const request = {
            path: "/v1/orders",
            method: "POST"
        };
        const violationList = [
            new Violation("statuscode", 200, 404)
        ];
        const mockedResponse = {
            statusCode: 200
        };
        mockNeedleRequest(mockedResponse);
        let valid = mockValidator(violationList);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", valid);

        const testOutcome = await runner.runTest();

        expect(testOutcome).to.be.an('object');
        expect(testOutcome).to.have.property('result');
        expect(testOutcome.result).to.equal("FAIL");
    });

    it("should run the test when 'POST' request fails", async () => {
        const request = {
            path: "/v1/orders",
            method: "POST"
        };
        const validator = mockValidator();
        mockNeedleRequest(null, {
            address: "http://test.test",
            port: 1337,
            code: "ERRCONNRESET"
        });

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const testOutcome = await runner.runTest();

        expect(testOutcome).to.be.an('object');
        expect(testOutcome).to.have.property('result');
        expect(testOutcome.result).to.equal("FAIL");
    });

    it("should run the test when 'POST' request with headers succeeds and validator returns no violations", async () => {
        const request = {
            path: "/v1/orders",
            method: "POST",
            headers: [
                { "Content-Type": "application/json" },
                { "Accept": "application/json" }
            ]
        };
        const violationList = [];
        const mockedResponse = {
            statusCode: 200
        };
        const validator = mockValidator(violationList);
        mockNeedleRequest(mockedResponse);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const testOutcome = await runner.runTest();

        expect(testOutcome).to.be.an('object');
        expect(testOutcome).to.have.property('result');
        expect(testOutcome.result).to.equal("PASS");
    });

    it("should append query parameters to URL when running the test", async () => {
        const request = {
            path: "/v3/orders",
            method: "GET",
            params: [
                { "orderId": 1337 },
                { "token": "abcd" }
            ]
        };

        const violationList = [];
        const mockedResponse = {
            statusCode: 200
        };
        const validator = mockValidator(violationList);
        mockNeedleRequest(mockedResponse);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/api", validator);

        await runner.runTest();

        const callArguments = needleStub.getCall(0).args;
        const urlArgument = callArguments[1];
        return expect(urlArgument).to.equal("http://doesnot.exist/api/v3/orders?orderId=1337&token=abcd");
    });

    it("should return 'unable to validate' violation when validator throws unexpected error", async () => {
        const request = {
            path: "/v3/orders"
        };
        const mockedResponse = {
            statusCode: 200
        };
        const validator = mockValidatorError();
        mockNeedleRequest(mockedResponse);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/api", validator);

        const resultReport = await runner.runTest()
        expect(resultReport.result).to.equal("FAIL");
        expect(resultReport.testName).to.equal("testName");
        expect(resultReport.report).to.not.be.empty;
        expect(resultReport.report[0]).to.equal("Unable to validate testName due to error")
    });
});
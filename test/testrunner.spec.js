const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");
const Logging = require("../src/logging/logging.js");

chai.use(chaiAsPromised);
let expect = chai.expect;

const ViolationReport = require("../src/validation/report.js");
const Violation = require("../src/validation/violation.js");
const needle = rewire("needle");
const TestRunner = rewire("../src/testrunner.js");

describe("TestRunner", () => {
    const testLogger = new Logging(false);
    function mockValidator(violations = []) {
        return {
            validate: function () {
                let report = new ViolationReport(violations);
                return Promise.resolve(report);
            }
        };
    }

    function mockNeedleRequest(success) {
        const needleMock = function(method, url, data, options) {
            return success ? Promise.resolve() : Promise.reject(Error());
        };
        TestRunner.__set__({
            "needle": needleMock
        });
    }

    it("should run the test when minimal request succeeds and validator returns no violations", () => {
        const request = {
            path: "/v1/orders"
        };
        const violationList = [];
        const validator = mockValidator(violationList);
        const httpSuccess = true;
        mockNeedleRequest(httpSuccess);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const result = runner.runTest();

        return expect(result).to.eventually.be.fulfilled;
    });

    it("should run the test when 'POST' request succeeds and validator returns no violations", () => {
        const request = {
            path: "/v1/orders",
            method: "POST"
        };
        const violationList = [];
        const validator = mockValidator(violationList);
        const httpSuccess = true;
        mockNeedleRequest(httpSuccess);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const result = runner.runTest();

        return expect(result).to.eventually.be.fulfilled;
    });

    it("should run the test when 'post' request succeeds and validator returns no violations", () => {
        const request = {
            path: "/v1/orders",
            method: "post"
        };
        const violationList = [];
        const validator = mockValidator(violationList);
        const httpSuccess = true;
        mockNeedleRequest(httpSuccess);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const result = runner.runTest();

        return expect(result).to.eventually.be.fulfilled;
    });

    it("should run the test when 'PUT' request succeeds and validator returns no violations", () => {
        const request = {
            path: "/v1/orders",
            method: "PUT"
        };
        const violationList = [];
        const validator = mockValidator(violationList);
        const httpSuccess = true;
        mockNeedleRequest(httpSuccess);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const result = runner.runTest();

        return expect(result).to.eventually.be.fulfilled;
    });

    it("should run the test when 'PUT' request succeeds and validator returns no violations", () => {
        const request = {
            path: "/v1/orders",
            method: "put"
        };
        const violationList = [];
        const validator = mockValidator(violationList);
        const httpSuccess = true;
        mockNeedleRequest(httpSuccess);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const result = runner.runTest();

        return expect(result).to.eventually.be.fulfilled;
    });

    it("should run the test when 'POST' request succeeds and validator returns a violation", () => {
        const request = {
            path: "/v1/orders",
            method: "POST"
        };
        const violationList = [
            new Violation("statuscode", 200, 404)
        ];
        const validator = mockValidator(violationList);
        const httpSuccess = true;
        mockNeedleRequest(httpSuccess);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const result = runner.runTest();

        return expect(result).to.eventually.be.fulfilled;
    });

    it("should run the test when 'POST' request fails", () => {
        const request = {
            path: "/v1/orders",
            method: "POST"
        };
        const validator = mockValidator();
        const httpSuccess = false;
        mockNeedleRequest(httpSuccess);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const result = runner.runTest();

        return expect(result).to.eventually.be.fulfilled;
    });

    it("should run the test when 'POST' request with headers succeeds and validator returns no violations", () => {
        const request = {
            path: "/v1/orders",
            method: "POST",
            headers: [
                { "Content-Type": "application/json" },
                { "Accept": "application/json" }
            ]
        };
        const violationList = [];
        const validator = mockValidator(violationList);
        const httpSuccess = true;
        mockNeedleRequest(httpSuccess);

        const runner = new TestRunner(testLogger, "testName", request, "http://doesnot.exist/", validator);

        const result = runner.runTest();

        return expect(result).to.eventually.be.fulfilled;
    });
});
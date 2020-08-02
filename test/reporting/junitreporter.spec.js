const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");
const sinon = require("sinon");
const junit = require('junit-report-builder');
const Logging = require("../../src/logging/logging.js");

chai.use(chaiAsPromised);
const expect = chai.expect;

const JUnitReporter = rewire("../../src/reporting/junitreporter.js");
const TestOutcome = require("../../src/testoutcome");
const TESTLOGGER = new Logging("error", false, false);

describe("JUnitReporter", () => {
    function injectMocks(writeStub) {
        JUnitReporter.__set__({
            "junitBuilder": {
                writeTo: writeStub,
                testSuite: function () {
                    return junit._factory.newTestSuite()
                }
            }
        });
    }

    it('should write a JUnit report to file when given a test report with two items', async () => {
        const writeStub = sinon.stub();
        injectMocks(writeStub);

        const reporter = new JUnitReporter(TESTLOGGER, "/some/outputDir");
        let testResults = [
            new TestOutcome("test1", [
                "Test one passed",
                "Test two passed",
            ], "PASS")
        ];

        await reporter.writeTestReport(testResults, 1337);
        expect(writeStub.called).to.equal(true);
    });

    it('should write a JUnit report to file when given a test report with zero items', async () => {
        const writeStub = sinon.stub();
        injectMocks(writeStub);

        const reporter = new JUnitReporter(TESTLOGGER, "/some/outputDir");
        let testResults = [
            new TestOutcome("test1", [], "PASS")
        ];

        await reporter.writeTestReport(testResults, 1337);
        expect(writeStub.called).to.equal(true);
    });

    it('should write a JUnit report to file when given no test reports', async () => {
        const writeStub = sinon.stub();
        injectMocks(writeStub);

        const reporter = new JUnitReporter(TESTLOGGER, "/some/outputDir");
        let testResults = [];

        await reporter.writeTestReport(testResults, 1337);
        expect(writeStub.called).to.equal(true);
    });

    it('should write a JUnit report to file when given no reports', async () => {
        const writeStub = sinon.stub();
        injectMocks(writeStub);

        const reporter = new JUnitReporter(TESTLOGGER, "/some/outputDir");
        let testResults = [];

        await reporter.writeTestReport(testResults, 1337);
        expect(writeStub.called).to.equal(true);
    });

    it('should write a JUnit report to file when given failing test reports', async () => {
        const writeStub = sinon.stub();
        injectMocks(writeStub);

        const reporter = new JUnitReporter(TESTLOGGER, "outputDir");
        let testResults = [
            new TestOutcome("test1", [
                "Test one passed",
                "Test two passed",
            ], "FAIL")
        ];

        await reporter.writeTestReport(testResults, 1337);
        expect(writeStub.called).to.equal(true);
    });
});
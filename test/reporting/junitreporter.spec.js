const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");
const sinon = require("sinon");
const junit = require('junit-report-builder');

chai.use(chaiAsPromised);
const expect = chai.expect;

const JUnitReporter = rewire("../../src/reporting/junitreporter.js");
const TestOutcome = require("../../src/testoutcome");

describe("JUnitReporter", () => {
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

    it('should write a JUnit report to file when given a test report with two items and output directory exists', () => {
        const writeStub = sinon.stub();
        const fsMock = mockFileSystem(true);

        JUnitReporter.__set__({
            "junitBuilder": {
                writeTo: writeStub,
                testSuite: function() { return junit._factory.newTestSuite() }
            },
            "fs": fsMock
        });

        const reporter = new JUnitReporter("/some/baseDir", "outputDir");
        let testResults = [
            new TestOutcome("test1", [
                "Test one passed",
                "Test two passed",
            ], "PASS")
        ];

        return expect(reporter.writeTestReport(testResults)).to.eventually.be.fulfilled.then(function() {
            expect(writeStub.called).to.equal(true);
        });
    });

    // it('should write a JUnit report to file when given a test report with zero items and output directory exists', () => {
    //     // TODO
    // });
    //
    // it('should write a JUnit report to file when given no test reports and output directory exists', () => {
    //     // TODO
    // });
    //
    // it('should write a JUnit report to file when given no reports and output directory does not exist', () => {
    //     // TODO
    // });
});
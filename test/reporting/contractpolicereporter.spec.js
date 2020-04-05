const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");

chai.use(chaiAsPromised);
let expect = chai.expect;

const TestReporter = rewire("../../src/reporting/contractpolicereporter.js");
const TestOutcome = require("../../src/testoutcome");

describe("TestReporter", () => {
    function mockFileSystem(outputDirExists, writeFileError) {
        const fsMock = {
            existsSync: function (dir) {
                return outputDirExists;
            },
            writeFile: function (filename, data, callback) {
                return callback(writeFileError);
            },
            mkdirSync: function(dir) {
                // nop
            }
        };
        TestReporter.__set__("fs", fsMock);
    }

    it('should write a report to txt file when given a test report with two items and output directory exists', () => {
        mockFileSystem(true, null);

        const reporter = new TestReporter("/some/baseDir", "outputDir");
        let testResults = [
            new TestOutcome("test1", [
                "Test one passed",
                "Test two passed",
            ], "PASS")
        ];

        return expect(reporter.writeTestReport(testResults)).to.eventually.be.fulfilled;
    });

    it('should write a report to txt file when given a test report with zero items and output directory exists', () => {
        mockFileSystem(true, null);

        const reporter = new TestReporter("/some/baseDir", "outputDir");
        let testResults = [
            new TestOutcome("test1", [], "PASS")
        ];

        return expect(reporter.writeTestReport(testResults)).to.eventually.be.fulfilled;
    });

    it('should write a report to txt file when given no test reports and output directory exists', () => {
        mockFileSystem(true, null);

        const reporter = new TestReporter("/some/baseDir", "outputDir");
        let testResults = [];

        return expect(reporter.writeTestReport(testResults)).to.eventually.be.fulfilled;
    });

    it('should reject writing a report to txt file when an error occurred on the filesystem', () => {
        mockFileSystem(true, Error("Something went wrong"));

        const reporter = new TestReporter("/some/baseDir", "outputDir");
        let testResults = [
            new TestOutcome("test1", [], "PASS")
        ];

        return expect(reporter.writeTestReport(testResults)).to.eventually.be.rejectedWith("Something went wrong");
    });

    it('should write a report to txt file when given no test reports and output directory does not exists', () => {
        mockFileSystem(false, null);

        const reporter = new TestReporter("/some/baseDir", "outputDir");
        let testResults = [];

        return expect(reporter.writeTestReport(testResults)).to.eventually.be.fulfilled;
    });
});
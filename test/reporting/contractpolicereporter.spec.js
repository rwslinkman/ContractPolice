const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");

chai.use(chaiAsPromised);
let expect = chai.expect;

const ContractPoliceReporter = rewire("../../src/reporting/contractpolicereporter.js");
const TestOutcome = require("../../src/testoutcome");

describe("ContractPoliceReporter", () => {
    function mockFileSystem(writeFileError) {
        const fsMock = {
            writeFile: function (filename, data, callback) {
                return callback(writeFileError);
            }
        };
        ContractPoliceReporter.__set__("fs", fsMock);
    }

    it('should write a report to txt file when given a test report with two items', () => {
        mockFileSystem(null);

        const reporter = new ContractPoliceReporter("/some/outputDir");
        let testResults = [
            new TestOutcome("test1", [
                "Test one passed",
                "Test two passed",
            ], "PASS")
        ];

        return expect(reporter.writeTestReport(testResults)).to.eventually.be.fulfilled;
    });

    it('should write a report to txt file when given a test report with zero items', () => {
        mockFileSystem(null);

        const reporter = new ContractPoliceReporter("/some/outputDir");
        let testResults = [
            new TestOutcome("test1", [], "PASS")
        ];

        return expect(reporter.writeTestReport(testResults)).to.eventually.be.fulfilled;
    });

    it('should write a report to txt file when given no test reports', () => {
        mockFileSystem(null);

        const reporter = new ContractPoliceReporter("/some/outputDir");
        let testResults = [];

        return expect(reporter.writeTestReport(testResults)).to.eventually.be.fulfilled;
    });

    it('should reject writing a report to txt file when an error occurred on the filesystem', () => {
        mockFileSystem(Error("Something went wrong"));

        const reporter = new ContractPoliceReporter("/some/outputDir");
        let testResults = [
            new TestOutcome("test1", [], "PASS")
        ];

        return expect(reporter.writeTestReport(testResults)).to.eventually.be.rejectedWith("Something went wrong");
    });
});
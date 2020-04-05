const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("JUnitReporter", () => {
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

    it('should write a JUnit report to file when given a test report with two items and output directory exists', () => {
        //
    });

    it('should write a JUnit report to file when given a test report with zero items and output directory exists', () => {
        //
    });

    it('should write a JUnit report to file when given no test reports and output directory exists', () => {
        //
    });
});
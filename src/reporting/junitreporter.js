const junitBuilder = require("junit-report-builder");
const LOG_TAG = "JUnitReporter";

function writeJUnitReport(outputDirectory, timestamp, testResults) {
    const lineEnd = "\r\n";
    let suite = junitBuilder
        .testSuite()
        .name('ContractPolice');

    testResults.forEach(function(resultItem) {
        const isPass = resultItem.result === "PASS";
        let testCase = suite
            .testCase()
            .name(resultItem.testName);

        if(!isPass) {
            // Render report
            let output = "";
            resultItem.report.forEach(function (reportItem) {
                output += "\t" + reportItem + lineEnd;
            });
            // Complete testcase
            testCase
                .standardError(output)
                .failure();
        }
    });

    junitBuilder.writeTo(outputDirectory + `/contractpolice-report-${timestamp}.xml`);
}

function JUnitReporter(logger, outputDir) {
    this.logger = logger;
    this.outputDir = outputDir;
}

JUnitReporter.prototype.writeTestReport = function(testResults, timestamp) {
    this.logger.debug(LOG_TAG, "Writing application logs in junit format");
    const junitTimestamp = timestamp / 1000;
    return writeJUnitReport(this.outputDir, junitTimestamp, testResults);
};

module.exports = JUnitReporter;
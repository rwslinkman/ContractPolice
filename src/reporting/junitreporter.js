const junitBuilder = require("junit-report-builder");

function writeJUnitReport(outputDirectory, timestamp, testResults) {
    const lineEnd = "\r\n";
    return new Promise(function(resolve, reject) {
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

        junitBuilder.writeTo(outputDirectory + "/test-report.xml");
        resolve();
    });

}

function JUnitReporter(outputDir) {
    this.outputDir = outputDir;
}

JUnitReporter.prototype.writeTestReport = function(testResults, timestamp) {
    const junitTimestamp = timestamp / 1000;
    return writeJUnitReport(this.outputDir, junitTimestamp, testResults);
};

module.exports = JUnitReporter;
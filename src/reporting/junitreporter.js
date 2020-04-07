const junitBuilder = require("junit-report-builder");
const fs = require('fs');

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

function JUnitReporter(baseDir, outputDir) {
    this.baseDir = baseDir;
    this.outputDir = outputDir;
}

JUnitReporter.prototype.writeTestReport = function(testResults) {
    const timestamp = new Date().getTime() / 1000;
    const outputDir = this.baseDir + "/" + this.outputDir;

    if(!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    return writeJUnitReport(outputDir, timestamp, testResults);
};

module.exports = JUnitReporter;
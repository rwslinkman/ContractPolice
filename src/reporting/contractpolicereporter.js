const fs = require('fs');
const LOG_TAG = "ContractPoliceReporter";

function writeTxtFile(outputDirectory, timestamp, testResults) {
    const lineEnd = "\r\n";
    return new Promise(function(resolve, reject) {
        // Write output to TXT file
        let outputFileName = outputDirectory + "/contractpolice-test-" + timestamp + ".txt";
        let  output = "ContractPolice Test report:" + lineEnd;
        testResults.forEach(function(resultItem) {
            output += `[${resultItem.result}] ${resultItem.testName}` + lineEnd;
            resultItem.report.forEach(function (reportItem) {
                output += "\t" + reportItem + lineEnd;
            })
        });

        fs.writeFile(outputFileName, output, function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function ContractPoliceReporter(logger, outputDir) {
    this.logger = logger;
    this.outputDir = outputDir;
}

ContractPoliceReporter.prototype.writeTestReport = function(testResults, timestamp) {
    this.logger.debug(LOG_TAG, "Writing application logs in default format");
    return writeTxtFile(this.outputDir, timestamp, testResults);
};

module.exports = ContractPoliceReporter;
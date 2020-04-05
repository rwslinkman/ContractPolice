const fs = require('fs');

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

function ContractPoliceReporter(baseDir, outputDir) {
    this.baseDir = baseDir;
    this.outputDir = outputDir;
}

ContractPoliceReporter.prototype.writeTestReport = function(testResults) {
    const timestamp = new Date().getTime();
    const outputDir = this.baseDir + "/" + this.outputDir;

    if(!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    // TODO: Improve with more output options
    return writeTxtFile(outputDir, timestamp, testResults);
};

module.exports = ContractPoliceReporter;
const junitBuilder = require("junit-report-builder");

function JUnitReporter(baseDir, outputDir) {
    this.baseDir = baseDir;
    this.outputDir = outputDir;
}

JUnitReporter.prototype.writeTestReport = function(testResults) {

};

module.exports = JUnitReporter;
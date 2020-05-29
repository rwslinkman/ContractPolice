function ExecutionReport(testReporter, timestamp, results, runSuccess) {
    this.testReporter = testReporter;
    this.timestamp = timestamp;
    this.results = results;
    this.runSuccess = runSuccess;
}
module.exports = ExecutionReport;
function ViolationReport(violations) {
    this.violations = violations || [];
}

ViolationReport.prototype.hasViolations = function() {
    return this.getViolationCount() > 0;
};

ViolationReport.prototype.getViolationTexts = function() {
    let texts = [];
    this.violations.forEach(function(violation) {
        texts.push(violation.getViolationText());
    });
    return texts;
};

ViolationReport.prototype.getViolationCount = function() {
    return this.violations.length;
}

module.exports = ViolationReport;
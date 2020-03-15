function ViolationReport(violations) {
    this.violations = violations || [];
}

ViolationReport.prototype.hasViolations = function() {
    return this.violations.length > 0;
};

ViolationReport.prototype.getViolationTexts = function() {
    let texts = [];
    this.violations.forEach(function(violation) {
        texts.push(violation.getViolationText());
    });
    return texts;
};

module.exports = ViolationReport;
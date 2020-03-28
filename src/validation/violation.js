function Violation(key, expected, actual) {
    this.key = key;
    this.expected = expected;
    this.actual = actual;
}

Violation.prototype.getViolationText = function() {
    return `Expected ${this.key} to be '${this.expected}' but it was '${this.actual}'`;
};

module.exports = Violation;
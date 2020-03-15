function Violation(key, expected, actual) {
    this.key = key;
    this.expected = expected;
    this.actual = actual;
}

Violation.prototype.getViolationText = function() {
    // TODO: Improve printed message
    return "Expected " + this.key + " but it had something else"
};

module.exports = Violation;
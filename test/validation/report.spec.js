const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
let expect = chai.expect;

const ViolationReport = require("../../src/validation/report.js");
const Violation = require("../../src/validation/violation.js");

describe("ViolationReport", () => {
    it("holds violations when given", () => {
        const input = [
            new Violation("testKey", "testExpected", "testActual")
        ];

        const report = new ViolationReport(input);

        expect(report.violations.length).to.equal(input.length);
    });

    it("allows empty initialisation", () => {
        const report = new ViolationReport();

        expect(report.violations.length).to.equal(0);
    });

    it("returns true when violations are held", () => {
        const input = [
            new Violation("testKey", "testExpected", "testActual")
        ];

        const report = new ViolationReport(input);

        expect(report.hasViolations()).to.equal(true);
    });

    it("returns false when no violations are held", () => {
        const input = [];

        const report = new ViolationReport(input);

        expect(report.hasViolations()).to.equal(false);
    });

    it("counts violations that are being held (1)", () => {
        const input = [
            new Violation("testKey", "testExpected", "testActual")
        ];

        const report = new ViolationReport(input);

        expect(report.getViolationCount()).to.equal(1);
    });

    it("counts violations that are being held (2)", () => {
        const input = [
            new Violation("testKey1", "testExpected", "testActual"),
            new Violation("testKey2", "testExpected", "testActual")
        ];

        const report = new ViolationReport(input);

        expect(report.getViolationCount()).to.equal(2);
    });

    it("returns an array of strings when getting violation texts", () => {
        const input = [
            new Violation("testKey", "testExpected", "testActual")
        ];

        const report = new ViolationReport(input);

        expect(report.getViolationTexts()).to.not.be.empty;
    })
});
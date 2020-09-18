const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");
const sinon = require("sinon");

chai.use(chaiAsPromised);
let expect = chai.expect;

const Logging = rewire("../../src/logging/logging.js");

describe("Logging", () => {
    function setMocks(writeError) {
        const helperMock = {
            writeFile: (writeError == null) ? sinon.stub().resolves() : sinon.stub().rejects(writeError)
        };
        Logging.__set__({
            "helper": helperMock
        });
    }

    it("selects the correct loglevel when valid parameters given", () => {
        const supportedLogLevels = {
            "error": 3,
            "warn": 2,
            "info": 1,
            "debug": 0
        };
        Object.keys(supportedLogLevels).forEach(function (logLevel) {
            const expectedLevel = supportedLogLevels[logLevel];

            setMocks();
            const logger = new Logging(logLevel, false, false);

            expect(logger.loglevel).to.equal(expectedLevel);
            expect(logger.consoleEnabled).to.equal(false);
            expect(logger.fileEnabled).to.equal(false);
            expect(logger.logLines.length).to.equal(0);
        });
    });

    describe("tests for console logging function", () => {
        let consoleStub;
        beforeEach(function () {
            consoleStub = sinon.stub(console, "log");
            setMocks();
        });

        afterEach(function() {
            consoleStub.restore();
        });

        it("logs to console when enabled and severity higher than loglevel", () => {
            const logger = new Logging("info", true, false);

            logger.log("TestTag", "warn", "Test message");

            expect(console.log.called).to.equal(true);
        });

        it("logs to console when enabled and severity equal to loglevel", () => {
            const logger = new Logging("info", true, false);

            logger.log("TestTag", "info", "Test message");

            expect(console.log.called).to.equal(true);
        });

        it("does not log to console when enabled and severity lower than loglevel", () => {
            const logger = new Logging("info", true, false);

            logger.log("TestTag", "debug", "Test message");

            expect(console.log.called).to.equal(false);
        });

        it("remembers a log message when file logging enabled and severity higher than loglevel", () => {
            const logger = new Logging("info", false, true);

            logger.log("TestTag", "warn", "Test message");

            expect(logger.logLines.length).to.equal(1);
        });

        it("remembers a log message when file logging enabled and severity equal to loglevel", () => {
            const logger = new Logging("info", false, true);

            logger.log("TestTag", "info", "Test message");

            expect(logger.logLines.length).to.equal(1);
        });

        it("does not remember a log message when file logging enabled and severity lower than loglevel", () => {
            const logger = new Logging("info", false, true);

            logger.log("TestTag", "debug", "Test message");

            expect(logger.logLines.length).to.equal(0);
        });

        it("does nothing when no logging is enabled", () => {
            const logger = new Logging("info", false, false);

            logger.log("TestTag", "info", "Test message");

            expect(console.log.called).to.equal(false);
            expect(logger.logLines.length).to.equal(0);
        });
    });

    describe("tests for specific log functions", () => {
        let consoleStub;
        beforeEach(function () {
            consoleStub = sinon.stub(console, "log");
            setMocks();
        });

        afterEach(function() {
            consoleStub.restore();
        });

        it("remembers a log message when logging at 'error' level", () => {
            const logger = new Logging("debug", true, true);
            
            logger.error("TestTag", "Test message");

            expect(console.log.called).to.equal(true);
            expect(logger.logLines.length).to.equal(1);
        });

        it("remembers a log message when logging at 'warn' level", () => {
            const logger = new Logging("debug", true, true);

            logger.warn("TestTag", "Test message");

            expect(console.log.called).to.equal(true);
            expect(logger.logLines.length).to.equal(1);
        });

        it("remembers a log message when logging at 'info' level", () => {
            const consoleStub = sinon.stub();
            setMocks(null, consoleStub);
            const logger = new Logging("debug", true, true);

            logger.info("TestTag", "Test message");

            expect(console.log.called).to.equal(true);
            expect(logger.logLines.length).to.equal(1);
        });

        it("remembers a log message when logging at 'debug' level", () => {
            const consoleStub = sinon.stub();
            setMocks(null, consoleStub);
            const logger = new Logging("debug", true, true);

            logger.debug("TestTag", "Test message");

            expect(console.log.called).to.equal(true);
            expect(logger.logLines.length).to.equal(1);
        });
    });

    describe("tests for writing logs to file", () => {
        it("resolves a promise when writing logs to file", () => {
            setMocks(null);
            const logger = new Logging("debug", false, true);
            logger.error("TestTag", "Test message");

            const testTimestamp = 12345;
            let writeLogs = logger.writeLogs("/some/dir", testTimestamp);
            console.log(writeLogs);
            return expect(writeLogs).to.eventually.be.fulfilled;
        });

        it("rejects a promise when error occurs during file writing", () => {
            setMocks(Error("Something went wrong"));
            const logger = new Logging("debug", false, true);
            logger.error("TestTag", "Test message");

            const testTimestamp = 12345;
            return expect(logger.writeLogs("/some/dir", testTimestamp)).to.eventually.be.rejectedWith("Something went wrong");
        });
    });
});
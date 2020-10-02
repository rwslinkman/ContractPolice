const NullGenerator = require("../../src/generation/nullgenerator.js")
const expect = require("chai").expect;
const stub = require("sinon").stub;

describe("NullGenerator", () => {

    describe("generate", () => {

        it("should warn the user that the it does nothing", async () => {
            const loggerStub = stub().returns();
            const loggerMock = {
                warn: loggerStub
            };
            let generator = new NullGenerator(loggerMock);

            await generator.generate();

            expect(loggerStub.called).to.equal(true);
        });
    });
});
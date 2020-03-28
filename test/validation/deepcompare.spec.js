const expect = require("chai").expect;
const deepCompare = require("../../src/validation/deepcompare.js");

describe("deepCompare", () => {
    it("should return an empty violation list when two equal objects with equal string values are passed", () => {
        const param1 = {
            someKey: "someValue"
        };
        const param2 = {
            someKey: "someValue"
        };

        const result = deepCompare(param1, param2);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects with different string values are passed", () => {
        const param1 = {
            someKey: "someValue"
        };
        const param2 = {
            someKey: "anotherValue"
        };

        const result = deepCompare(param1, param2);

        expect(result).to.not.be.empty;
        // TODO: Check violation
    });

    it("should return an empty violation list when two equal objects with equal numbers values are passed", () => {
        const param1 = {
            someKey: 42
        };
        const param2 = {
            someKey: 42
        };

        const result = deepCompare(param1, param2);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects with different numbers values are passed", () => {
        const param1 = {
            someKey: 42
        };
        const param2 = {
            someKey: 1337
        };

        const result = deepCompare(param1, param2);

        expect(result).to.not.be.empty;
        // TODO: Check violation
    });
});

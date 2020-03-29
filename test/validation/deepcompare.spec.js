const expect = require("chai").expect;
const deepCompare = require("../../src/validation/deepcompare.js");

describe("deepCompare", () => {
    it("should return an empty violation list when two equal objects with equal string values are passed", () => {
        const expectedParam = {
            someKey: "someValue"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects with different string values are passed", () => {
        const expectedParam = {
            someKey: "someValue"
        };
        const actualParam = {
            someKey: "anotherValue"
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        // TODO: Check violation
    });

    it("should return an empty violation list when two equal objects with equal numbers values are passed", () => {
        const expectedParam = {
            someKey: 42
        };
        const actualParam = {
            someKey: 42
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects with different numbers values are passed", () => {
        const expectedParam = {
            someKey: 42
        };
        const actualParam = {
            someKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        // TODO: Check violation
    });

    it("should return a violation list when two equal objects with different value types are passed", () => {
        const expectedParam = {
            someKey: "someValue"
        };
        const actualParam = {
            someKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        // TODO: Check violation
    });

    it("should return an empty violation list when two equal objects are passed with matching String wildcard property", () => {
        const expectedParam = {
            someKey: "<anyString>"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with non-matching String wildcard property", () => {
        const expectedParam = {
            someKey: "<anyString>"
        };
        const actualParam = {
            someKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with matching number wildcard property", () => {
        const expectedParam = {
            someKey: "<anyNumber>"
        };
        const actualParam = {
            someKey: 42
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects are passed with non-matching number wildcard property", () => {
        const expectedParam = {
            someKey: "<anyNumber>"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return a violation list when a non-supported wildcard is used", () => {
        const expectedParam = {
            someKey: "<anyBoolean>"
        };
        const actualParam = {
            someKey: false
        };

        const result = deepCompare(expectedParam, actualParam);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return a violation list when second object does not have required property", () => {
        const expectedParam = {
            someKey: 42
        };
        const actualParam = {
            anotherKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with equal nested objects", () => {
        const expectedParam = {
            someKey: {
                anotherKey: "anotherValue"
            }
        };
        const actualParam = {
            someKey: {
                anotherKey: "anotherValue"
            }
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects are passed with nested object that does not have required property", () => {
        const expectedParam = {
            someKey: {
                anotherKey: "anotherValue"
            }
        };
        const actualParam = {
            otherKey: {
                anotherKey: "anotherValue"
            }
        };

        const result = deepCompare(expectedParam, actualParam);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with equal nested arrays", () => {
        const expectedParam = {
            someKey: [
                "someValue",
                "anotherValue",
            ]
        };
        const actualParam = {
            someKey: [
                "someValue",
                "anotherValue"
            ]
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects are passed with nested array that does not have required property", () => {
        const expectedParam = {
            someKey: {
                anotherKey: "anotherValue"
            }
        };
        const actualParam = {
            otherKey: {
                anotherKey: "anotherValue"
            }
        };

        const result = deepCompare(expectedParam, actualParam);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return a violation list when two equal objects with equal case-sensitive values are passed", () => {
        const expectedParam = {
            SomeKey: "someValue"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        // TODO: Check violation
    });
    //

    it("should return an empty violation list when two equal objects with equal string values are passed", () => {
        const expectedParam = {
            someKey: "someValue"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects with different string values are passed", () => {
        const expectedParam = {
            someKey: "someValue"
        };
        const actualParam = {
            someKey: "anotherValue"
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        // TODO: Check violation
    });

    it("should return an empty violation list when two equal objects with equal numbers values are passed", () => {
        const expectedParam = {
            someKey: 42
        };
        const actualParam = {
            someKey: 42
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects with different numbers values are passed", () => {
        const expectedParam = {
            someKey: 42
        };
        const actualParam = {
            someKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.not.be.empty;
        // TODO: Check violation
    });

    it("should return a violation list when two equal objects with different value types are passed", () => {
        const expectedParam = {
            someKey: "someValue"
        };
        const actualParam = {
            someKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.not.be.empty;
        // TODO: Check violation
    });

    it("should return an empty violation list when two equal objects are passed with matching String wildcard property", () => {
        const expectedParam = {
            someKey: "<anyString>"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with non-matching String wildcard property", () => {
        const expectedParam = {
            someKey: "<anyString>"
        };
        const actualParam = {
            someKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam, false);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with matching number wildcard property", () => {
        const expectedParam = {
            someKey: "<anyNumber>"
        };
        const actualParam = {
            someKey: 42
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects are passed with non-matching number wildcard property", () => {
        const expectedParam = {
            someKey: "<anyNumber>"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam, false);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return a violation list when a non-supported wildcard is used", () => {
        const expectedParam = {
            someKey: "<anyBoolean>"
        };
        const actualParam = {
            someKey: false
        };

        const result = deepCompare(expectedParam, actualParam, false);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return a violation list when second object does not have required property", () => {
        const expectedParam = {
            someKey: 42
        };
        const actualParam = {
            anotherKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam, false);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with equal nested objects", () => {
        const expectedParam = {
            someKey: {
                anotherKey: "anotherValue"
            }
        };
        const actualParam = {
            someKey: {
                anotherKey: "anotherValue"
            }
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects are passed with nested object that does not have required property", () => {
        const expectedParam = {
            someKey: {
                anotherKey: "anotherValue"
            }
        };
        const actualParam = {
            otherKey: {
                anotherKey: "anotherValue"
            }
        };

        const result = deepCompare(expectedParam, actualParam, false);

        // TODO: Check violation
        expect(result).to.not.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with equal nested arrays", () => {
        const expectedParam = {
            someKey: [
                "someValue",
                "anotherValue",
            ]
        };
        const actualParam = {
            someKey: [
                "someValue",
                "anotherValue"
            ]
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects are passed with nested array that does not have required property", () => {
        const expectedParam = {
            someKey: {
                anotherKey: "anotherValue"
            }
        };
        const actualParam = {
            otherKey: {
                anotherKey: "anotherValue"
            }
        };

        const result = deepCompare(expectedParam, actualParam, false);

        // TODO: Check violation
        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
    });

    it("should return a violation list when two equal objects with equal case-sensitive values are passed", () => {
        const expectedParam = {
            SomeKey: "someValue"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.be.empty;
    });
});

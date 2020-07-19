const chai = require("chai");
const expect = chai.expect;
const Logging = require("../../src/logging/logging.js");
const WildcardGenerator = require("../../src/parsing/wildcard-generator.js");
const TESTLOGGER = new Logging("error", false, false);

describe("WildcardGenerator", () => {
    const supportedValues = [
        "<generate[string]>",
        "<generate[string(length=64)]>",
        "<generate[number]>",
        "<generate[number(max=31)]>",
        "<generate[number(min=10)]>",
        "<generate[number(min=10;max=31)]>",
        "<generate[bool]>",
        "<generate[uuid]>"
    ];
    const unsupportedValues = [
        "<generate[problem]>",
        "<generate[problem(this=test)]>",
        "some string that is not supported",
        1,
        true,
        "weOnlySupportGenerate[]stuff"
    ]

    describe("isGenerateWildcard", () => {
        // Define test case for each supported value
        supportedValues.forEach((testValue) => {
            it("should return true when given " + testValue, () => {
                const generator = new WildcardGenerator(TESTLOGGER);

                const result = generator.isGenerateWildcard(testValue)

                expect(result).to.be.true;
            });
        });

        // Failing cases
        unsupportedValues.forEach((problemCase) => {
            it("should return false when given " + problemCase, () => {
                const generator = new WildcardGenerator(TESTLOGGER);

                const result = generator.isGenerateWildcard(problemCase)

                expect(result).to.be.false;
            });
        });
    });

    describe("generateWildcardValue", () => {
        it("should replace a value with a random string when request contains generator keyword for string", () => {
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue("<generate[string]>")

            expect(result).to.not.contain("generate");
            expect(result).to.not.contain("string");
            expect(typeof result).to.equal("string");
            expect(result.length).to.equal(10);
        });

        it("should replace a value with a random string when request contains generator keyword for string with length param", () => {
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue("<generate[string(length=64)]>")

            expect(result).to.not.contain("generate");
            expect(result).to.not.contain("string");
            expect(result).to.not.contain("length");
            expect(typeof result).to.equal("string");
            expect(result.length).to.equal(64);
        });

        it("should replace a value with a random number when request contains generator keyword for number", () => {
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue("<generate[number]>")

            expect(typeof result).to.equal("number");
            expect(result).to.be.at.least(1);
            expect(result).to.be.at.most(9_999_999);
        });

        it("should replace a value with a random number when request contains generator keyword for number with max param", () => {
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue("<generate[number(max=31)]>")

            expect(typeof result).to.equal("number");
            expect(result).to.be.at.least(1);
            expect(result).to.be.at.most(31);
        });

        it("should replace a value with a random number when request contains generator keyword for number with min param", () => {
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue("<generate[number(min=10)]>")

            expect(typeof result).to.equal("number");
            expect(result).to.be.at.least(10);
            expect(result).to.be.at.most(9_999_999);
        });

        it("should replace a value with a random number when request contains generator keyword for number with two params", () => {
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue("<generate[number(min=10;max=31)]>")

            expect(typeof result).to.equal("number");
            expect(result).to.be.at.least(10);
            expect(result).to.be.at.most(31);
        });

        it("should replace a value with a random number when request contains generator keyword for number with two params where min > max", () => {
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue("<generate[number(min=31;max=10)]>")

            expect(typeof result).to.equal("number");
            expect(result).to.be.at.least(10);
            expect(result).to.be.at.most(31);
        });

        it("should replace a value with a random boolean when request contains generator keyword for boolean", () => {
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue("<generate[bool]>")

            expect(typeof result).to.equal("boolean");
        });

        it("should replace a value with a random UUID when request contains generator keyword for uuid", () => {
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue("<generate[uuid]>");

            expect(result).to.not.contain("generate");
            expect(result).to.not.contain("uuid");
            expect(typeof result).to.equal("string");
        });

        it("should not replace a value with a random value when request contains unsupported generator keyword", () => {
            const keyword = "<generate[problem]>"
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue(keyword)

            expect(result).to.equal(keyword);
        });

        it("should not replace a value with a random value when request contains unsupported generator keyword", () => {
            const keyword = "<generate[problem(this=test)]>"
            const generator = new WildcardGenerator(TESTLOGGER);

            let result = generator.generateWildcardValue(keyword)

            expect(result).to.equal(keyword);
        });
    });
});
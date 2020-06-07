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
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("someValue");
        expect(violation.actual).to.equal("anotherValue");
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
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal(42);
        expect(violation.actual).to.equal(1337);
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
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("type of 'someKey'");
        expect(violation.expected).to.equal("string");
        expect(violation.actual).to.equal("number");
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

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("any string");
        expect(violation.actual).to.equal("number");
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

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("any number");
        expect(violation.actual).to.equal("string");
    });

    it("should return an empty violation list when two equal objects are passed with matching boolean wildcard property", () => {
        const expectedParam = {
            someKey: "<anyBool>"
        };
        const actualParam = {
            someKey: true
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects are passed with non-matching boolean wildcard property", () => {
        const expectedParam = {
            someKey: "<anyBool>"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("any boolean");
        expect(violation.actual).to.equal("string");
    });

    it("should return a violation list when a non-supported wildcard is used", () => {
        const expectedParam = {
            someKey: "<anyThing>"
        };
        const actualParam = {
            someKey: false
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("<anyThing>");
        expect(violation.actual).to.equal("not supported");
    });

    it("should return a violation list when second object does not have required property", () => {
        const expectedParam = {
            someKey: 42
        };
        const actualParam = {
            anotherKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("present");
        expect(violation.actual).to.equal("missing");
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

    it("should return an empty violation list when two equal objects are passed with equal nested objects containing string wildcard", () => {
        const expectedParam = {
            someKey: {
                anotherKey: "<anyString>"
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

    it("should return an empty violation list when two equal objects are passed with equal nested objects containing number wildcard", () => {
        const expectedParam = {
            someKey: {
                anotherKey: "<anyNumber>"
            }
        };
        const actualParam = {
            someKey: {
                anotherKey: 1337
            }
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with equal nested objects containing boolean wildcard", () => {
        const expectedParam = {
            someKey: {
                anotherKey: "<anyBool>"
            }
        };
        const actualParam = {
            someKey: {
                anotherKey: true
            }
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with equal deeper nested objects", () => {
        const expectedParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500,
                    unit: "kcal"
                }
            },
            price: 5,
            quantity: 2
        };
        const actualParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500,
                    unit: "kcal"
                }
            },
            price: 5,
            quantity: 2
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with equal deeper nested objects containing string wildcard", () => {
        const expectedParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500,
                    unit: "<anyString>"
                }
            },
            price: 5,
            quantity: 2
        };
        const actualParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500,
                    unit: "kcal"
                }
            },
            price: 5,
            quantity: 2
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with equal deeper nested objects containing number wildcard", () => {
        const expectedParam = {
            product: {
                name: "Burger",
                calories: {
                    value: "<anyNumber>",
                    unit: "kcal"
                }
            },
            price: 5,
            quantity: 2
        };
        const actualParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500,
                    unit: "kcal"
                }
            },
            price: 5,
            quantity: 2
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with equal deeper nested objects containing boolean wildcard", () => {
        const expectedParam = {
            product: {
                name: "Burger",
                calories: {
                    value: "<anyNumber>",
                    unit: "kcal",
                    isExact: "<anyBool>"
                }
            },
            price: 5,
            quantity: 2
        };
        const actualParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500,
                    unit: "kcal",
                    isExact: false
                }
            },
            price: 5,
            quantity: 2
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

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("present");
        expect(violation.actual).to.equal("missing");
    });

    it("should return an empty violation list when two equal objects are passed with equal nested arrays", () => {
        const expectedParam = {
            someKey: [
                "someValue",
                "anotherValue"
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

    it("should return an empty violation list when two equal objects are passed with equal nested arrays containing string wildcard", () => {
        const expectedParam = {
            someKey: [
                "someValue",
                "<anyString>"
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

    it("should return an empty violation list when two equal objects are passed with equal nested arrays containing number wildcard", () => {
        const expectedParam = {
            someKey: [
                "someValue",
                "<anyNumber>"
            ]
        };
        const actualParam = {
            someKey: [
                "someValue",
                1337
            ]
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with equal nested arrays containing boolean wildcard", () => {
        const expectedParam = {
            someKey: [
                "someValue",
                "<anyBool>"
            ]
        };
        const actualParam = {
            someKey: [
                "someValue",
                false
            ]
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects are passed with nested array that does not have required property", () => {
        const expectedParam = {
            someKey: [
                "someValue"
            ]
        };
        const actualParam = {
            someKey: [
                "anotherValue"
            ]
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("someValue");
        expect(violation.actual).to.equal("missing");
    });

    it("should return an empty violation list when two equal objects are passed with nested arrays that contain equal objects", () => {
        const expectedParam = {
            someKey: [
                {
                    product: "Burger",
                    quantity: 2,
                    price: 10
                },
                {
                    product: "Fries",
                    quantity: 1,
                    price: 5
                },
            ]
        };
        const actualParam = {
            someKey: [
                {
                    product: "Burger",
                    quantity: 2,
                    price: 10
                },
                {
                    product: "Fries",
                    quantity: 1,
                    price: 5
                },
            ]
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.be.empty;
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
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("SomeKey");
        expect(violation.expected).to.equal("present");
        expect(violation.actual).to.equal("missing");
    });

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
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("someValue");
        expect(violation.actual).to.equal("anotherValue");
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
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal(42);
        expect(violation.actual).to.equal(1337);
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
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("type of 'someKey'");
        expect(violation.expected).to.equal("string");
        expect(violation.actual).to.equal("number");
    });

    it("should return an empty violation list when two equal objects are passed with matching string wildcard property", () => {
        const expectedParam = {
            someKey: "<anyString>"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.be.empty;
    });

    it("should return an empty violation list when two equal objects are passed with non-matching string wildcard property", () => {
        const expectedParam = {
            someKey: "<anyString>"
        };
        const actualParam = {
            someKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("any string");
        expect(violation.actual).to.equal("number");
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

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("any number");
        expect(violation.actual).to.equal("string");
    });

    it("should return an empty violation list when two equal objects are passed with matching boolean wildcard property", () => {
        const expectedParam = {
            someKey: "<anyBool>"
        };
        const actualParam = {
            someKey: true
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.be.empty;
    });

    it("should return a violation list when two equal objects are passed with non-matching boolean wildcard property", () => {
        const expectedParam = {
            someKey: "<anyBool>"
        };
        const actualParam = {
            someKey: "someValue"
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("any boolean");
        expect(violation.actual).to.equal("string");
    });

    it("should return a violation list when a non-supported wildcard is used", () => {
        const expectedParam = {
            someKey: "<anyThing>"
        };
        const actualParam = {
            someKey: false
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("<anyThing>");
        expect(violation.actual).to.equal("not supported");
    });

    it("should return a violation list when second object does not have required property", () => {
        const expectedParam = {
            someKey: 42
        };
        const actualParam = {
            anotherKey: 1337
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("present");
        expect(violation.actual).to.equal("missing");
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
            someKey: {
                otherKey: "anotherValue"
            }
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey.anotherKey");
        expect(violation.expected).to.equal("present");
        expect(violation.actual).to.equal("missing");
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
            someKey: [
                "someValue"
            ]
        };
        const actualParam = {
            someKey: [
                "anotherValue"
            ]
        };

        const result = deepCompare(expectedParam, actualParam, false);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("someKey");
        expect(violation.expected).to.equal("someValue");
        expect(violation.actual).to.equal("missing");
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

    it("should return a violation with correct name when two equal objects are passed with deeper nested object that does not have required property", () => {
        const expectedParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500,
                    unit: "kcal"
                }
            },
            price: 5,
            quantity: 2
        };
        const actualParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500
                }
            },
            price: 5,
            quantity: 2
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("product.calories.unit");
        expect(violation.expected).to.equal("present");
        expect(violation.actual).to.equal("missing");
    });

    it("should return a violation with correct name when two equal objects are passed with deeper nested object that does not have required property type", () => {
        const expectedParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500,
                    unit: "kcal"
                }
            },
            price: 5,
            quantity: 2
        };
        const actualParam = {
            product: {
                name: "Burger",
                calories: {
                    value: "500",
                    unit: "kcal"
                }
            },
            price: 5,
            quantity: 2
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("type of 'product.calories.value'");
        expect(violation.expected).to.equal("number");
        expect(violation.actual).to.equal("string");
    });

    it("should return a violation with correct name when two equal objects are passed with deeper nested object that does not have required property value", () => {
        const expectedParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500,
                    unit: "kcal"
                }
            },
            price: 5,
            quantity: 2
        };
        const actualParam = {
            product: {
                name: "Burger",
                calories: {
                    value: 500,
                    unit: "joules"
                }
            },
            price: 5,
            quantity: 2
        };

        const result = deepCompare(expectedParam, actualParam);

        expect(result).to.not.be.empty;
        expect(result).to.have.lengthOf(1);
        let violation = result[0];
        expect(violation.key).to.equal("product.calories.unit");
        expect(violation.expected).to.equal("kcal");
        expect(violation.actual).to.equal("joules");
    });
});

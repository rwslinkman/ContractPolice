const expect = require("chai").expect;
const generateValueBySchema = require("../../src/generation/shared-generation.js").generateValueBySchema;


describe("Shared generator functions", () => {

    describe("generating schemas without wildcards", () => {
        it("should generate a value by given schema of object with string property", () => {
            const schema = {
                properties: {
                    username: {
                        type: "string"
                    }
                }
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("username")).to.equal(true);
            expect(typeof result.username).to.equal("string");
            expect(result.username.length).to.be.greaterThan(0);
        });

        it("should generate a value by given schema of object with integer property", () => {
            const schema = {
                properties: {
                    userId: {
                        type: "integer"
                    }
                }
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("userId")).to.equal(true);
            console.log(typeof result.userId);
            let generatedType = typeof result.userId;
            expect(generatedType).to.equal("number");
            expect(result.userId).to.be.greaterThan(0);
        });

        it("should generate a value by given schema of object with boolean property", () => {
            const schema = {
                properties: {
                    isAdmin: {
                        type: "boolean"
                    }
                }
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("isAdmin")).to.equal(true);
            expect(typeof result.isAdmin).to.equal("boolean");
        });

        it("should generate a value by given schema of object with object property", () => {
            const schema = {
                properties: {
                    userObj: {
                        properties: {
                            isAdmin: {
                                type: "boolean"
                            }
                        }
                    }
                }
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("userObj")).to.equal(true);
            expect(result.userObj).to.be.a("object");
        });

        it("should generate a value by given schema of object with string array property", () => {
            const schema = {
                properties: {
                    admins: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                }
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("admins")).to.equal(true);
            expect(result.admins).to.be.a("array");
            expect(result.admins.length).to.equal(1);
            expect(result.admins[0]).to.be.a("string");
            expect(result.admins[0].length).to.be.greaterThan(0);
        });

        it("should generate a value by given schema of object with number array property", () => {
            const schema = {
                properties: {
                    admins: {
                        type: "array",
                        items: {
                            type: "integer"
                        }
                    }
                }
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("admins")).to.equal(true);
            expect(result.admins).to.be.a("array");
            expect(result.admins.length).to.equal(1);
            expect(result.admins[0]).to.be.a("number");
            expect(result.admins[0]).to.be.greaterThan(0);
        });

        it("should generate a value by given schema of object with boolean array property", () => {
            const schema = {
                properties: {
                    admins: {
                        type: "array",
                        items: {
                            type: "boolean"
                        }
                    }
                }
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("admins")).to.equal(true);
            expect(result.admins).to.be.a("array");
            expect(result.admins.length).to.equal(1);
            expect(result.admins[0]).to.be.a("boolean");
        });

        it("should generate a value by given schema of string", () => {
            const schema = {
                type: "string"
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("string");
            expect(result.length).to.be.greaterThan(0);
        });

        it("should generate a value by given schema of integer", () => {
            const schema = {
                type: "integer"
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("number");
            expect(result).to.be.greaterThan(0);
        });

        it("should generate a value by given schema of boolean", () => {
            const schema = {
                type: "boolean"
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("boolean");
        });

        it("should generate a value by given schema of object type", () => {
            const schema = {
                type: "object",
                properties: {
                    username: {
                        type: "string"
                    }
                },
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("username")).to.equal(true);
            expect(typeof result.username).to.equal("string");
            expect(result.username.length).to.be.greaterThan(0);
        });

        it("should generate a value by given schema of array type", () => {
            const schema = {
                type: "array",
                items: {
                    type: "string"
                }
            };

            let result = generateValueBySchema(schema, false);

            expect(result).to.not.be.null;
            expect(result).to.be.a("array");
            expect(result.length).to.equal(1);
            expect(result[0].length).to.be.greaterThan(0);
        });
    });

    // TODO: check for any
    describe("generating schemas using wildcards", () => {
        it("should generate a value by given schema of object with string property", () => {
            const schema = {
                properties: {
                    username: {
                        type: "string"
                    }
                }
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("username")).to.equal(true);
            expect(typeof result.username).to.equal("string");
            expect(result.username.length).to.be.greaterThan(0);
        });

        it("should generate a value by given schema of object with integer property", () => {
            const schema = {
                properties: {
                    userId: {
                        type: "integer"
                    }
                }
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("userId")).to.equal(true);
            expect(typeof result.userId).to.equal("string");
            expect(result.userId).to.equal("<anyNumber>");
        });

        it("should generate a value by given schema of object with boolean property", () => {
            const schema = {
                properties: {
                    isAdmin: {
                        type: "boolean"
                    }
                }
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("isAdmin")).to.equal(true);
            expect(result.isAdmin).to.equal("<anyBool>");
        });

        it("should generate a value by given schema of object with string array property", () => {
            const schema = {
                properties: {
                    admins: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                }
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("admins")).to.equal(true);
            expect(result.admins).to.be.a("array");
            expect(result.admins.length).to.equal(1);
            expect(result.admins[0]).to.be.a("string");
            expect(result.admins[0]).to.equal("<anyString>");
        });

        it("should generate a value by given schema of object with number array property", () => {
            const schema = {
                properties: {
                    admins: {
                        type: "array",
                        items: {
                            type: "integer"
                        }
                    }
                }
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("admins")).to.equal(true);
            expect(result.admins).to.be.a("array");
            expect(result.admins.length).to.equal(1);
            expect(result.admins[0]).to.be.a("string");
            expect(result.admins[0]).to.equal("<anyNumber>");
        });

        it("should generate a value by given schema of object with boolean array property", () => {
            const schema = {
                properties: {
                    admins: {
                        type: "array",
                        items: {
                            type: "boolean"
                        }
                    }
                }
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("admins")).to.equal(true);
            expect(result.admins).to.be.a("array");
            expect(result.admins.length).to.equal(1);
            expect(result.admins[0]).to.be.a("string");
            expect(result.admins[0]).to.equal("<anyBool>");
        });

        it("should generate a value by given schema of string", () => {
            const schema = {
                type: "string"
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("string");
            expect(result.length).to.be.greaterThan(0);
        });

        it("should generate a value by given schema of integer", () => {
            const schema = {
                type: "integer"
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("string");
            expect(result).to.equal("<anyNumber>");
        });

        it("should generate a value by given schema of boolean", () => {
            const schema = {
                type: "boolean"
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("string");
            expect(result).to.equal("<anyBool>");
        });

        it("should generate a value by given schema of object type", () => {
            const schema = {
                type: "object",
                properties: {
                    username: {
                        type: "string"
                    }
                },
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("object");
            expect(result.hasOwnProperty("username")).to.equal(true);
            expect(typeof result.username).to.equal("string");
            expect(result.username).to.be.equal("<anyString>");
        });

        it("should generate a value by given schema of array type", () => {
            const schema = {
                type: "array",
                items: {
                    type: "string"
                }
            };

            let result = generateValueBySchema(schema, true);

            expect(result).to.not.be.null;
            expect(result).to.be.a("array");
            expect(result.length).to.equal(1);
            expect(result[0]).to.equal("<anyString>");
        });
    });

    //region special cases
    it("should generate a value by given schema of object with 'configuration' property, not using wildcards", () => {
        const schema = {
            properties: {
                configuration: "anything"
            }
        };

        let result = generateValueBySchema(schema, false);

        expect(result).to.not.be.null;
        expect(result).to.be.a("object");
    });

    it("should return 'unsupportedSchema' when given an empty schema", () => {
        const schema = {
        };

        let result = generateValueBySchema(schema, false);

        expect(result).to.equal("unsupportedSchema")
    });

    it("should return 'unsupportedSchema[someType]' when given an empty schema of some type", () => {
        const schema = {
            type: "someType"
        };

        let result = generateValueBySchema(schema, false);

        expect(result).to.equal("unsupportedSchema[someType]")
    });

    it("should return an unsupported value given schema of object type with 'additionalProperties', not using wildcards", () => {
        const schema = {
            type: "object",
            properties: {
                username: {
                    type: "object",
                    additionalProperties: []
                }
            }
        };

        let result = generateValueBySchema(schema, false);

        expect(result).to.not.be.null;
        expect(result).to.be.a("object");
        expect(result.hasOwnProperty("username"))
        expect(result.username).to.equal("unsupportedPropType[map]")
    });

    it("should return an unsupported value for anyOf properties", () => {
        const schema = {
            properties: {
                username: {
                    anyOf: {
                        type: "someType"
                    }
                }
            }
        };

        let result = generateValueBySchema(schema, false);

        expect(result).to.not.be.null;
        expect(result).to.be.a("object");
        expect(result.hasOwnProperty("username")).to.equal(true);
        expect(result.username).to.be.a("string");
        expect(result.username).to.equal("unsupported[anyOf]");
    });

    it("should return an unsupported value for empty properties", () => {
        const schema = {
            properties: {
                username: {
                }
            }
        };

        let result = generateValueBySchema(schema, false);

        expect(result).to.not.be.null;
        expect(result).to.be.a("object");
        expect(result.hasOwnProperty("username")).to.equal(true);
        expect(result.username).to.be.a("string");
        expect(result.username).to.equal("unsupportedProperty[username]");
    });
    //endregion
});
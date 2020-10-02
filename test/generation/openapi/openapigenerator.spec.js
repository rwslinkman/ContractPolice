const OpenApiGenerator = require("../../../src/generation/openapi/openapigenerator");
const Logging = require("../../../src/logging/logging.js");
const expect = require("chai").expect;

describe("OpenAPIGenerator", () => {
    const testLogger = new Logging(false);

    describe("generate", () => {
        it("should generate no contracts when given a empty OpenAPI definition", () => {
            const openApiDefinition = {
                openapi: "3.1.0",
                paths: {}
            };

            const generator = new OpenApiGenerator(testLogger);
            let result = generator.generate(openApiDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(0);
        });

        it("should generate a contracts when given a basic OpenAPI definition", () => {
            const openApiDefinition = {
                openapi: "3.1.0",
                paths: {
                    "/profile": {
                        "get": {
                            "operationId": "getProfile",
                            "responses": {
                                "200": {}
                            }
                        }
                    }
                }
            };

            const generator = new OpenApiGenerator(testLogger);
            let result = generator.generate(openApiDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contracts when given a basic OpenAPI definition with summary", () => {
            const openApiDefinition = {
                openapi: "3.1.0",
                paths: {
                    "/profile": {
                        "get": {
                            "summary": "Gets all profiles",
                            "responses": {
                                "200": {}
                            }
                        }
                    }
                }
            };

            const generator = new OpenApiGenerator(testLogger);
            let result = generator.generate(openApiDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contracts when given a basic OpenAPI definition without summary or operationId", () => {
            const openApiDefinition = {
                openapi: "3.1.0",
                paths: {
                    "/profile": {
                        "get": {
                            "responses": {
                                "200": {}
                            }
                        }
                    }
                }
            };

            const generator = new OpenApiGenerator(testLogger);
            let result = generator.generate(openApiDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contract when given a basic OpenAPI definition with parameters", () => {
            const openApiDefinition = {
                openapi: "3.1.0",
                paths: {
                    "/profile/{id}": {
                        "get": {
                            "operationId": "getProfileById",
                            "responses": {
                                "200": {}
                            }
                        },
                        "parameters": [{
                            "in": "path",
                            "name": "userId",
                            "type": "string"
                        }],
                    }
                }
            };

            const generator = new OpenApiGenerator(testLogger);
            let result = generator.generate(openApiDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contracts when given a basic OpenAPI definition with a request body", () => {
            const openApiDefinition = {
                openapi: "3.1.0",
                paths: {
                    "/profile": {
                        "post": {
                            "requestBody": {
                                "content": {
                                    "application/json": {
                                        "schema": {}
                                    }
                                }
                            },
                            "responses": {
                                "200": {}
                            }
                        }
                    }
                }
            };

            const generator = new OpenApiGenerator(testLogger);
            let result = generator.generate(openApiDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contracts when given a basic OpenAPI definition with a response body", () => {
            const openApiDefinition = {
                openapi: "3.1.0",
                paths: {
                    "/profile": {
                        "post": {
                            "requestBody": {
                                "content": {
                                    "application/json": {
                                        "schema": {}
                                    }
                                }
                            },
                            "responses": {
                                "200": {
                                    "content": {
                                        "application/json": {
                                            "schema": {}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            const generator = new OpenApiGenerator(testLogger);
            let result = generator.generate(openApiDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contracts when given a basic OpenAPI definition with a 'default' statusCode", () => {
            const openApiDefinition = {
                openapi: "3.1.0",
                paths: {
                    "/profile": {
                        "post": {
                            "requestBody": {
                                "content": {
                                    "application/json": {
                                        "schema": {}
                                    }
                                }
                            },
                            "responses": {
                                "200": {
                                    "content": {
                                        "application/json": {
                                            "schema": {}
                                        }
                                    }
                                },
                                "default": {
                                    "content": {
                                        "application/json": {
                                            "schema": {}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            const generator = new OpenApiGenerator(testLogger);
            let result = generator.generate(openApiDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });
    });
});
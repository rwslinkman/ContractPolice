const SwaggerGenerator = require("../../../src/generation/swagger/swaggergenerator");
const Logging = require("../../../src/logging/logging.js");
const expect = require("chai").expect;

describe("SwaggerGenerator", () => {
    const testLogger = new Logging(false);

    describe("generate", () => {
        it("should generate no contracts when given a empty Swagger definition", () => {
            const swaggerDefinition = {
                swagger: "2.0.0",
                paths: {}
            };

            const generator = new SwaggerGenerator(testLogger);
            let result = generator.generate(swaggerDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(0);
        });

        it("should generate a contracts when given a basic Swagger definition", () => {
            const swaggerDefinition = {
                swagger: "2.0.0",
                paths: {
                    "/profile": {
                        "get": {
                            "operationId": "getProfile",
                            "responses": {
                                "200": {
                                }
                            }
                        }
                    }
                }
            };

            const generator = new SwaggerGenerator(testLogger);
            let result = generator.generate(swaggerDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contracts when given a basic Swagger definition with summary", () => {
            const swaggerDefinition = {
                swagger: "2.0.0",
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

            const generator = new SwaggerGenerator(testLogger);
            let result = generator.generate(swaggerDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contracts when given a basic Swagger definition without summary or operationId", () => {
            const swaggerDefinition = {
                swagger: "2.0.0",
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

            const generator = new SwaggerGenerator(testLogger);
            let result = generator.generate(swaggerDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contract when given a basic Swagger definition with parameters", () => {
            const swaggerDefinition = {
                swagger: "2.0.0",
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

            const generator = new SwaggerGenerator(testLogger);
            let result = generator.generate(swaggerDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contracts when given a basic Swagger definition with a request body", () => {
            const swaggerDefinition = {
                swagger: "2.0.0",
                paths: {
                    "/profile": {
                        "post": {
                            "parameters": [{
                                "in": "body",
                                "name": "profile",
                                "schema": {}
                            }],
                            "responses": {
                                "200": {}
                            }
                        }
                    }
                }
            };

            const generator = new SwaggerGenerator(testLogger);
            let result = generator.generate(swaggerDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contracts when given a basic Swagger definition with a response body", () => {
            const swaggerDefinition = {
                swagger: "2.0.0",
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
                                    "schema": {}
                                }
                            }
                        }
                    }
                }
            };

            const generator = new SwaggerGenerator(testLogger);
            let result = generator.generate(swaggerDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });

        it("should generate a contracts when given a basic Swagger definition with a 'default' statusCode", () => {
            const swaggerDefinition = {
                swagger: "2.0.0",
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
                                    "schema": {}
                                },
                                "default": {
                                    "schema": {}
                                }
                            }
                        }
                    }
                }
            };

            const generator = new SwaggerGenerator(testLogger);
            let result = generator.generate(swaggerDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        });
    });
});
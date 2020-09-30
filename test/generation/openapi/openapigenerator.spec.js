const OpenApiGenerator = require("../../../src/generation/openapi/openapigenerator");
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

            const generator = new OpenApiGenerator(testLogger);
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

            const generator = new OpenApiGenerator(testLogger);
            let result = generator.generate(swaggerDefinition);

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
        })
    });
});
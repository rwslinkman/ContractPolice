const rewire = require("rewire");
const expect = require("chai").expect;
const stub = require("sinon").stub;
const ContractGenerator = rewire("../../src/generation/contractgenerator.js");

describe("ContractGenerator", () => {
    function generatorMock() {
        return {
            generate: stub().resolves()
        }
    }

    describe("generateContractDefinitions", () => {
        it("should return a Contract when an OpenAPI spec was given", async () => {
            let returnedFiles = [
                "/some/source/dir/openapi.yaml"
            ];
            let apiObject = {
                openapi: "3.1.0"
            };

            ContractGenerator.__set__({
                helper: {
                    getFiles: stub().resolves(returnedFiles)
                },
                SwaggerParser: {
                    dereference: stub().resolves(apiObject)
                },
                NullGenerator: generatorMock,
                SwaggerGenerator: generatorMock,
                OpenApiGenerator: generatorMock
            });

            const generator = new ContractGenerator();

            let result = await generator.generateContractDefinitions("/some/source/dir");

            expect(result).to.not.be.null;
            expect(result.length).to.equal(1);
        });

        it("should return a Contract when an Swagger spec was given", async () => {
            let returnedFiles = [
                "/some/source/dir/openapi.yaml"
            ];
            let apiObject = {
                swagger: "2.0.0"
            };

            ContractGenerator.__set__({
                helper: {
                    getFiles: stub().resolves(returnedFiles)
                },
                SwaggerParser: {
                    dereference: stub().resolves(apiObject)
                }
            });

            const generator = new ContractGenerator();

            let result = await generator.generateContractDefinitions("/some/source/dir");

            expect(result).to.not.be.null;
            expect(result.length).to.equal(1);
        });

        it("should return no Contracts when no files are found", async () => {
            let returnedFiles = [];

            ContractGenerator.__set__({
                helper: {
                    getFiles: stub().resolves(returnedFiles)
                },
            });
            const generator = new ContractGenerator();

            let result = await generator.generateContractDefinitions("/some/source/dir");

            expect(result).to.not.be.null;
            expect(result.length).to.equal(0);
        });

        it("should return no Contracts when only invalid files were provided", async () => {
            let returnedFiles = [
                "/some/source/dir/openapi.yaml"
            ];

            ContractGenerator.__set__({
                helper: {
                    getFiles: stub().resolves(returnedFiles)
                },
                SwaggerParser: {
                    dereference: stub().rejects(new Error("Nope"))
                }
            });
            const generator = new ContractGenerator();

            let result = await generator.generateContractDefinitions("/some/source/dir");

            expect(result).to.not.be.null;
            expect(result.length).to.equal(0);
        });
    });
});
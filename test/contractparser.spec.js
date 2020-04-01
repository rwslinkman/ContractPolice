const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");

chai.use(chaiAsPromised);
let expect = chai.expect;

const ContractParser = rewire("../src/contractparser.js");

describe("ContractParser", () => {
    describe("findContractFiles", () => {
        it("should return list of file names with YAML extension", () => {
            const readdirMock = function() {
                return [
                    "contract.yaml",
                    "hello/contract.yaml",
                    "hello/world/contract.yaml",
                ]
            };
            const statMock = function() {
                return {
                    isDirectory: function() { return false }
                };
            };
            ContractParser.__set__({
                "readdir": readdirMock,
                "stat": statMock,
            });

            const parser = new ContractParser();

            let result = parser.findContractFiles("some/directory");

            return expect(result).to.eventually.have.length(3);
        });

        it("should ignore files with non-YAML extension and return list of file names", () => {
            const readdirMock = function() {
                return [
                    "contract.yaml",
                    "hello/contract.yml",
                    "hello/world/contract.json",
                ]
            };
            const statMock = function() {
                return {
                    isDirectory: function() { return false }
                };
            };
            ContractParser.__set__({
                "readdir": readdirMock,
                "stat": statMock,
            });

            const parser = new ContractParser();

            let result = parser.findContractFiles("some/directory");

            return expect(result).to.eventually.have.length(2);
        });
    });

    describe("extractContractName", () => {
        it("should return the name of the file without YAML extension", () => {
            const fileName = "some/path/to/my-contract.yaml";

            const parser = new ContractParser();
            let result = parser.extractContractName(fileName);

            expect(result).to.equal("my-contract");
        });

        it("should return the name of the file with YAML extension", () => {
            const fileName = "some/path/to/my-contract.yaml";

            const parser = new ContractParser();
            let result = parser.extractContractName(fileName, false);

            expect(result).to.equal("my-contract.yaml");
        });
    });

    describe("parseContract", () => {
        function mockYamlLoading(yamlContent) {
            const fsMock = {
                readFileSync: function (fileName, options) {
                    return "";
                }
            };
            const yamlMock = {
                safeLoad: function (fileContents) {
                    return yamlContent;
                }
            };
            ContractParser.__set__({
                "fs": fsMock,
                "yaml": yamlMock
            });
        }

        it("should return the contract object when given valid input", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path"
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();
            let result = parser.parseContract("some/file.yaml");

            expect(result).to.equal(yamlContent.contract);
        });

        it("should throw an error when file does not contain a contract at all", () => {
            mockYamlLoading(null);

            const parser = new ContractParser();

            expect(() => parser.parseContract("some/my-file.yaml")).to.throw("my-file is not a valid contract");
        });

        it("should throw an error when file does not contain a contract object", () => {
            const yamlContent = {};
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();

            expect(() => parser.parseContract("some/my-file.yaml")).to.throw(`my-file does not contain a "contract"`);
        });

        it("should throw an error when contract does not contain a request object", () => {
            const yamlContent = {
                contract: {}
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();

            expect(() => parser.parseContract("some/my-file.yaml")).to.throw(`my-file does not contain a "contract.request"`);
        });

        it("should throw an error when contract.request does not contain a path object", () => {
            const yamlContent = {
                contract: {
                    request: {}
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();

            expect(() => parser.parseContract("some/my-file.yaml")).to.throw(`my-file does not contain a "contract.request.path"`);
        });

        it("should throw an error when contract does not contain a response object", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/v1/orders"
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();

            expect(() => parser.parseContract("some/my-file.yaml")).to.throw(`my-file does not contain a "contract.response"`);
        });

        it("should throw an error when contract.response does not contain a statusCode object", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/v1/orders"
                    },
                    response: {}
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();

            expect(() => parser.parseContract("some/my-file.yaml")).to.throw(`my-file does not contain a "contract.response.statusCode"`);
        });

        it("should normalize request headers to array when headers are specified as object", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();
            let result = parser.parseContract("some/file.yaml");

            expect(result.request.headers).to.deep.equal([
                { "Content-Type": "application/json" },
                { "Accept": "application/json" }
            ]);
        });

        it("should normalize request headers to array when headers are specified as array", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        headers: [
                            { "Content-Type": "application/json" },
                            { "Accept": "application/json" }
                        ]
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();
            let result = parser.parseContract("some/file.yaml");

            expect(result.request.headers).to.deep.equal([
                { "Content-Type": "application/json" },
                { "Accept": "application/json" }
            ]);
        });

        it("should throw an error when request headers are specified as non-object type", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        headers: "ContentType"
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();

            expect(() => parser.parseContract("some/file.yaml")).to.throw("Request header definition in file should be of type 'object' or 'array'");
        });

        it("should normalize response headers to array when headers are specified as object", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path"
                    },
                    response: {
                        statusCode: 200,
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        }
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();
            let result = parser.parseContract("some/file.yaml");

            expect(result.response.headers).to.deep.equal([
                { "Content-Type": "application/json" },
                { "Accept": "application/json" }
            ]);
        });

        it("should normalize response headers to array when headers are specified as array", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path"
                    },
                    response: {
                        statusCode: 200,
                        headers: [
                            { "Content-Type": "application/json" },
                            { "Accept": "application/json" }
                        ]
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();
            let result = parser.parseContract("some/file.yaml");

            expect(result.response.headers).to.deep.equal([
                { "Content-Type": "application/json" },
                { "Accept": "application/json" }
            ]);
        });

        it("should throw an error when response headers are specified as non-object type", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path"
                    },
                    response: {
                        statusCode: 200,
                        headers: "ContentType"
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();

            expect(() => parser.parseContract("some/file.yaml")).to.throw("Response header definition in file should be of type 'object' or 'array'");
        });
    })
});
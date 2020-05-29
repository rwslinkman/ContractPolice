const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");
const Logging = require("../../src/logging/logging.js");
const sinon = require("sinon");

chai.use(chaiAsPromised);
let expect = chai.expect;

const ContractParser = rewire("../../src/parsing/contractparser.js");
const TESTLOGGER = new Logging("error", false, false);

describe("ContractParser", () => {
    describe("findYamlFiles", () => {
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

            const parser = new ContractParser(TESTLOGGER);

            let result = parser.findYamlFiles("some/directory");

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

            const parser = new ContractParser(TESTLOGGER);

            let result = parser.findYamlFiles("some/directory");

            return expect(result).to.eventually.have.length(2);
        });
    });

    describe("parseContract", () => {
        const testBaseDir   = "/some/basepath/to/contracts";
        const testFilePath1 = `${testBaseDir}/contract1.yaml`
        const testFileName1 = "contract1"
        const testFilePath2 = `${testBaseDir}/v1/contract2.yaml`
        const testFileName2 = "v1/contract2"
        const testFilePath3 = `${testBaseDir}/v1/users/contract3.yaml`;
        const testFileName3 = "v1/users/contract3"

        function mockYamlLoading(yamlContent, resolveStub = sinon.stub()) {
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
                "yaml": yamlMock,
                "resolve": resolveStub
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

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath1);

            expect(result.data).to.equal(yamlContent.contract);
            expect(result.name).to.equal(testFileName1);
        });

        it("should return the contract object with correct name when given valid input", () => {
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

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath2);

            expect(result.data).to.equal(yamlContent.contract);
            expect(result.name).to.equal(testFileName2);
        });

        it("should return the contract object with correct name when given valid input with relative contracts directory", () => {
            const resolveStub = sinon.stub().returns(testBaseDir);
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
            mockYamlLoading(yamlContent, resolveStub);
            
            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract("contracts", testFilePath2);

            expect(result.data).to.equal(yamlContent.contract);
            expect(result.name).to.equal(testFileName2);
        });

        it("should return the contract object with correct (deep) name when given valid input", () => {
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

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.data).to.equal(yamlContent.contract);
            expect(result.name).to.equal(testFileName3);
        });

        it("should throw an error when file does not contain a contract at all", () => {
            mockYamlLoading(null);

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw("contract1 is not a valid contract");
        });

        it("should throw an error when file does not contain a contract object", () => {
            const yamlContent = {};
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw(`contract1 does not contain a "contract"`);
        });

        it("should throw an error when contract does not contain a request object", () => {
            const yamlContent = {
                contract: {}
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw(`contract1 does not contain a "contract.request"`);
        });

        it("should throw an error when contract.request does not contain a path object", () => {
            const yamlContent = {
                contract: {
                    request: {}
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw(`contract1 does not contain a "contract.request.path"`);
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

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw(`contract1 does not contain a "contract.response"`);
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

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw(`contract1 does not contain a "contract.response.statusCode"`);
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

            const parser = new ContractParser(TESTLOGGER);
            const result = parser.parseContract(testBaseDir, testFilePath1);

            expect(result.name).to.equal(testFileName1);
            const payload = result.data;
            expect(payload.request.headers).to.deep.equal([
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

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath1);

            expect(result.name).to.equal(testFileName1);
            const payload = result.data;
            expect(payload.request.headers).to.deep.equal([
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

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw("Request header definition in 'contract1' should be of type 'object' or 'array'");
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

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath1);

            expect(result.name).to.equal(testFileName1);
            const payload = result.data;
            expect(payload.response.headers).to.deep.equal([
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

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath1);

            expect(result.name).to.equal(testFileName1);
            const payload = result.data;
            expect(payload.response.headers).to.deep.equal([
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

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw("Response header definition in 'contract1' should be of type 'object' or 'array'");
        });
    })
});
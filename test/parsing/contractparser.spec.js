const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");
const Logging = require("../../src/logging/logging.js");
const sinon = require("sinon");
const helper = require("../../src/helper-functions.js");

chai.use(chaiAsPromised);
let expect = chai.expect;

const ContractParser = rewire("../../src/parsing/contractparser.js");
const TESTLOGGER = new Logging("error", false, false);

describe("ContractParser", () => {
    describe("findYamlFiles", () => {
        it("should return list of file names with YAML extension", async () => {
            let files = [
                "contract.yaml",
                "hello/contract.yaml",
                "hello/world/contract.yaml",
            ];
            const helperMock = {
                getFiles: function() {
                    return files;
                }
            };
            ContractParser.__set__({
                "helper": helperMock
            });

            const parser = new ContractParser(TESTLOGGER);

            let result = await parser.findYamlFiles("some/directory");

            expect(result).to.have.length(3);
        });

        it("should ignore files with non-YAML extension and return list of file names", async () => {
            let files = [
                "contract.yaml",
                "hello/contract.yml",
                "hello/world/contract.json",
            ];
            const helperMock = {
                getFiles: function() {
                    return files;
                }
            };
            ContractParser.__set__({
                "helper": helperMock
            });

            const parser = new ContractParser(TESTLOGGER);

            let result = await parser.findYamlFiles("some/directory");

            return expect(result).to.have.length(2);
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
                readFileSync: sinon.stub().returns("")
            };
            const yamlMock = {
                safeLoad: sinon.stub().returns(yamlContent)
            };
            ContractParser.__set__({
                "fs": fsMock,
                "yaml": yamlMock,
                "resolve": resolveStub,
                "helper": helper
            });
        }

        //region basic contract test
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

            expect(result.name).to.equal(testFileName1);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
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

            expect(result.name).to.equal(testFileName2);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
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

            expect(result.name).to.equal(testFileName2);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
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

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
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
        //endregion

        //region header tests
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

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath1);

            expect(result.name).to.equal(testFileName1);
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

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw("Definition of 'headers' in 'contract1' should be of type 'object' or 'array'");
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

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath1);

            expect(result.name).to.equal(testFileName1);
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

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw("Definition of 'headers' in 'contract1' should be of type 'object' or 'array'");
        });
        //endregion

        //region query parameters
        it("should normalize query parameters to array when params are specified as object", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        params: {
                            orderId: 1337,
                            token: "abcd"
                        }
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
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            expect(result.request.params).to.deep.equal([
                { "orderId": 1337 },
                { "token": "abcd" }
            ]);
        });

        it("should normalize query parameters to array when params are specified as array", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        params: [
                            { "orderId": 1337 },
                            { "token": "abcd" }
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
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            expect(result.request.params).to.deep.equal([
                { "orderId": 1337 },
                { "token": "abcd" }
            ]);
        });

        it("should throw an error when query parameters are specified as non-object type", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        params: "orderId=1337"
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);

            expect(() => parser.parseContract(testBaseDir, testFilePath1)).to.throw("Definition of 'params' in 'contract1' should be of type 'object' or 'array'");
        });
        //endregion

        //region value generation
        it("should replace a value with a random string when request contains generator keyword for string", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            username: "<generate[string]>"
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedValue = result.request.body.username;
            expect(generatedValue).to.not.contain("generate");
            expect(generatedValue).to.be.a("string");
        });

        it("should replace a value with a random string when request contains generator keyword for string with length param", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            username: "<generate[string(length=64)]>"
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedValue = result.request.body.username;
            expect(generatedValue).to.not.contain("generate");
            expect(generatedValue).to.be.a("string");
            expect(generatedValue.length).to.equal(64);
        });

        it("should replace a value with a random number when request contains generator keyword for number", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            username: "<generate[number]>"
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedValue = result.request.body.username;
            expect(generatedValue).to.be.a("number");
            expect(generatedValue).to.be.at.least(1);
            expect(generatedValue).to.be.at.most(9999999);
        });

        it("should replace a value with a random number when request contains generator keyword for number with max param", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            username: "<generate[number(max=31)]>"
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedValue = result.request.body.username;
            expect(generatedValue).to.be.a("number");
            expect(generatedValue).to.be.at.least(1);
            expect(generatedValue).to.be.at.most(31);
        });

        it("should replace a value with a random number when request contains generator keyword for number with min param", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            username: "<generate[number(min=10)]>"
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedValue = result.request.body.username;
            expect(generatedValue).to.be.a("number");
            expect(generatedValue).to.be.at.least(10);
            expect(generatedValue).to.be.at.most(9999999);
        });

        it("should replace a value with a random number when request contains generator keyword for number with two params", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            username: "<generate[number(min=10;max=31)]>"
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedValue = result.request.body.username;
            expect(generatedValue).to.be.a("number");
            expect(generatedValue).to.be.at.least(10);
            expect(generatedValue).to.be.at.most(31);
        });

        it("should replace a value with a random boolean when request contains generator keyword for boolean", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            username: "<generate[bool]>"
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedValue = result.request.body.username;
            expect(generatedValue).to.be.a("boolean");
        });

        it("should replace a value with a random UUID when request contains generator keyword for uuid", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            username: "<generate[uuid]>"
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedValue = result.request.body.username;
            expect(generatedValue).to.not.contain("generate");
            expect(generatedValue).to.contain("-");
        });

        it("should replace a value with a random string when deep property contains generator keyword for string", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            user: {
                                name: "<generate[string]>",
                                id: {
                                    type: "UUID",
                                    value: "<generate[uuid]>"
                                }
                            }
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedStringValue = result.request.body.user.name;
            expect(generatedStringValue).to.not.contain("generate");
            expect(generatedStringValue).to.be.a("string");
            const generatedUuidValue = result.request.body.user.id.value;
            expect(generatedUuidValue).to.not.contain("generate");
            expect(generatedUuidValue).to.be.a("string");
        });

        it("should replace a value with a random string when deep array property contains generator keyword for string", () => {
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            user: {
                                name: "<generate[string]>",
                                tokens: [
                                    "<generate[uuid]>",
                                    "<generate[uuid]>",
                                    "<generate[uuid]>"
                                ]
                            }
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedStringValue = result.request.body.user.name;
            expect(generatedStringValue).to.not.contain("generate");
            expect(generatedStringValue).to.be.a("string");
            const generatedArray = result.request.body.user.tokens;
            generatedArray.forEach(function(item) {
                expect(item).to.not.contain("generate");
                expect(item).to.be.a("string");
            });
        });

        it("should not replace a value with a random value when request contains unsupported generator keyword", () => {
            const keyword = "<generate[problem]>"
            const yamlContent = {
                contract: {
                    request: {
                        path: "/some/path",
                        body: {
                            username: keyword
                        }
                    },
                    response: {
                        statusCode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser(TESTLOGGER);
            let result = parser.parseContract(testBaseDir, testFilePath3);

            expect(result.name).to.equal(testFileName3);
            expect(result.request.path).to.equal(yamlContent.contract.request.path);
            expect(result.response.statusCode).to.equal(yamlContent.contract.response.statusCode);
            const generatedValue = result.request.body.username;
            expect(generatedValue).to.equal(keyword);
            expect(generatedValue).to.be.a("string");
        });
        //endregion
    })
});
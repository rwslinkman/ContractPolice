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
                        statuscode: 200
                    }
                }
            };
            mockYamlLoading(yamlContent);

            const parser = new ContractParser();
            let result = parser.parseContract("some/file.yaml");

            expect(result).to.equal(yamlContent.contract);
        });

        it("should throw an error when file does not contain a contract", () => {
            mockYamlLoading(null);

            const parser = new ContractParser();

            expect(() => parser.parseContract("some/my-file.yaml")).to.throw("my-file is not a valid contract");
        });
    })
});
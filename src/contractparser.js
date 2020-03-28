const fs = require('fs');
const yaml = require('js-yaml');
const {promisify} = require('util');
const {resolve} = require('path');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const helper = require("./helper-functions.js");

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

function isExist(arg) {
    try {
        return arg();
    } catch (e) {
        return false;
    }
}

function ContractParser() {
}

ContractParser.prototype.findContractFiles = function (directory) {
    return getFiles(directory)
        .then(function (files) {
            let contractFiles = [];
            files.forEach(function (file) {
                if (file.endsWith(".yaml") || file.endsWith(".yml")) {
                    contractFiles.push(file);
                }
            });
            return contractFiles;
        });
};

ContractParser.prototype.extractContractName = function (contractFile, stripExtension = true) {
    // TODO: Improve to keep directory structure for versioning
    let fileNameSplit = contractFile.split("/");
    let fileName = fileNameSplit[fileNameSplit.length - 1];
    if(stripExtension) {
        return fileName.replace(".yaml", "").replace(".yml", "");
    }
    return fileName
};

ContractParser.prototype.parseContract = function (contractFile) {
    let fileContents = fs.readFileSync(contractFile, 'utf8');
    let contractName = this.extractContractName(contractFile);
    let contractYaml = yaml.safeLoad(fileContents);

    // TODO: simplify YAML content validation
    // Verify that all required attributes are there
    if (contractYaml === null) {
        throw `${contractName} is not a valid contract`
    }
    if (!isExist(() => contractYaml.contract)) {
        throw `${contractName} does not contain a "contract"`;
    }
    if (!isExist(() => contractYaml.contract.request)) {
        throw `${contractName} does not contain a "contract.request"`;
    }
    if (!isExist(() => contractYaml.contract.request.path)) {
        throw `${contractName} does not contain a "contract.request.path"`;
    }
    if (!isExist(() => contractYaml.contract.response)) {
        throw `${contractName} does not contain a "contract.response"`;
    }
    if (!isExist(() => contractYaml.contract.response.statuscode)) {
        throw `${contractName} does not contain a "contract.response.statuscode"`;
    }

    // Verify within request
    let expectedRequest = contractYaml.contract.request;
    if(expectedRequest.hasOwnProperty("headers")) {
        let requestHeaders = contractYaml.contract.request.headers;
        if(typeof requestHeaders !== "object") {
            throw `Request header definition in ${contractName} should be of type 'object' or 'array'`;
        }

        // Formatting headers into desired format; supporting both Object an Array notation
        requestHeaders = helper.normalizeHeaders(requestHeaders);
        contractYaml.contract.request.headers = requestHeaders;
    }

    // Verify within response
    let expectedResponse = contractYaml.contract.response;
    if(expectedResponse.hasOwnProperty("headers")) {
        let responseHeaders = contractYaml.contract.response.headers;
        if(typeof responseHeaders !== "object") {
            throw `Response header definition in ${contractName} should be of type 'object' or 'array'`;
        }

        // Formatting headers into desired format; supporting both Object an Array notation
        responseHeaders = helper.normalizeHeaders(responseHeaders);
        contractYaml.contract.response.headers = responseHeaders;
    }

    return contractYaml.contract;
};

module.exports = ContractParser;
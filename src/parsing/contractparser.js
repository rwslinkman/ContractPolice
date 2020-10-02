const fs = require('fs');
const yaml = require('js-yaml');
const resolve = require('path').resolve;
const helper = require("../helper-functions.js");
const WildcardGenerator = require("./wildcard-generator.js");
const Contract = require("../model/contract.js");
const ContractRequest = require("../model/contractrequest.js");
const LOG_TAG = "ContractParser";

function hasDeepChild(obj, arg) {
    return arg
        .split(".")
        .reduce((obj, level) => obj && obj[level], obj);
}

function extractContractName(baseDir, contractFile) {
    let absoluteDir = baseDir.startsWith("/")
        ? baseDir
        : resolve(baseDir);

    let fileName = contractFile.replace(absoluteDir, "");
    if(fileName.startsWith("/")) {
        fileName = fileName.substr(1);
    }
    return fileName
        .replace(".yaml", "")
        .replace(".yml", "");
}

function normalizeObjectProperty(logger, target, propertyName, contractName) {
    if (target.hasOwnProperty(propertyName)) {
        let targetObject = target[propertyName];
        if (typeof targetObject !== "object") {
            throw `Definition of '${propertyName}' in '${contractName}' should be of type 'object' or 'array'`;
        }

        // Formatting headers into desired format; supporting both Object an Array notation
        targetObject = helper.normalizeObject(targetObject);
        target[propertyName] = targetObject;
        logger.debug(LOG_TAG, `Definition of '${propertyName}' in '${contractName}' have been normalized`);
    }
}

function injectGenerateWildcardValues(logger, target, contractName) {
    let wildcardGenerator = new WildcardGenerator();
    Object.keys(target).forEach(function (propName) {
        let value = target[propName];
        if (value !== null && typeof value === 'object') {
            if(Array.isArray(value)) {
                value.forEach(arrItem => {
                    if(typeof arrItem === "object") {
                        injectGenerateWildcardValues(logger, arrItem, contractName)
                    } else {
                        if (wildcardGenerator.isGenerateWildcard(arrItem)) {
                            // replace item
                            let wildcardValue = wildcardGenerator.generateWildcardValue(arrItem);
                            helper.replaceInArray(target[propName], arrItem, wildcardValue);
                        }
                    }
                });
                return;
            }
            injectGenerateWildcardValues(logger, value, contractName);
            return;
        }

        if (wildcardGenerator.isGenerateWildcard(value)) {
            target[propName] = wildcardGenerator.generateWildcardValue(value);
        }
    });
}

function convertToRequestModel(dataObj) {
    return new ContractRequest(
        dataObj.path,
        dataObj.method,
        dataObj.headers,
        dataObj.params,
        dataObj.body
    );
}

function ContractParser(logger) {
    this.logger = logger;
}

ContractParser.prototype.findYamlFiles = async function (directory) {
    const log = this.logger;
    log.info(LOG_TAG, `Searching "${directory}" for YAML files...`);
    let files = await helper.getFiles(directory)
    log.info(LOG_TAG, `Found ${files.length} files in directory`)
    let contractFiles = [];
    files.forEach(function (file) {
        if (file.endsWith(".yaml") || file.endsWith(".yml")) {
            log.debug(LOG_TAG, `YAML file "${file}" discovered`);
            contractFiles.push(file);
        }
    });
    log.info(LOG_TAG, `Found ${contractFiles.length} YAML files that may contain Contract Definitions`);
    return contractFiles;
};

ContractParser.prototype.parseContract = function (contractsDirectory, contractFile) {
    let fileContents = fs.readFileSync(contractFile, 'utf8');
    this.logger.debug(LOG_TAG, `Contract file ${contractFile}`);
    let contractName = extractContractName(contractsDirectory, contractFile);
    this.logger.info(LOG_TAG, `Reading Contract Definition of "${contractName}" file`)

    // Verify that all required attributes are there
    let contractYaml = yaml.safeLoad(fileContents);
    if (contractYaml === null) {
        throw `${contractName} is not a valid contract`
    }
    const expectedProperties = [
        "contract",
        "contract.request",
        "contract.request.path",
        "contract.response",
        "contract.response.statusCode"
    ];
    expectedProperties.forEach(function (property) {
        if (!hasDeepChild(contractYaml, property)) {
            throw `${contractName} does not contain a "${property}"`;
        }
    });
    // All expected properties exist, no error thrown.
    this.logger.debug(LOG_TAG, `File '${contractName}' contains a valid Contract Definition`);

    // Verify objects within request & response
    normalizeObjectProperty(this.logger, contractYaml.contract.request, "headers", contractName);
    normalizeObjectProperty(this.logger, contractYaml.contract.response, "headers", contractName);
    normalizeObjectProperty(this.logger, contractYaml.contract.request, "params", contractName);

    // Check request for <generate> wildcards and inject values there
    injectGenerateWildcardValues(this.logger, contractYaml.contract.request, contractName);

    let requestModel = convertToRequestModel(contractYaml.contract.request)
    return new Contract(contractName, requestModel, contractYaml.contract.response);
};

module.exports = ContractParser;
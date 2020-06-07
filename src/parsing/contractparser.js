const fs = require('fs');
const yaml = require('js-yaml');
const {promisify} = require('util');
const resolve = require('path').resolve;
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const helper = require("../helper-functions.js");
const LOG_TAG = "ContractParser";

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

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

function ContractParser(logger) {
    this.logger = logger;
}

ContractParser.prototype.findYamlFiles = function (directory) {
    const log = this.logger;
    log.info(LOG_TAG, `Searching "${directory}" for YAML files...`);
    return getFiles(directory)
        .then(function (files) {
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
        });
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

    // TODO: Check for <generate> and replace values

    return {
        name: contractName,
        data: contractYaml.contract
    };
};

module.exports = ContractParser;
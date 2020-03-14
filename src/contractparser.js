const fs = require('fs');
const yaml = require('js-yaml');
const {promisify} = require('util');
const {resolve} = require('path');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

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

ContractParser.prototype.extractContractName = function (contractFile) {
    let fileNameSplit = contractFile.split("/");
    let fileName = fileNameSplit[fileNameSplit.length - 1];
    return fileName.replace(".yaml", "").replace(".yml", "");
};

ContractParser.prototype.parseContract = function (contractFile) {
    let fileContents = fs.readFileSync(contractFile, 'utf8');
    let contractName = this.extractContractName(contractFile);
    let contractYaml = yaml.safeLoad(fileContents);

    // TODO: simplify YAML content validation
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

    return contractYaml.contract;
};

module.exports = ContractParser;
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const { promisify } = require('util');
const { resolve } = require('path');
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

function ContractParser() {

}

ContractParser.prototype.findContractFiles = function(directory) {
    return getFiles(directory)
        .then(function(files) {
            let contractFiles = [];
            files.forEach(function(file) {
                if(file.endsWith(".yaml") || file.endsWith(".yml")) {
                    contractFiles.push(file);
                }
            });
            return contractFiles;
        });
};

ContractParser.prototype.parseContract = function(contractFile) {
    let fileContents = fs.readFileSync(contractFile, 'utf8');
    return yaml.safeLoad(fileContents);
};

module.exports = ContractParser;
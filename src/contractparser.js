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

// ContractParser.prototype.walk = function(dir) {
//     return new Promise(function(done, fail) {
//         let results = [];
//         fs.readdir(dir, function(err, list) {
//             if (err) return fail(err);
//             let pending = list.length;
//             if (!pending) return done(results);
//             list.forEach(function(file) {
//                 file = path.resolve(dir, file);
//                 fs.stat(file, function(err, stat) {
//                     if (stat && stat.isDirectory()) {
//                         this.walk(file).then(function(res) {
//                             results = results.concat(res);
//                             if (!--pending) done(results);
//                         });
//                     } else {
//                         results.push(file);
//                         if (!--pending) done(results);
//                     }
//                 });
//             });
//         });
//     });
// };

ContractParser.prototype.findContractFiles = async function(directory) {
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

module.exports = ContractParser;
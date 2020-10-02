const fs = require('fs');
const {promisify} = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const resolve = require('path').resolve;

module.exports = {
    normalizeObject: function (headersObject) {
        if (!Array.isArray(headersObject)) {
            headersObject = Object.entries(headersObject);
        }
        headersObject = headersObject.map(function (header) {
            let key, value;
            if (Array.isArray(header)) {
                key = header[0];
                value = header[1];
                let obj = {};
                obj[key] = value;
                return obj;
            }
            return header;

        });
        return headersObject;
    },

    replaceInArray: function (haystack, needle, replacement) {
        const index = haystack.indexOf(needle);
        if (index > -1) {
            haystack.splice(index, 1);
            haystack.unshift(replacement);
        }
        return haystack;
    },

    generateRandomString: function (length = 10) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    generateRandomNumber: function (min = 1, max = 100) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    generateRandomBoolean: function () {
        return Math.random() >= 0.5;
    },

    writeFile: function (outputFileName, outputData) {
        return new Promise(function (resolve, reject) {
            fs.writeFile(outputFileName, outputData, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    getFiles: async function(dir) {
        const subdirs = await readdir(dir);
        const files = await Promise.all(subdirs.map(async (subdir) => {
            const res = resolve(dir, subdir);
            return (await stat(res)).isDirectory() ? this.getFiles(res) : res;
        }));
        return files.reduce((a, f) => a.concat(f), []);
    }
};
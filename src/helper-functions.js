const fs = require('fs');

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

    generateRandomNumber: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    writeFile: function(outputFileName, outputData) {
        console.log(outputFileName);
        return new Promise(function(resolve, reject) {
            fs.writeFile(outputFileName, outputData, function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }
};
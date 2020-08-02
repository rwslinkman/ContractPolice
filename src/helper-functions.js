module.exports = {
    normalizeObject: function(headersObject) {
        if(!Array.isArray(headersObject)) {
            headersObject = Object.entries(headersObject);
        }
        headersObject = headersObject.map(function(header) {
            let key, value;
            if(Array.isArray(header)) {
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

    replaceInArray: function(haystack, needle, replacement) {
        const index = haystack.indexOf(needle);
        if (index > -1) {
            haystack.splice(index, 1);
            haystack.unshift(replacement);
        }
        return haystack;
    }
};
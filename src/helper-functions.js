module.exports = {
    normalizeHeaders: function(headersObject) {
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
    }
};
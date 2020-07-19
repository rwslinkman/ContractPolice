module.exports = WildcardGenerator;

const generatorRegex = /<generate\[([a-z]*)\(?([a-z,=,\d,;]*)?\)?\]>/g;
const supportedTypes = [
    "string",
    "number",
    "bool",
    "uuid"
];

function parseValue(value) {
    let matches = value.matchAll(generatorRegex);
    let matchesArr = [];
    for (const match of matches) {
        matchesArr = match;
    }
    return matchesArr;
}

function WildcardGenerator(logger) {
    this.logger = logger;
}

WildcardGenerator.prototype.isGenerateWildcard = function(value) {
    const valueType = typeof value;
    if(valueType !== "string") {
        return false;
    }

    let matchesArr = parseValue(value);
    if (matchesArr === null) return false;

    let generationValueType = matchesArr[1];
    return !(generationValueType === undefined || !supportedTypes.includes(generationValueType));

};

WildcardGenerator.prototype.generateWildcardValue = function(value) {
    // <generate\[([a-z]*(\({1}(.*)\){1}))\]>

    return value;
};
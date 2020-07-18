module.exports = WildcardGenerator;

const generatorRegex = /<generate\[([a-z]*(\(.*\))?)\]>/g;

function WildcardGenerator(logger) {
    this.logger = logger;
}

WildcardGenerator.prototype.isGenerateWildcard = function(value) {
    // will output array of matches, or null
    // let matches = generatorRegex.exec(value);
    let matches = value.matchAll(generatorRegex);
    for (const match of matches) {
        console.log(match);
        console.log(match.index)
    }
    // console.log(matches);
    if (matches === null) return false;

    let generationValueType = matches[1];
    let generationArguments = matches[2];
    console.log(generationValueType);
    console.log(generationArguments)

    let valueType = typeof value;
    return valueType === 'string'
};

WildcardGenerator.prototype.generateWildcardValue = function(value) {
    // <generate\[([a-z]*(\({1}(.*)\){1}))\]>

    return value;
};
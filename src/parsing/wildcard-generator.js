const { v4: uuidv4 } = require('uuid');

const generatorRegex = /<generate\[([a-z]*)\(?([a-z=\d;]*)?\)?\]>/g;
const supportedTypes = [
    "string",
    "number",
    "bool",
    "uuid"
];
const ARGUMENT_DELIMITER = ";";
const ARGUMENT_VALUE_DELIMITER = "=";
const DEFAULT_STRING_LENGTH = 10;
const DEFAULT_NUMBER_MIN = 1;
const DEFAULT_NUMBER_MAX = 9_999_999;

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function parseValue(value) {
    let matches = value.matchAll(generatorRegex);
    let matchesArr = [];
    for (const match of matches) {
        matchesArr = match;
    }
    return matchesArr;
}

function parseArguments(arguments) {
    let generationArguments = arguments || null;
    if(generationArguments != null) {
        generationArguments = generationArguments.split(ARGUMENT_DELIMITER).map(function(arg) {
            arg = arg.split(ARGUMENT_VALUE_DELIMITER);
            return {
                argument: arg[0],
                value: arg[1]
            }
        });
    }
    return generationArguments;
}

function filterNamedArgument(arguments, argName, defaultValue) {
    let namedArgument = arguments.filter(arg => arg.argument === argName);
    return (namedArgument.length === 0) ? defaultValue : namedArgument[0].value;
}

function generateRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomBoolean() {
    return Math.random() >= 0.5;
}

function generateRandomUUID() {
    return uuidv4();
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
    let matchesArr = parseValue(value);
    let generationValueType = matchesArr[1];
    let generationArguments = parseArguments(matchesArr[2]);

    if(generationValueType === "string") {
        let lengthValue = DEFAULT_STRING_LENGTH;
        if(generationArguments != null) {
            lengthValue = filterNamedArgument(generationArguments, "length", DEFAULT_STRING_LENGTH);
        }
        return generateRandomString(lengthValue);
    }
    else if(generationValueType === "number") {
        let minValue = DEFAULT_NUMBER_MIN;
        let maxValue = DEFAULT_NUMBER_MAX;
        if(generationArguments != null) {
            minValue = filterNamedArgument(generationArguments, "min", DEFAULT_NUMBER_MIN);
            maxValue = filterNamedArgument(generationArguments, "max", DEFAULT_NUMBER_MAX);
        }
        return generateRandomNumber(minValue, maxValue);
    }
    else if(generationValueType === "bool") {
        return generateRandomBoolean();
    }
    else if(generationValueType === "uuid") {
        return generateRandomUUID();
    }
    return value;
};
module.exports = WildcardGenerator;
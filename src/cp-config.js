function Config(contractDefinitionsDir = null, // required
                generatorSourceDir = null,
                customValidationRules = [],
                failOnError = true,
                reportOutputDir = "/contractpolice/build",
                reporter = "default",
                enableAppLogsConsole = true,
                enableAppLogsFile = false,
                loglevel = "warn") {
    this.contractDefinitionsDir = contractDefinitionsDir;
    this.generatorSourceDir = generatorSourceDir;
    this.customValidationRules = customValidationRules;
    this.failOnError = failOnError;
    this.reportOutputDir = reportOutputDir;
    this.reporter = reporter;
    this.enableAppLogsConsole = enableAppLogsConsole;
    this.enableAppLogsFile = enableAppLogsFile;
    this.loglevel = loglevel;
}

module.exports = Config;
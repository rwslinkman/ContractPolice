# ContractPolice
ContractPolice helps you find contract violations in REST APIs fast and easily!

Lightweight Node HTTP client that validates a API contract on a given endpoint.

#### Table of Content
 * [About ContractPolice](#About-ContractPolice)
 * [Usage](#Usage)
     * [Docker](#Docker) 
     * [Installation in your project](#Installation-in-your-project)
 * [Options](#Options)
    * [Reporter configuration](#Reporter-configuration)
 * [Contract Definitions](#Contract-Definitions)
    * [Basics](#Basics)
    * [Response body validation](#Response-body-validation)
    * [Response header validation](#Response-header-validation)
    * [Request headers](#Request-headers)
    * [Query parameters](#Query-parameters)
    * [Response wildcards](#Response-wildcards)
    * [Request data generation](#Request-data-generation)
 * [Full example](#Full-example) 

## About ContractPolice
Many applications depend on a web service to deliver data and fetch configuration using HTTP.   
In most cases, this is done using a REST API.   
Clients that make HTTP requests in the REST fashion are dependent on a (sometimes) strict contract.   
Especially after deployment, breaking an API contract can be fatal to business operations.   

A basic tool can be useful in verifying the correctness of the web service that your application uses.   
When running ContractPolice on a regular basis, you can make sure to work with valid APIs. 

## Usage
ContractPolice takes a `Contract` defined in YAML and tests a given endpoint.   
For more details on the defining a contract, see [Contract Definitions](#Contract-Definitions)

### Docker 
An easy to use Docker image is available on [Docker Hub](https://hub.docker.com/r/rwslinkman/contractpolice).   
The container takes several parameters to execute contract tests from your Docker image.   
It will automatically stop after the contract tests have been executed.        

```shell script
docker run \
  -e CP_TARGET=http://testing-target.com/api \
  -e CP_REPORTER=junit \
  -v $(pwd)/contracts:/contractpolice/ci-contracts \
  -v $(pwd)/build:/contractpolice/outputs \
  rwslinkman/contractpolice:v1.0.0
```

Define a place to store your contract YAML files and map it to `/contractpolice/ci-contracts`.   
The ContractPolice container will use it to load `Contract Definitions` from.   
Another volume can be defined to allow ContractPolice to store the results in.   
Please map this to the `/contractpolice/outputs` directory, where the test reports are stored internally.   

To integrate this in your CI system, you can observe the exit code of the container.   
Most CI systems will automatically do this when you execute the `docker` command there.      
ContractPolice will set the exit status to `0` for success; `1` means a test has failed or an error occurred.   
This can be overriden using the `CP_FAIL_ON_ERROR` environment variable.   
Pass `-e CP_FAIL_ON_ERROR=false` in the `docker` command to do so.

For more options, see the [Options](#Options) section.

### Installation in your project
You could also integrate ContractPolice manually to fit the needs of your project.   
Create a basic NodeJS project and include ContractPolice to the dependency list.   
```bash
npm install contractpolice --save
```

Create a script that `require`s ContractPolice and point it to the directory where you keep the contract definitions.   
```javascript
(async () => {
    const contractPolice = new ContractPolice(contractsDirectory, testTarget, config);    
    try {
        await contractPolice.testContracts()
        // Success
    } catch (err) {
        // Handle the error however you like
    }
})();
```
**Note:** ContractPolice requires Node version >= 12

## Options
ContractPolice allows for a (minimal) set of properties to be configured to your desire.   

| Config                  | Environment variable (Docker) | Explanation                                                                             | Default value |
|-------------------------|-------------------------------|-----------------------------------------------------------------------------------------|---------------|
| `failOnError`           | `CP_FAIL_ON_ERROR`            | Determines the signal given to the CLI after ContractPolice detects contract violations | `true`        |
| `reporter`              | `CP_REPORTER`                 | Defines which reporter should be used by ContractPolice.                                | `default`     |
| `reportOutputDir`       | n/a (volume)                  | Allows to set a location for the reports to be placed                                   | `build`       |
| `enableAppLogsConsole`  | `CP_LOGS_CONSOLE_ENABLED`     | Enables console logging of ContractPolice application logs                              | `false`       |
| `enableAppLogsFile`     | `CP_LOGS_FILE_ENABLED`        | Enables file logging of ContractPolice application logs                                 | `false`       |
| `loglevel`              | `CP_LOGS_LEVEL`               | Loglevel for ContractPolice application logs (one of `error`, `warn`, `info`, `debug`   | `warn`        |
| `customValidationRules` | not implemented               | List of custom rules for ContractPolice to use when validating contracts                | `[]`          |

### Reporter configuration
ContractPolice is a tool that keeps CI pipelines close to the heart.   
By default, it generates a `*.txt` file that reports on the APIs contract state.   

For CI systems that understand JUnit (or xUnit) reporting, these reports can also be created.   
In order to generate JUnit based reports instead of ContractPolice's default, add it to the configuration.   
Additionally, the path can be set for the output file to be placed.   
This will help in relocating the file for result analysis by your CI system.   

```javascript
const contractPoliceConfig = {
    reporter: "junit",
    reportOutputDir: "relative/path/to/outputdir"
}
```

## Contract Definitions
ContractPolice uses YAML files that define the contracts you have with a web service.   

#### Basics
A basic definition, only using the required attributes, looks like this:
```yaml
contract:
  request:
    path: /hello-world
  response:
    statusCode: 200
```

Within the `contract.request` object, the path is defined.   
The path is appended to the endpoint given to the ContractPolice.    
This creates the URL that will be subjected to the contract test.   

After the request is executed, the ContractPolice takes the `contract.response` object to verify the service's response.   
This object as only one required property, which is  `contract.response.statusCode`.   

#### Response body validation
The HTTP response body can be verified using the `contract.response.body` property.   
This expects an Object or Array value containing the expected properties with their respective values.   
   
An example of a contract with response body validation looks like this:   
```yaml
contract:
  request:
    path: /v1/orders/my-order-id
  response:
    statusCode: 200
    body:
      orderId: my-order-id
      customer: John Doe
      items:
        - product: Hamburger
          quantity: 2
          price: 20
        - product: Fries
          quantity: 1
          price: 10
```  

The response body coming back from the API will be deeply examined to verify its correctness.   
During verification the name of the property is verified, as well as its value and value type.    

#### Response header validation
The headers in the API's response can also be validated.   
For this, they need to be specified in the contract YAML file.   
This is similar to the body definition.   

An example of a contract with response header validation looks like this:   
```yaml
contract:
  request:
    path: /v1/orders/my-order-id
  response:
    statusCode: 200
    headers:
      Content-Type: application/json
```

#### Request headers
To add a header to a contract test request, simply specify a `headers` section in the request.   
It could for example be used to pass an authentication token.   

An example of a contract with request headers looks like this:   
```yaml
contract:
  request:
    path: /v1/orders/my-order-id
    headers:
      X-Custom-Token: someToken
  response:
    statusCode: 200
```

#### Query parameters
Query parameters can dynamically be added to a contract test request.   
All specified `params` will be appended to the request sent to the target API.   
Parameters can be specified as arrays or objects.   

An example of a contract with query parameters looks like this:   
```yaml
contract:
  request:
    path: /v1/orders/my-order-id
    params:
      token: someToken
  response:
    statusCode: 200
```

#### Response wildcards
Wildcards can be used if the exact value of the response does not matter.   
Using these wildcards, you can verify the type of the variable, ignoring its exact value.   

Within the `contract.response` object it is possible to use the following wildcards:   

| Wildcard      | Explanation                                        |
|---------------|----------------------------------------------------|
| `<anyString>` | Verifies that the value is a string of any length  |
| `<anyNumber>` | Verifies that the value is any number              |   
| `<anyBool>`   | Verifies that the value is any boolean             |   

#### Request data generation
To make contract tests less predictive, its also possible to generate data for your requests.   
It is possible to generate strings, numbers, booleans and UUIDs.   
Use these in the `contract.request` part of the Contract Definition.   

A generated value can be defined like this:      
`<generate[type(arg1=val1;arg2=val2)]>`   

The supported types are `string`, `number`, `bool`, and `uuid`.     
Providing arguments is optional, if applicable they must be noted in the following format:   
`argument=value`

The following arguments are supported:   

| Supported type | Arguments    |
|----------------|--------------|
| string         | `length`     |
| number         | `min`, `max` |
| bool           | none         |
| uuid           | none         |

Some examples:   

| Example                             | Explanation                                        |
|-------------------------------------|----------------------------------------------------|
| `<generate[string]>`                | Injects a random string in the request             |
| `<generate[string(length=32)]>`     | Injects a random of 32 characters string           |
| `<generate[number(min=10;max=31)]>` | Injects a random number between 10 and 31          |   
| `<generate[bool]>`                  | Injects a random boolean (true/false)              |   
| `<generate[uuid]>`                  | Injects a randomly generated UUID                  |   

## Full example
Example contract definition in YAML.   
The file might be defined in the `$(pwd)/contracts` directory.   
```yaml
contract:
  request:
    path: /v1/orders
    method: POST
    headers:
      Content-Type: application/json
    body:
      customer: <generate[string]>
      items:
        - product: Hamburger
          quantity: 2
          price: 20
        - product: Fries
          quantity: 1
          price: <generate[number(min=5;max=25)]>
    params:
      orderId: <generate[number]>
  response:
    statusCode: 200
    headers:
      Content-Type: <anyString>
    body:
      orderId: <anyNumber>
      customer: John Doe
      items:
        - product: Hamburger
          quantity: 2
          price: 20
        - product: Fries
          quantity: 1
          price: 10
```

Run the Docker image with the parameters
```shell script
docker run \
  -e CP_TARGET=http://localhost/api \
  -e CP_REPORTER=junit \
  -v $(pwd)/contracts:/contractpolice/ci-contracts \
  -v $(pwd)/build:/contractpolice/outputs \
  rwslinkman/contractpolice:v1.0.0
```
Note: the `$(pwd)/build` directory will be created if it does not exist.   

Custom implementation example for using ContractPolice can be found below:    
```javascript
(async () => {
    try {
        // Execution
        console.log("Start contract test(s) with ContractPolice");
        const contractPolice = new ContractPolice(contractsDirectory, testTarget, config);
        await contractPolice.testContracts()
        // Successful test, no errors found
        console.log("ContractPolice successfully finished executing contract tests");
        process.exitCode = 0; // success
    } catch (err) {
        // Show output of contract test
        console.error(err.message);
        process.exitCode = 1; // failure
    }
})();
```
or:
```javascript
let ContractPolice = require("contractpolice");

let config = {
    reportOutputDir: "reports",
    reporter: "junit"
};
let contractPolice = new ContractPolice("contracts", "http://localhost:3000", config);

console.log("Start contract test(s) with ContractPolice");
contractPolice
    .testContracts()
    .then(function() {
        console.log("ContractPolice successfully finished executing contract tests");
        process.exitCode = 0; // success
    })
    .catch(function(err) {
        console.error(err);
        process.exitCode = 1; // failure
    });
```
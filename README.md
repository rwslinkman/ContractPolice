# ContractPolice
ContractPolice helps you find contract violations in REST APIs fast and easily!

Lightweight Node HTTP client that validates a API contract on a given endpoint.

## About ContractPolice
Many applications depend on a web service to deliver data and fetch configuration using HTTP.   
In most cases, this is done using a REST API.   
Clients that make HTTP requests in the REST fashion are dependent on a (sometimes) strict contract.   
Especially after deployment, breaking an API contract can be fatal to business operations.   

A basic tool can be useful in verifying the correctness of the web service that your application uses.   
When running ContractPolice on a regular basis, you can make sure to work with valid APIs. 

## Usage
ContractPolice takes a `Contract` defined in YAML and tests a given endpoint.   
For more details on the defining a contract, see `Contract Definitions`

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
  rwslinkman/contractpolice:v0.5.4
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

### Installation
You could also integrate ContractPolice manually to fit the needs of your project.   
Create a basic NodeJS project and include ContractPolice to the dependency list.   
```bash
npm install contractpolice --save
```

Create a script that `require`s ContractPolice and point it to the directory where you keep the contract definitions.   
```javascript
let ContractPolice = require("contractpolice");

let contractPolice = new ContractPolice("relative/path/to/contracts", "https://some-webservice.com/api");
contractPolice
    .testContracts()
    .then(function() {
        // Success
    })
    .catch(function(err) {
        // Violations found
    });
```

### Reporting
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

### Configuration
ContractPolice allows for a (minimal) set of properties to be configured to your desire.   

| Option            | Explanation                                                                             | Default value |
|-------------------|-----------------------------------------------------------------------------------------|---------------|
| `failOnError`     | Determines the signal given to the CLI after ContractPolice detects contract violations | `true`        |
| `reporter`        | Defines which reporter should be used by ContractPolice.                                | `default`     |
| `reportOutputDir` | Allows to set a location for the reports to be placed                                   | `build`       |

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

#### Wildcards
Wildcards can be used if the exact value of the outcome does not matter.   
Using these wildcards, you can verify the type of the variable, ignoring its exact value.   

Within the `contract.response` object it is possible to use the following wildcards:   

| Wildcard      | Explanation                                        |
|---------------|----------------------------------------------------|
| `<anyString>` | Verifies that the value is a string of any length  |
| `<anyNumber>` | Verifies that the value is any number              |   

## Full example
Example contract definition.
```yaml
contract:
  request:
    path: /v1/orders
    method: POST
    headers:
      Content-Type: application/json
    body:
      customer: John Doe
      items:
        - product: Hamburger
          quantity: 2
          price: 20
        - product: Fries
          quantity: 1
          price: 10
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

Implementation example for using ContractPolice can be found below:    
```javascript
let ContractPolice = require("contractpolice");

let config = {
    reportOutputDir: "relative/path/to/outputdir",
    reporter: "junit"
};
let contractPolice = new ContractPolice("relative/path/to/contracts", "http://localhost:3000", config);

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
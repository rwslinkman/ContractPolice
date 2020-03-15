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

### Installation
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

### Configuration
TODO: Table here

## Contract Definitions
ContractPolice uses YAML files that define the contracts you have with a web service.   

A basic definition, only using the required attributes, looks like this:
```yaml
contract:
  request:
    path: /hello-world
  response:
    statuscode: 200
```

Within the `contract.request` object, the path is defined.   
The path is appended to the endpoint given to the ContractPolice.    
This creates the URL that will be subjected to the contract test.   

After the request is executed, the ContractPolice takes the `contract.response` object to verify the service's response.   
A `contract.response.body` and `contract.response.statuscode` can be defined, of which the latter is required.   

## Full example
Example contract definition.
```yaml
contract:
  request:
    path: /v1/orders
    method: POST
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
    statuscode: 200
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
    reportOutputDir: "relative/path/to/outputdir"
};
let contractPolice = new ContractPolice("relative/path/to/contracts", "http://localhost:3000", config);

console.log("Start contract test(s) with ContractPolice");
contractPolice
    .testContracts()
    .then(function() {
        console.log("ContractPolice successfully finished executing contract tests");
    })
    .catch(function(err) {
        console.error(err);
        return process.exit(1);
    });
```
# node-aws-be
Backend for [node-aws-fe](https://github.com/mmarkelov/nodejs-aws-fe/)

## Basic

 - `serverless.ts` contains configuration for 2 lambda functions, API is working
 - The [getProductsList](https://ox1m9ngpvi.execute-api.eu-west-1.amazonaws.com/dev/get-products-list) lambda function returns a correct response
 - The [getProductsById](https://ox1m9ngpvi.execute-api.eu-west-1.amazonaws.com/dev/get-product-id/7567ec4b-b10c-48c5-9345-fc73c48a80aa) lambda function return a correct response
 - Frontend application is integrated with product service (/products API) and products from product-service are represented on Frontend.

## Advanced

 - Async/await is used in lambda functions
 - ES6 modules are used for product-service implementation
 - Webpack is configured for product-service
 - SWAGGER documentation is created for product-service (Don't found the way to add it to AWS, so just got `swagger.json` file, you can pastle it to [Swagger Editor](https://editor.swagger.io/))
 - Lambda handlers are covered by basic UNIT tests with JEST
 - Lambda handlers (getProductsList, getProductsById) code is written not in 1 single module (file) and separated in codebase.
 - Main error scenarios are handled by API ("Product not found" error, try catch blocks are used in lambda handlers).

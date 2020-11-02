import fetch from "node-fetch";
import {APIGatewayProxyHandler} from "aws-lambda";
import products from "../products";

const headers = {
    'Access-Control-Allow-Origin': '*',
}

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
    const {productId} = event.pathParameters;

    const productIndex = products.findIndex(product => product.id === productId);

    if (productIndex > -1) {
        const placeholderLink = `https://jsonplaceholder.typicode.com/posts/${productIndex + 1}`;
        const resp = await fetch(placeholderLink);
        const data = await resp.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'getProductById',
                product: products[productIndex],
                jsonplaceholderData: data
            }, null, 2),
        };
    }

    return {
        statusCode: 404,
        headers,
        body: 'Not found'
    }
}

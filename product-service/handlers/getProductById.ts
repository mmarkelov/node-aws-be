import fetch from "node-fetch";
import {APIGatewayProxyHandler} from "aws-lambda";
import products from "../products";
import headers from "./headers";

export const getProductById: APIGatewayProxyHandler = async (event) => {
    try {
        const productId = event.pathParameters?.productId;

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
    } catch (e) {
        return {
            statusCode: 500,
            headers,
            body: 'Internal Server Error'
        }
    }

}

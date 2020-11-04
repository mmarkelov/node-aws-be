import {APIGatewayProxyHandler} from "aws-lambda";
import products from "../products";
import headers from "./headers";

export const getProductsList: APIGatewayProxyHandler = async () => {
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(
            products.map((item) => ({
                ...item,
                image: `https://source.unsplash.com/random?sig=${Math.random()}`,
            })),
            null,
            2
        ),
    };
};

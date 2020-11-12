import {Pool} from "pg";
import {APIGatewayProxyHandler} from "aws-lambda";
import {headers, internalError} from "./helpers";
import {DB_OPTIONS} from "./db";

// cached variable
let pool

export const getProductById: APIGatewayProxyHandler = async (event) => {
    console.log(event, event.pathParameters)
    // Check if pool already exists. Create new one if not.
    if (!pool) {
        pool = new Pool(DB_OPTIONS);
    }

    // Get client from pool
    const client = await pool.connect();

    try {
        const productId = event.pathParameters?.productId;

        const {rows: products} = await client.query(
            `select * from products p inner join stocks s on s.product_id = p.id where p.id = $1`,
            [productId]
        );

        if (products.length) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: 'getProductById',
                    product: products[0],
                }, null, 2),
            };
        }

        return {
            statusCode: 404,
            headers,
            body: 'Not found'
        }
    } catch (err) {
        console.error('Error during database request executing:', err);
        return internalError;
    } finally {
        client.release();
    }
}

import {Pool} from "pg";
import {APIGatewayProxyHandler} from "aws-lambda";
import {headers, internalError} from "./helpers";
import {DB_OPTIONS} from "./db";

// cached variable
let pool

export const getProductsList: APIGatewayProxyHandler = async (event) => {
    console.log(event)
    // Check if pool already exists. Create new one if not.
    if (!pool) {
        pool = new Pool(DB_OPTIONS);
    }

    // Get client from pool
    const client = await pool.connect();
    console.log(client)

    try {
        const {rows: products} = await client.query(`select * from products p inner join stocks s on s.product_id = p.id`);
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
    } catch (err) {
        console.error('Error during database request executing:', err);
        return internalError;
    } finally {
        client.release();
    }
};

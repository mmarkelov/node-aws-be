import {APIGatewayProxyHandler} from "aws-lambda";
import {Pool} from "pg";
import {DB_OPTIONS} from "./db";
import {headers, internalError} from "./helpers";

const isValid = ({title, price, count}) => {
    return !(!title || !price || price < 0 || count < 0);
}

// cached variable
let pool

export const createProduct: APIGatewayProxyHandler = async(event) => {
    console.log(event.body);

    const body = JSON.parse(event.body);

    if (!isValid(body)) {
        return {
            statusCode: 400,
            headers,
            body: 'Bad Request'
        }
    }

    // Check if pool already exists. Create new one if not.
    if (!pool) {
        pool = new Pool(DB_OPTIONS);
    }

    // Get client from pool
    const client = await pool.connect();

    try {
        const {title, description = '', price, count = Math.floor(Math.random() * 10) + 1} = body;
        try {
            await client.query('BEGIN')
            const {rows: products} = await client.query(
                `insert into products (title, description, price) values ('${title}', '${description}', ${price}) returning *`
            );

            const product = {...products[0], count}
            await client.query(
                `insert into stocks (product_id, count) values ('${product.id}', ${count}) returning count`
            );

            await client.query('COMMIT')

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: 'createProduct',
                    product,
                }, null, 2),
            }
        } catch (e) {
            console.log(e)
            await client.query('ROLLBACK')
            return internalError;
        } finally {
            client.release()
        }
    } catch (err) {
        console.error('Error during database request executing:', err);
        return internalError;
    }
}

import {Pool} from "pg";
import {DB_OPTIONS} from "./db";
import {internalError} from "./helpers";

let pool

export const catalogBatchProcess = async(event) => {
    // Check if pool already exists. Create new one if not.
    if (!pool) {
        pool = new Pool(DB_OPTIONS);
    }

    // Get client from pool
    const client = await pool.connect();

    event.Records.map(async ({ body }) => {
        try {
            const {title, description, price, count} = JSON.parse(body);
            const {rows: products} = await client.query(
                `insert into products (title, description, price) values ($1, $2, $3) returning *`,
                [title, description, price]
            );

            const product = {...products[0], count}
            await client.query(
                `insert into stocks (product_id, count) values ($1, $2) returning count`,
                [product.id, count]
            );
            console.log('Product created');
            return { product };
        } catch (err) {
            console.log(`Fail creating a product ${body}`);
            return internalError;
        } finally {
            client.release();
        }
    });

}

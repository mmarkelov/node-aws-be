import {Pool} from "pg";
import {DB_OPTIONS} from "./db";
import {isValid} from "./helpers";

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

            if (!isValid({title, price, count})) {
                throw new Error('Wrong params')
            }
            const {rows: products} = await client.query(
                `insert into products (title, description, price) values ($1, $2, $3) returning *`,
                [title, description, price]
            );

            const product = {...products[0], count};
            // console.log('Product created');
            await client.query(
                `insert into stocks (product_id, count) values ($1, $2)`,
                [product.id, count]
            );
            console.log('Product created');
        } catch (err) {
            console.log(`Fail creating a product ${body}`);
        } finally {
            client.release();
        }
    });

}

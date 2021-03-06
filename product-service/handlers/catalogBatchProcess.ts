import {Pool} from "pg";
import {SNS} from 'aws-sdk';
import {DB_OPTIONS} from "./db";
import {isValid} from "./helpers";

let pool;

export const catalogBatchProcess = async(event) => {
    const sns = new SNS({region: 'eu-west-1'});

    // Check if pool already exists. Create new one if not.
    if (!pool) {
        pool = new Pool(DB_OPTIONS);
    }

    // Get client from pool
    const client = await pool.connect();

    const tasks = event.Records.map(async ({ body }) => {
        const {title, description, price, count} = JSON.parse(body);

        if (isValid({title, price, count})) {
            try {
                const {rows: products} = await client.query(
                    `insert into products (title, description, price) values ($1, $2, $3) returning *`,
                    [title, description, price]
                );

                const product = {...products[0], count};

                await client.query(
                    `insert into stocks (product_id, count) values ($1, $2)`,
                    [product.id, count]
                );
                console.log('Product created');
                return product;
            } catch (err) {
                console.log(`Fail creating a product ${body}`);
            } finally {
                client.release();
            }
        } else {
            console.log(`Invalid data for product ${body}`);
        }
    });

    const importResults = await Promise.all(tasks);

    if (importResults.filter(Boolean).length) {
        await sns.publish({
            Subject: 'Document import complete',
            Message: `Success ${JSON.stringify(importResults)}`,
            TopicArn: process.env.AWS_SNS_ARN,
        }, (err) => {
            if (err) {
                console.log(err)
            }
        }).promise();
    } else {
        await sns.publish({
            Subject: 'Document import complete',
            Message: 'Invalid data',
            MessageAttributes: {
                status: {
                    DataType: 'String',
                    StringValue: 'Error'
                }
            },
            TopicArn: process.env.AWS_SNS_ARN,
        }, (err) => {
            if (err) {
                console.log(err)
            }
        }).promise();
    }
}

import {APIGatewayProxyHandler} from "aws-lambda";
import {S3} from "aws-sdk";

const BUCKET = process.env.BUCKET;

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
    const catalogName = event.queryStringParameters?.name;
    const catalogPath = `uploaded/${catalogName}`;

    const s3 = new S3({region: 'eu-west-1'});

    const params = {
        Bucket: BUCKET,
        Key: catalogPath,
        Expires: 60,
        ContentType: 'text/csv'
    }

    return new Promise((res, rej) => {
        s3.getSignedUrl('putObject', params, (err, url) => {
            if (err) {
                console.log(err)
                return rej(err);
            }

            res({
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                statusCode: 200,
                body: url
            })
        })
    })
}

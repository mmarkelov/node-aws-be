import {APIGatewayProxyHandler} from "aws-lambda";
import {S3} from "aws-sdk";
import {headers, internalError} from "./helpers";

const BUCKET = process.env.BUCKET;

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
    const fileName = event.queryStringParameters?.name;

    if (!fileName) {
        return {
            statusCode: 400,
            headers,
            body: 'Missing name query parameter'
        }
    }

    const catalogPath = `uploaded/${fileName}`;

    const s3 = new S3({region: 'eu-west-1'});

    const params = {
        Bucket: BUCKET,
        Key: catalogPath,
        Expires: 60,
        ContentType: 'text/csv'
    }

    try {
        const signedUrl = await s3.getSignedUrlPromise('putObject', params)
        return {
            statusCode: 200,
            headers,
            body: signedUrl
        }
    } catch (e) {
        console.log(e)
        return internalError
    }
}

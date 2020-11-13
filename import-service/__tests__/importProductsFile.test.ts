import {S3} from "aws-sdk";
import {importProductsFile} from "../handlers/importProductsFile";
import {headers} from "../../product-service/handlers/helpers";

jest.mock('aws-sdk', () => {
    const S3 = {
        getSignedUrl: jest.fn(),
    };
    return { S3: jest.fn(() => S3) };
});

describe('importProductsFile', () => {
    let s3;
    beforeEach(() => {
        s3 = new S3();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should return an error if file name is not provided', async () => {
        const mockEvent = {
            queryStringParameters: {}
        }

        //@ts-ignore
        const res = await importProductsFile(mockEvent)
        expect(res).toEqual({
            statusCode: 400,
            body: 'Missing name query parameter',
            headers,
        })
    })

    it('should return signed url', async () => {
        const mockEvent = {
            queryStringParameters: {
                name: 'foo.csv'
            }
        }

        s3.getSignedUrlPromise = jest.fn().mockImplementation((_, params) =>
            Promise.resolve(`https://s3.aws.com/signed-url?name=${params.Key}`));

        //@ts-ignore
        const res = await importProductsFile(mockEvent)
        expect(res).toEqual({
            statusCode: 200,
            headers,
            body: `https://s3.aws.com/signed-url?name=uploaded/${mockEvent.queryStringParameters.name}`
        })
    })
})

import {S3, SQS} from "aws-sdk";
import csvParser from "csv-parser";

const {BUCKET} = process.env;

export const importFileParser = (event) => {
    console.log('importFileParser triggered: ', event);

    const s3 = new S3({region: 'eu-west-1'});
    const sqs = new SQS();

    event.Records.forEach(record => {
        const s3Stream = s3.getObject({
            Bucket: BUCKET,
            Key: record.s3.object.key
        }).createReadStream();

        s3Stream.pipe(csvParser())
            .on('data', (data) => {
                sqs.sendMessage({
                    QueueUrl: process.env.CATALOG_SQS_QUEUE_URL,
                    MessageBody: JSON.stringify(data),
                }, (err, messageResult) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log('Send message for', data, messageResult)
                    }
                })
            })
            .on('end', async () => {
                await s3.copyObject({
                    Bucket: BUCKET,
                    CopySource: `${BUCKET}/${record.s3.object.key}`,
                    Key: record.s3.object.key.replace('uploaded', 'parsed')
                }).promise().then(() => {
                    s3.deleteObject({
                        Bucket: BUCKET,
                        Key: record.s3.object.key
                    }, () => {
                        console.log(`${record.s3.object.key.split('/')[1]} is parsed`);
                    });
                })
            });
    });
}

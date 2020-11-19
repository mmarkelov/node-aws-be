import {S3} from "aws-sdk";
import csvParser from "csv-parser";

const {BUCKET} = process.env;

export const importFileParser = (event) => {
    console.log('importFileParser triggered: ', event);

    const s3 = new S3({region: 'eu-west-1'});

    event.Records.forEach(record => {
        const s3Stream = s3.getObject({
            Bucket: BUCKET,
            Key: record.s3.object.key
        }).createReadStream();

        s3Stream.pipe(csvParser())
            .on('data', (data) => {
                console.log(data)
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

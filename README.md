# s3-uploader

# Description
A node.js module to upload files to your S3 bucket. It also allows upload of files compressed using Pako after decompressing

# Install
```
npm install @losttracker/s3-uploader
```

## Example
```
const s3Uploader = require('@losttracker/s3-uploader');

const awsCredentials = {
  "region" : "us-west-2",
  "accessKeyId" : "access_key_id",
  "secretAccessKey" : "secret_access_key",
};
const bucket = 'fileuploads_bucket';

// to change file name or edit path. See uploadUrlGen below to know the list of
// parameters passed to method
const uploadUrlGen = (params) => {
  return 'trial_up/' + params.fields.formDataParam + params.filename;
};

const uploadDetails = await s3Uploader({request: req, bucket, awsCredentials, uploadUrlGen});
```

# API
The module returns a promise. The result is an array of responses from S3 upon successful file uploads.

### S3-uploader method
The method accepts an object with the following keys:
| Name      | Type    | Parameters/Properties       | Description |
|-----------|---------|-----------------------------|-------------|
| Request   | Object  | -                           | The incoming request object|
|s3_instance* | <S3 Object> | -                       | You can create an s3 instance using the aws-sdk and pass it as a parameter |
|awsCredential* | Object | region,  accessKeyId, secretAccessKey | The object must contain valid credentials required to connect to S3 instance |
| bucket    | string   | -                          | Valid S3 Bucket to upload the file to |
| mimeFilter | Method  | (mimetype, file_extension) <Return:bool>   | A method that will be passed mime and file extension. Can be used to filter files and stop upload progress. Return < True > when file is supported. |
| compressed | boolean | -                          | If using pako to compress. Default: false. |
| compressionRatio | number (1-9) | -                          | If using Pako, compression ratio to be used. Default: 1. |
| uploadUrlGen | Method | ({fields**, mimetype, bucket, filename}) <Returns: string> | This method can be used to programatically calculate the `key` to upload files to in your S3 bucket |
| maxSize   | number   | -                          | The maximum file size that can be uploaded. Default: null (unlimited) |
| s3UploadParams | Object | -                       | Any additional settings to be passed to the s3.upload method while uploading. Example: Metadata. For more information see: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property |
| busboyParams | Object | -                         | Any additional settings to be passed to the busboy constructor. Example: HWM. For more information see: https://www.npmjs.com/package/busboy#busboy-methods |

_* Any one of these 2 parameters is necessary_

_**it contains the parameters appended to formdata as an object_

Please contact me on **yuvraj2112@gmail.com** for any suggestions!

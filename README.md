# s3-uploader

# Description
A node.js module to upload files to your S3 bucket. It also allows upload of files compressed using Pako after decompressing

# Install
```
npm install s3-uploader
```

## Example
```
const awsCredentials = {
  "region" : "us-west-2",
  "accessKeyId" : "access_key_id",
  "secretAccessKey" : "secret_access_key",
};
const bucket = 'fileuploads_bucket';
const uploadUrlGen = (params) => {
  return 'trial_up/' + params.fields.formDataParam + params.filename;
};

const uploadDetails = await s3Uploader({request: req, bucket, awsCredentials, uploadUrlGen});
```

# API
The module returns a promise. The result is an array of responses from S3 upon successful file uploads.

### S3-uploader method
The method expects an object with the following settings:
 - request - Object - this is the incoming request object
 - s3_instance (optional) - < S3 > - You may create an s3 instance using the aws-sdk and pass it as parameter
 - awsCredential (optional) - Object - The object must contain valid credentials required to connect to S3 instance. It should contain the following properties
   - region - string
   - accessKeyId - string
   - secretAccessKey - string
  
 (One of the s3_instance or awsCredential is required)
 
 - bucket - string - S3 Bucket to upload the file to
 - mimeFilter (optional) - function (mimetype, file_extension) <Returns: Boolean> - A function that will be passed file extension and mime. Can be overwritten to filter files and stop upload progress. Return < True > in case file is not supported.
 - compressed (optional) - Boolean - If using pako to compress. Default: false.
 - compressionRatio (optional) - Boolean - If using Pako, compression ratio to be used to decompress. Default: 1.
 - uploadUrlGen (optional) - function ({fields, mimetype, bucket, filename}) <Returns: string> - Method to programatically calculate the `key` to upload files to in S3. It will receive:
   - fields - Object - the fields parameters appended to formdata as an object with names as keys
   - mimetype - string - Calculated mimetype of the file being uploaded
   - bucket - string - S3 bucket passed originally
   - filename - string - Filename received from busboy
 - maxSize (optional) - Integer - Max file size to allow upload of. Default: null (unlimited)
 - s3UploadParams (optional) - object - Any extra settings to be passed to the s3.upload method while uploading. Example: Metadata. For more information see: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
 - busboyParams (optional) - object - Any extra settings to be passed to the busboy constructor. Example: HWM. For more information see: https://www.npmjs.com/package/busboy#busboy-methods
 

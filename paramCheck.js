module.exports = (request, s3_instance, awsCredentials, bucket, compressed, compressionRatio) => {
  if (!request) {
    return 'Parameter Request can not be empty';
  }
  if ((!s3_instance && !awsCredentials) || (!s3_instance && (!awsCredentials.region || !awsCredentials.accessKeyId || !awsCredentials.secretAccessKey))) {
    return 'S3 parameters to obtain instance missing';
  }
  if (!bucket) {
    return 'Parameter bucket can not be empty';
  }
  if (compressed && !compressionRatio) {
    return 'Parameter combination to uncompress file are invalid';
  }
  return null;
}

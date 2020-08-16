/* eslint-disable */
const AWS = require('aws-sdk');

module.exports = ({region, accessKeyId, secretAccessKey}) => {
  const S3 = new AWS.S3({
    region,
    accessKeyId,
    secretAccessKey,
  });
  return S3;
};

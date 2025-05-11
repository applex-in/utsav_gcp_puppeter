// s3.js
const { S3Client } = require("@aws-sdk/client-s3");

function createS3Client() {
  const region = process.env.AWS_REGION;
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

module.exports = createS3Client;

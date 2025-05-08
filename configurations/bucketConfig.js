const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const region = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

console.log(`AWS_REGION: ${region}`);
console.log(`AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}`);
console.log(`AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}`);
console.log(`Environment Variables Loaded`, process.env);

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = s3;

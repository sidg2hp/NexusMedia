require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const corsParams = {
  Bucket: process.env.AWS_S3_BUCKET_NAME,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ["*"],
        AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
        AllowedOrigins: ["*"],
        ExposeHeaders: ["ETag"]
      }
    ]
  }
};

console.log("Applying CORS configuration to bucket:", process.env.AWS_S3_BUCKET_NAME);

s3.putBucketCors(corsParams, function(err, data) {
  if (err) {
    console.error("Error setting CORS:", err);
  } else {
    console.log("CORS Configuration applied successfully!");
  }
});

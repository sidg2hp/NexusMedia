import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import crypto from 'crypto';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

export async function POST(req: Request) {
  try {
    const { fileName, fileType, isPublic = true } = await req.json();

    if (!fileName || !fileType) {
      return new NextResponse('Missing fileName or fileType', { status: 400 });
    }

    const key = `${crypto.randomUUID()}-${fileName}`;

    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: 60, // 1 minute
      ContentType: fileType,
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', s3Params);

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

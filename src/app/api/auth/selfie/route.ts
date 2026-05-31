import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import AWS from 'aws-sdk';
import crypto from 'crypto';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

const rekognition = new AWS.Rekognition({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-central-1', // Hardcoded because eu-north-1 doesn't support Rekognition
});

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const COLLECTION_ID = 'EventMediaFaces';

async function ensureCollectionExists() {
  try {
    await rekognition.describeCollection({ CollectionId: COLLECTION_ID }).promise();
  } catch (error: any) {
    if (error.code === 'ResourceNotFoundException') {
      await rekognition.createCollection({ CollectionId: COLLECTION_ID }).promise();
    } else {
      throw error;
    }
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return new NextResponse('Unauthorized', { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const body = await req.json();
    const { base64Image } = body;

    if (!base64Image) {
      return new NextResponse('Missing image', { status: 400 });
    }

    const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const key = `selfies/${userId}-${crypto.randomUUID()}.jpg`;

    // 1. Upload to S3
    await s3.putObject({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    }).promise();

    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // 2. Ensure Rekognition Collection exists
    await ensureCollectionExists();

    // 3. Index face in Rekognition (using eu-central-1 region)
    const indexResponse = await rekognition.indexFaces({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      ExternalImageId: userId, // associate this face with the userId
      MaxFaces: 1,
      QualityFilter: 'AUTO',
      DetectionAttributes: ['DEFAULT']
    }).promise();

    if (!indexResponse.FaceRecords || indexResponse.FaceRecords.length === 0) {
      return NextResponse.json({ message: 'No face detected in the image. Please try another.' }, { status: 400 });
    }

    // 4. Update user in DB
    await prisma.user.update({
      where: { id: userId },
      data: { referenceSelfieUrl: url }
    });

    return NextResponse.json({ message: 'Selfie indexed successfully', url });
  } catch (error: any) {
    console.error('Selfie upload error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

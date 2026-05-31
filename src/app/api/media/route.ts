import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import AWS from 'aws-sdk';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const rekognition = new AWS.Rekognition({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-central-1', // eu-north-1 lacks Rekognition support
});
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return new NextResponse('Unauthorized: No token', { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, secret);
      userId = payload.userId as string;
    } catch (e) {
      return new NextResponse('Unauthorized: Invalid token', { status: 401 });
    }

    const { key, eventId, fileType, isPublic = true } = await req.json();

    if (!key || !eventId || !fileType) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const region = process.env.AWS_REGION;
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    // Create media record in DB
    const media = await prisma.media.create({
      data: {
        url,
        type: fileType,
        isPublic,
        uploadedById: userId,
        eventId,
        key,
      },
    });

    // Run AI Tagging asynchronously if it's an image
    if (fileType.startsWith('image/')) {
      s3.getObject({ Bucket: bucketName, Key: key }).promise()
      .then(async (s3Obj) => {
        if (!s3Obj.Body) return;
        const imageBytes = s3Obj.Body as Buffer;

        rekognition.detectLabels({
          Image: { Bytes: imageBytes },
          MaxLabels: 10,
          MinConfidence: 75,
        }).promise()
        .then(async (data) => {
          if (data.Labels) {
            const tags = data.Labels.map(label => label.Name?.toLowerCase()).filter(Boolean) as string[];
            
            for (const tagName of tags) {
              const tag = await prisma.tag.upsert({
                where: { name: tagName },
                update: {},
                create: { name: tagName },
              });
              await prisma.tagsOnMedia.create({
                data: { mediaId: media.id, tagId: tag.id }
              });
            }
          }
        }).catch(console.error);

        rekognition.indexFaces({
          CollectionId: 'EventMediaFaces',
          Image: { Bytes: imageBytes },
          ExternalImageId: media.id,
          MaxFaces: 50,
          QualityFilter: 'AUTO',
          DetectionAttributes: ['DEFAULT']
        }).promise().catch(console.error);
      }).catch(console.error);
    }

    return NextResponse.json(media, { status: 201 });
  } catch (error: any) {
    console.error('Media API Error:', error);
    return new NextResponse(error?.message || 'Internal Server Error', { status: 500 });
  }
}

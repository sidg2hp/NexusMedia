import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import AWS from 'aws-sdk';

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
const COLLECTION_ID = 'EventMediaFaces';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return new NextResponse('Unauthorized', { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.referenceSelfieUrl) {
      return NextResponse.json({ message: 'No reference selfie uploaded' }, { status: 400 });
    }

    // Extract bucket and key from the referenceSelfieUrl
    // URL format: https://[bucket].s3.[region].amazonaws.com/[key]
    const urlObj = new URL(user.referenceSelfieUrl);
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const key = urlObj.pathname.slice(1);

    // Fetch the selfie image from S3 as Buffer
    const s3Object = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
    if (!s3Object.Body) {
      return new NextResponse('Failed to fetch selfie from S3', { status: 500 });
    }
    const imageBytes = s3Object.Body as Buffer;

    // Search faces in collection
    const searchResponse = await rekognition.searchFacesByImage({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: imageBytes },
      FaceMatchThreshold: 85,
      MaxFaces: 100
    }).promise();

    if (!searchResponse.FaceMatches || searchResponse.FaceMatches.length === 0) {
      return NextResponse.json([]); // No matches found
    }

    // Collect all mediaIds from ExternalImageId
    const mediaIds = searchResponse.FaceMatches
      .map(match => match.Face?.ExternalImageId)
      .filter(Boolean) as string[];

    // Remove duplicates
    const uniqueMediaIds = Array.from(new Set(mediaIds));

    if (uniqueMediaIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch the actual media records from the database
    const matchingMedia = await prisma.media.findMany({
      where: { id: { in: uniqueMediaIds } },
      include: {
        uploadedBy: { select: { name: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(matchingMedia);

  } catch (error: any) {
    if (error.code === 'ResourceNotFoundException') {
      // Collection doesn't exist yet, which means no photos have been indexed
      return NextResponse.json([]);
    }
    console.error('SearchFaces Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

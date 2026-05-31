import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import AWS from 'aws-sdk';
import sharp from 'sharp';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get('mediaId');

    if (!mediaId) {
      return new NextResponse('Missing mediaId', { status: 400 });
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { event: true },
    });

    if (!media) {
      return new NextResponse('Media not found', { status: 404 });
    }

    // Get user details for the watermark (optional role)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let userRole = 'Viewer';
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret);
        userRole = (payload.role as string) || 'Viewer';
      } catch (e) {}
    }

    // Only apply watermark to images
    if (!media.type.startsWith('image/')) {
      return NextResponse.redirect(media.url);
    }

    // 1. Fetch image from S3 as a buffer
    const s3Object = await s3.getObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: media.key
    }).promise();

    if (!s3Object.Body) {
      return new NextResponse('Error fetching from S3', { status: 500 });
    }

    // 2. Generate Watermark SVG
    const watermarkText = `NexusMedia - ${media.event.name} - Downloaded by ${userRole}`;
    
    const svgWatermark = `
      <svg width="800" height="100">
        <style>
          .title { fill: rgba(255, 255, 255, 0.7); font-size: 24px; font-weight: bold; font-family: sans-serif; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
        </style>
        <text x="20" y="60" class="title">${watermarkText}</text>
      </svg>
    `;

    // 3. Composite using sharp
    const watermarkedBuffer = await sharp(s3Object.Body as Buffer)
      .composite([
        {
          input: Buffer.from(svgWatermark),
          gravity: 'southeast'
        }
      ])
      .toBuffer();

    // 4. Return as downloadable file
    return new NextResponse(watermarkedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="watermarked_${media.key.split('/').pop() || 'image.jpg'}"`
      }
    });

  } catch (error) {
    console.error('Watermark Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function handleAuthorization(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return { error: 'Authentication token required.', status: 401 };
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    return { user: { id: userId } };
  } catch (error) {
    return { error: 'Invalid token.', status: 401 };
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, method } = req;

  if (pathname === '/api/events' && method === 'POST') {
    const { user, error, status } = await handleAuthorization(req);

    if (error) {
      return new NextResponse(JSON.stringify({ message: error }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Set user ID for event creation
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', user.id);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (pathname === '/api/media/upload-url' && method === 'POST') {
    const { user, error, status } = await handleAuthorization(req);
    if (error) {
      return new NextResponse(JSON.stringify({ message: error }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', user.id);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  if (pathname === '/api/media' || pathname === '/api/media/upload-local') {
    if (method === 'POST') {
      const { user, error, status } = await handleAuthorization(req);
      if (error) {
        return new NextResponse(JSON.stringify({ message: error }), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Add user ID to the request headers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', user.id);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/events', '/api/media/upload-url', '/api/media', '/api/media/upload-local'],
};

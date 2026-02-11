import { NextResponse, NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { ApiResponse } from './Utils/Apiresponse'

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value
  const isApi = request.nextUrl.pathname.startsWith('/api/')


  if (!accessToken) {
    return unauthorized(request, isApi)
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.ACCESS_SECRET!
    )
    const { payload } = await jwtVerify(accessToken, secret)
    console.log("payload: " + payload.sub);


    if (!payload.sub) {
      return unauthorized(request, isApi)
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.sub.toString())


    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (err) {
    console.error('Auth error:', err)
    return unauthorized(request, isApi)
  }
}

function unauthorized(request: NextRequest, isApi: boolean) {
  if (isApi) {
    return NextResponse.json(
      new ApiResponse(
        401,
        "unauthorized",
        false,
        null
      ).toString(),
      {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }
    )
  }
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: [
    '/api/tasks',
    '/api/tasks/:path*',

    '/api/logs',
    '/api/logs/:path*',

    '/api/sleep',
    '/api/sleep/:path*',

    '/api/day-rating',
  ],
}
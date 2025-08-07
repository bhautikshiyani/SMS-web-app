// import { NextRequest, NextResponse } from 'next/server';
// // import { verifyJwt } from '@/lib/auth';
// import { UserRole } from '@/types/user';
// import { roleAccessMap } from '@/components/layout/data/RolebaseNavigation';
// import { parseJwt } from '@/lib/auth';


// function isPublicPath(pathname: string): boolean {
//   return (
//     pathname.startsWith('/_next') ||
//     pathname.startsWith('/assets') ||
//     pathname.startsWith('/auth') ||
//     pathname.startsWith('/styles') ||
//     pathname.startsWith('/public') ||
//     pathname.startsWith('/404')
//   );
// }

// function isValidUserRole(role: string): role is UserRole {
//   return role in roleAccessMap;
// }

// export async function middleware(req: NextRequest): Promise<NextResponse> {
//   const pathname = req.nextUrl.pathname;
//   const requestHeaders = new Headers(req.headers);
  
//   requestHeaders.set('x-api-url', process.env.NEXT_PUBLIC_API_URL || '');

//   if (isPublicPath(pathname)) {
//     // Return early for public paths, but include the modified headers
//     return NextResponse.next({
//       request: {
//         headers: requestHeaders,
//       },
//     });
//   }

//   const token = req.cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY || '')?.value;
 

//   if (!token) {
//     return NextResponse.redirect(new URL('/auth/login', req.url));
//   }

//   try {
//     // const userDetailsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/user-details`, {
//     //   headers: {
//     //     Authorization: `Bearer ${token}`,
//     //   },
//     //   // Add cache control for better performance
//     //   cache: 'no-cache', // Use this instead of 'no-store' for middleware
//     // });

//     // if (!userDetailsRes.ok) {
//     //   return NextResponse.redirect(new URL('/auth/login', req.url));
//     // }

//     const decoded = parseJwt(token);
//     const role = decoded?.role;
//     const exp = decoded?.exp;
//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = exp ? exp - currentTime : 0;

//     if (!role || expiresIn <= 0 || !isValidUserRole(role)) {
//       return NextResponse.redirect(new URL('/auth/login', req.url));
//     }

//     // Check invalid /employees route early
//     // if (pathname.startsWith('/user')) {
//     //   const validEmployeePaths = ['/user','/user/add', '/user/edit'];
//     //   const isExactValidPage = validEmployeePaths.includes(pathname);

//     //   if (!isExactValidPage) {
//     //     return NextResponse.redirect(new URL('/404', req.url));
//     //   }
//     // }
    
//     // if (pathname.startsWith('/admin')) {
//     //   const validEmployeePaths = ['/admin','/admin/add', '/admin/edit'];
//     //   const isExactValidPage = validEmployeePaths.includes(pathname);

//     //   if (!isExactValidPage) {
//     //     return NextResponse.redirect(new URL('/404', req.url));
//     //   }
//     // }
    
//     const allowedPaths = roleAccessMap[role];
//     const isAllowed = allowedPaths.some(
//       (allowedPath: string) => pathname === allowedPath || pathname.startsWith(`${allowedPath}/`)
//     );

//     if (!isAllowed) {
//       return NextResponse.redirect(new URL('/404', req.url));
//     }

//     // Create response with the modified headers
//     const res = NextResponse.next({
//       request: {
//         headers: requestHeaders,
//       },
//     });
    
//     res.cookies.set('userRole', role, {
//       path: '/',
//       httpOnly: false,
//       sameSite: 'lax',
//       maxAge: expiresIn,
//     });

//     return res;
//   } catch (err) {
//     console.error('❌ Middleware fetch error:', err);
//     return NextResponse.redirect(new URL('/auth/login', req.url));
//   }
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css)$).*)',
//   ],
// };


import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types/user';
import { roleAccessMap } from '@/components/layout/data/RolebaseNavigation';
import { parseJwt } from '@/lib/auth';

// Role-based homepage mapping
const roleHomeMap: Record<UserRole, string> = {
  SuperAdmin: '/dashboard',
  Admin: '/messages',
  OrgManager: '/messages',
  OrgUser: '/messages',
};

function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/styles') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/404')
  );
}

function isValidUserRole(role: string): role is UserRole {
  return role in roleAccessMap;
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = new Headers(req.headers);

  requestHeaders.set('x-api-url', process.env.NEXT_PUBLIC_API_URL || '');

  if (isPublicPath(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const token = req.cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY || '')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    const decoded = parseJwt(token);
    const role = decoded?.role;
    const exp = decoded?.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = exp ? exp - currentTime : 0;

    if (!role || expiresIn <= 0 || !isValidUserRole(role)) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // 🔁 Redirect from `/` to role-based home
    if (pathname === '/') {
      const redirectPath = roleHomeMap[role] || '/messages';
      console.log("🚀 ~ middleware ~ redirectPath:", redirectPath)
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
const cleanPathname = pathname.replace(/\/+$/, '') || '/';
    // ✅ Check route access
    const allowedPaths = roleAccessMap[role];
   
const isAllowed = allowedPaths.some(
  (allowedPath: string) =>
    cleanPathname === allowedPath || cleanPathname.startsWith(`${allowedPath}/`)
)

    if (!isAllowed) {
      return NextResponse.redirect(new URL('/404', req.url));
    }

    // ✅ Attach role cookie & headers
    const res = NextResponse.next({ request: { headers: requestHeaders } });

    res.cookies.set('userRole', role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: expiresIn,
    });

    return res;
  } catch (err) {
    console.error('❌ Middleware error:', err);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

// Middleware applies to all except static files, assets, and API
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css)$).*)',
  ],
};

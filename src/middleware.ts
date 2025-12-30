import { NextResponse } from 'next/server';
import NextAuth from "next-auth";
import { authConfig } from './auth.config';

// export function middleware(req: NextRequest) {
//   if (!req.nextUrl.pathname.includes('.')) {
//     console.log('ミドルウェアのテスト')
//   }
//   return NextResponse.next();
// }

// export default NextAuth(authConfig).auth;
const { auth } = NextAuth(authConfig);
export default auth(async function middleware(req) {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;
  if (!session?.user && !(pathname === "/login" || pathname === "/signup")) {
    // ログインしていない場合
    return NextResponse.redirect(new URL("/login", req.url));
  } else if (session?.user && (pathname === "/login" || pathname === "/signup")) {
    // ログイン済みなら /login に入れない
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
})

export const config = {
  // matcher: ["/blog/:path*"]
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|api/*).*)"]
  // matcher: ["/blog/:path*"]
}
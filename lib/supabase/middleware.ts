import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  // Create a simple client for middleware
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Get user from the request cookies
  const accessToken = request.cookies.get("sb-access-token")?.value
  const refreshToken = request.cookies.get("sb-refresh-token")?.value

  let user = null
  if (accessToken) {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser(accessToken)
      user = authUser
    } catch (error) {
      // Token might be expired, try to refresh
      if (refreshToken) {
        try {
          const {
            data: { user: refreshedUser },
          } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
          })
          user = refreshedUser
        } catch (refreshError) {
          // Refresh failed, user needs to log in again
        }
      }
    }
  }

  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

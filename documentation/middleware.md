import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // This will refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Skip middleware for API routes and public assets
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.match(/\.(jpg|png|svg|ico)$/) ||
    request.nextUrl.pathname.startsWith("/_next/")
  ) {
    return response;
  }

  // Redirect from /protected to /dashboard
  if (request.nextUrl.pathname === "/protected") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and trying to access protected pages
  if (!session && (
    request.nextUrl.pathname.startsWith("/protected") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/onboarding")
  )) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If user is authenticated
  if (session) {
    const user = session.user;

    // Check onboarding status
    const { data: onboardingStatus } = await supabase
      .from("onboarding_status")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Route handling based on pathname
    const { pathname, searchParams } = request.nextUrl;

    // If user is on dashboard or root but hasn't completed onboarding
    if ((pathname === "/dashboard" || pathname === "/") && (!onboardingStatus || !onboardingStatus.onboarding_completed)) {
      // Check which step to redirect to
      if (!onboardingStatus || !onboardingStatus.profile_completed) {
        return NextResponse.redirect(new URL("/onboarding/user-details", request.url));
      } else if (!onboardingStatus.funding_source_added) {
        return NextResponse.redirect(new URL("/onboarding/funding-source", request.url));
      }
    }

    // If user is trying to access onboarding steps out of order
    if (pathname.startsWith("/onboarding/")) {
      // If onboarding is complete, redirect to dashboard
      if (onboardingStatus?.onboarding_completed) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Handle specific step redirections
      if (pathname === "/onboarding/funding-source" && (!onboardingStatus || !onboardingStatus.profile_completed)) {
        return NextResponse.redirect(new URL("/onboarding/user-details", request.url));
      }

      // Allow access to success page with session_id, even if funding_source_added is false
      if (pathname === "/onboarding/success") {
        const hasSessionId = searchParams.has("session_id");
        // Only redirect if there's no session_id AND funding_source_added is false
        if (!hasSessionId && (!onboardingStatus || !onboardingStatus.funding_source_added)) {
          return NextResponse.redirect(new URL("/onboarding/funding-source", request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
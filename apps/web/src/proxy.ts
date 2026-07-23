import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refreshes the Supabase auth session cookie on every request, and — since
// this app has no login screen at all — transparently creates an anonymous
// Supabase Auth session on a visitor's first request if they don't have one
// yet. Anonymous sessions still get a real auth.uid(), so every RLS policy
// and the (user_id, word_id, exam_id) scoping in user_progress work
// unchanged; "no login" only removes the UI step, not per-visitor data
// isolation. Requires "Allow anonymous sign-ins" enabled in the Supabase
// project's Authentication settings (see README).
//
// Renamed from middleware.ts to proxy.ts per Next.js 16 (edge runtime is not
// supported here, only nodejs, which is fine since we don't need edge for
// this app).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error(
        'Anonymous sign-in failed — enable "Allow anonymous sign-ins" in the Supabase project\'s Authentication settings:',
        error.message
      );
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)'],
};

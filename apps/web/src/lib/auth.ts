import { createClient } from '@/lib/supabase/server';

// There's no login screen — proxy.ts (middleware) transparently creates an
// anonymous Supabase Auth session for every visitor before any page or
// route handler runs, so a user should always be present here. The inline
// signInAnonymously() fallback is defense-in-depth for the rare case a
// request reaches a Server Component before proxy.ts has set the session
// cookie (e.g. a very first request racing the redirect); it can't persist
// the cookie itself from here (Server Components can't set cookies — see
// lib/supabase/server.ts), but it's still enough to unblock this render.
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return user;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    throw new Error(
      `Could not establish an anonymous session: ${error?.message ?? 'unknown error'}. ` +
        'Make sure "Allow anonymous sign-ins" is enabled in the Supabase project\'s Authentication settings.'
    );
  }
  return data.user;
}

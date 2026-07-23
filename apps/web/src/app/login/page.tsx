import { signIn, signUp } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Adaptive English Learning</h1>
      <p className="text-sm text-neutral-500">TOEIC prep, band 990 target.</p>

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <form className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        <div className="mt-2 flex gap-2">
          <button
            formAction={signIn}
            className="flex-1 rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
          >
            Sign in
          </button>
          <button
            formAction={signUp}
            className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm font-medium"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}

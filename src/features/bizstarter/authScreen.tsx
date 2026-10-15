import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type AuthScreenProps = {
  onSuccess: () => void;
};

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "signup") {
        const { data, error: authError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

        if (authError) throw authError;

        if (data.session) {
          onSuccess();
        } else {
          setMessage(
            "Registration successful! Check your email for a confirmation link, then sign in."
          );
          setMode("login");
        }
      } else {
        const { error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (authError) throw authError;

        onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
            B
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            BizStarter
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your business, organised in one place.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setMessage("");
            }}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              mode === "signup"
                ? "bg-background shadow"
                : "text-muted-foreground"
            }`}
          >
            Create account
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              mode === "login"
                ? "bg-background shadow"
                : "text-muted-foreground"
            }`}
          >
            Sign in
          </button>
        </div>

        <h2 className="text-xl font-semibold">
          {mode === "signup"
            ? "Start your business workspace"
            : "Welcome back"}
        </h2>

        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Create an account to get started."
            : "Sign in to access your workspace."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="bizstarter-email"
              className="mb-1.5 block text-sm font-medium"
            >
              Email address
            </label>

            <input
              id="bizstarter-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="bizstarter-password"
              className="mb-1.5 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="bizstarter-password"
              type="password"
              autoComplete={
                mode === "signup"
                  ? "new-password"
                  : "current-password"
              }
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-lg bg-primary/10 p-3 text-sm">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create my account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Your business records should remain private to your account.
        </p>
      </section>
    </main>
  );
      }

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type AuthMode = "login" | "signup" | "forgot" | "reset";

type AuthScreenProps = {
  onSuccess: () => void;
  onBack?: () => void;
  initialMode?: AuthMode;
};

export default function AuthScreen({
  onSuccess,
  onBack,
  initialMode = "signup",
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(initialMode);

    if (initialMode === "reset") {
      setMessage("Enter and confirm your new password.");
    }
  }, [initialMode]);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
  }

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
          setMode("login");
          setPassword("");
          setMessage(
            "Registration successful! Check your email for a confirmation link, then sign in."
          );
        }
      } else if (mode === "login") {
        const { error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (authError) throw authError;

        onSuccess();
      } else if (mode === "forgot") {
        const { error: authError } =
          await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: window.location.origin,
          });

        if (authError) throw authError;

        setMessage(
          "If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder."
        );
      } else if (mode === "reset") {
        if (password.length < 6) {
          throw new Error(
            "Your new password must contain at least 6 characters."
          );
        }

        if (password !== confirmPassword) {
          throw new Error(
            "The passwords do not match. Please try again."
          );
        }

        const { error: authError } =
          await supabase.auth.updateUser({
            password,
          });

        if (authError) throw authError;

        setPassword("");
        setConfirmPassword("");
        setMessage(
          "Your password has been changed successfully. You can now sign in with your new password."
        );

        await supabase.auth.signOut();
        setMode("login");
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

  const isPasswordForm =
    mode === "login" || mode === "signup" || mode === "reset";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
        {onBack && mode !== "reset" && (
          <button
            type="button"
            onClick={onBack}
            className="mb-5 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-muted"
          >
            ← Back to homepage
          </button>
        )}

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

        {(mode === "signup" || mode === "login") && (
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => changeMode("signup")}
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
              onClick={() => changeMode("login")}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                mode === "login"
                  ? "bg-background shadow"
                  : "text-muted-foreground"
              }`}
            >
              Sign in
            </button>
          </div>
        )}

        <h2 className="text-xl font-semibold">
          {mode === "signup"
            ? "Start your business workspace"
            : mode === "login"
              ? "Welcome back"
              : mode === "forgot"
                ? "Forgot your password?"
                : "Choose a new password"}
        </h2>

        <p className="mb-5 mt-1 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Create an account to get started."
            : mode === "login"
              ? "Sign in to access your workspace."
              : mode === "forgot"
                ? "Enter the email address associated with your account."
                : "Enter your new password and confirm it below."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== "reset" && (
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
          )}

          {isPasswordForm && (
            <div>
              <label
                htmlFor="bizstarter-password"
                className="mb-1.5 block text-sm font-medium"
              >
                {mode === "reset" ? "New password" : "Password"}
              </label>

              <input
                id="bizstarter-password"
                type="password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {mode === "reset" && (
            <div>
              <label
                htmlFor="bizstarter-confirm-password"
                className="mb-1.5 block text-sm font-medium"
              >
                Confirm new password
              </label>

              <input
                id="bizstarter-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Enter your new password again"
                className="w-full rounded-lg border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => changeMode("forgot")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-lg bg-primary/10 p-3 text-sm"
            >
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
                : mode === "login"
                  ? "Sign in"
                  : mode === "forgot"
                    ? "Send reset link"
                    : "Update password"}
          </button>
        </form>

        {(mode === "forgot" || mode === "reset") && (
          <button
            type="button"
            onClick={() => changeMode("login")}
            className="mt-4 w-full rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-muted"
          >
            ← Back to sign in
          </button>
        )}

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Your business records should remain private to your account.
        </p>
      </section>
    </main>
  );
              }

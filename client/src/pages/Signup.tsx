import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Input } from "../components/Field";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { useToast } from "../lib/toast";
import { ApiError } from "../lib/api";
import { getFieldErrors, getErrorMessage } from "../lib/format";

export function Signup() {
  const { signup, user, loading } = useAuth();
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      await signup(name.trim(), email.trim(), password);
      toast.success("Welcome aboard!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrs = getFieldErrors(err.details);
        if (fieldErrs && Object.keys(fieldErrs).length > 0) setErrors(fieldErrs);
        else toast.error(err.message);
      } else toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 dark:bg-[#0b0d12] dark:text-slate-100">
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="absolute right-6 top-6 grid h-9 w-9 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
          </svg>
        )}
      </button>

      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-slate-900 text-lg font-semibold text-white dark:bg-white dark:text-slate-900">
              T
            </div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Create your account</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Spin up a workspace in 30 seconds
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40 sm:p-7">
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <Input label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" required />
              <Input label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" required />
              <Input
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                hint="At least 8 characters"
                autoComplete="new-password"
                required
              />

              <button
                type="submit"
                disabled={busy}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {busy ? "Creating…" : "Create account"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-slate-900 hover:underline dark:text-white">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

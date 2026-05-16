import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-slate-900 dark:bg-[#0b0d12] dark:text-slate-100">
      <div className="max-w-md">
        <div className="mb-6 inline-grid h-12 w-12 place-items-center rounded-lg bg-slate-900 text-xl font-semibold text-white dark:bg-white dark:text-slate-900">
          ?
        </div>
        <div className="text-6xl font-bold tracking-tight text-slate-300 dark:text-slate-700">404</div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

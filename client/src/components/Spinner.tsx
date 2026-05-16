interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-slate-200 border-t-indigo-500 dark:border-slate-700 dark:border-t-indigo-400 ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

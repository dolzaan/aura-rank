import { clsx } from "clsx";

type BrandProps = {
  className?: string;
  markClassName?: string;
  compact?: boolean;
};

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={clsx("shrink-0", className)}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 2C16 9.73 22.27 16 30 16C22.27 16 16 22.27 16 30C16 22.27 9.73 16 2 16C9.73 16 16 9.73 16 2Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandLogo({
  className,
  markClassName,
  compact = false,
}: BrandProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2.5 font-black tracking-[-0.055em]",
        className,
      )}
    >
      <BrandMark className={clsx("size-7 text-aura", markClassName)} />
      {compact ? null : (
        <span>
          AURA<span className="text-aura">TOK</span>
        </span>
      )}
    </span>
  );
}

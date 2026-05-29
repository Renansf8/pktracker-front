const PLATFORM_STYLES: Record<
  string,
  { bg: string; color: string; border?: string }
> = {
  "Poker Stars": { bg: "#9c0808", color: "#fff" },
  "Party Poker": { bg: "#000", color: "#f97316", border: "1px solid #444" },
  GG: { bg: "#000", color: "#fff", border: "1px solid #444" },
  "888": { bg: "#7dd3fc", color: "#0c4a6e" },
  Champions: { bg: "#d4a843", color: "#1a0e00" },
  WPT: { bg: "#1e3a8a", color: "#fff" },
  YA: { bg: "#15803d", color: "#fff" },
  WPN: { bg: "#db2777", color: "#fff" },
  ACR: { bg: "#52525b", color: "#fff" },
};

interface PlatformTagProps {
  platform: string;
  className?: string;
}

export function PlatformTag({ platform, className = "" }: PlatformTagProps) {
  const style = PLATFORM_STYLES[platform] ?? { bg: "#3f3f46", color: "#fff" };

  return (
    <span
      className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide leading-none whitespace-nowrap ${className}`}
      style={{
        background: style.bg,
        color: style.color,
        border: style.border,
      }}
    >
      {platform}
    </span>
  );
}

import { clsx } from "clsx";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone: "red" | "gold" | "zinc" | "green";
};

const toneMap: Record<MetricCardProps["tone"], string> = {
  red: "from-red-500/25 to-transparent text-red-100 ring-red-500/20",
  gold: "from-amber-400/25 to-transparent text-amber-100 ring-amber-400/20",
  zinc: "from-zinc-500/20 to-transparent text-zinc-100 ring-white/10",
  green: "from-emerald-500/25 to-transparent text-emerald-100 ring-emerald-500/20",
};

export function MetricCard({ label, value, detail, tone }: MetricCardProps) {
  return (
    <article
      className={clsx(
        "rounded-3xl border border-white/10 bg-gradient-to-br p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] ring-1 backdrop-blur",
        toneMap[tone]
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-400">
        {label}
      </p>
      <p className="mt-4 text-4xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-3 text-sm text-zinc-300">{detail}</p>
    </article>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ModuleCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
};

export function ModuleCard({
  title,
  description,
  actionLabel,
  href,
}: ModuleCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-red-300">
        Modul Prioritas
      </p>
      <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-zinc-400">{description}</p>
      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:border-amber-300/50 hover:bg-amber-300/15"
      >
        {actionLabel}
        <ArrowRight className="size-4" />
      </Link>
    </article>
  );
}

import { ArrowLeft, Sprout } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground flex items-center justify-center">
      <section className="w-full max-w-lg rounded-[2rem] border-2 border-border bg-card p-8 text-center shadow-[0_6px_0_#dce8e0] sm:p-10">
        <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border-2 border-border bg-primary/15 text-primary">
          <Sprout className="size-7" aria-hidden="true" />
        </span>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="font-display text-4xl font-medium tracking-tight">
          This branch ends here.
        </h1>
        <p className="mx-auto mt-4 max-w-sm leading-relaxed text-muted-foreground">
          The page may have moved, but the full repository garden is still close
          by.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-border bg-secondary px-5 py-2.5 text-sm font-bold shadow-[0_4px_0_#dce8e0] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_0_#dce8e0] active:translate-y-0.5 active:shadow-[0_1px_0_#dce8e0]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to the portfolio
        </Link>
      </section>
    </main>
  );
}

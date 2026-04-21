export function AIFlowViz() {
  return (
    <section className="py-24 md:py-32 border-t border-[hsl(var(--border))] overflow-hidden">
      <div className="container-custom">
        <div className="max-w-3xl mb-14">
          <div className="label-mono mb-4">03 — Under the hood</div>
          <h2 className="font-heading text-display-md font-medium text-balance">
            Not a prompt. A pipeline.
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xl">
            Every draft passes through structured reviewers — editor, stylist, ATS checker — before
            it ever reaches the page.
          </p>
        </div>

        <div className="relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 md:p-14">
          <div className="absolute inset-0 grid-pattern opacity-30 rounded-2xl" />
          <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {[
              { label: "Profile", mono: "input" },
              { label: "Editor", mono: "review" },
              { label: "Template AI", mono: "choose" },
              { label: "ATS check", mono: "verify" },
              { label: "Export", mono: "output" }
            ].map((node, i, arr) => (
              <div key={node.label} className="flex items-center gap-2">
                <div className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-center">
                  <div className="label-mono mb-1">{node.mono}</div>
                  <div className="font-heading text-base">{node.label}</div>
                  <div className="mt-3 flex justify-center">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--foreground))]/40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--foreground))]" />
                    </span>
                  </div>
                </div>
                {i !== arr.length - 1 && (
                  <div className="hidden md:block h-px w-6 bg-[hsl(var(--border))]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

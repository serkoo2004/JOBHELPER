import { Quote } from "lucide-react";

const items = [
  { quote: "Switched three sections between templates in 40 seconds. Got the interview. This is what a career tool should feel like.", name: "Amara Okafor", role: "Staff Eng, fintech" },
  { quote: "The draft reviewer caught five things my mentor did. And I didn't even open a Google Doc.", name: "Ishaan Verma", role: "Product Manager" },
  { quote: "ATS 94. Cover letter in 10s with the voice right. Saved a whole weekend of copy-pasting.", name: "Fatima Haidari", role: "Research Lead" },
  { quote: "The version history is absurdly useful. Rolled back a rewrite I didn't like after export.", name: "Noah Kim", role: "Senior Designer" },
  { quote: "I thought AI resumes were a meme until this. Feels like a competent editor wrote it.", name: "Priya Shah", role: "Founding Engineer" }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32 border-t border-[hsl(var(--border))]">
      <div className="container-custom">
        <div className="max-w-3xl mb-14">
          <div className="label-mono mb-4">04 — Early users</div>
          <h2 className="font-heading text-display-md font-medium">Stories from people who got hired.</h2>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
          {items.map((t) => (
            <div
              key={t.name}
              className="break-inside-avoid rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 hover:-translate-y-0.5 transition-transform"
            >
              <Quote className="h-4 w-4 text-[hsl(var(--muted-foreground))] mb-4" />
              <p className="text-[15px] leading-relaxed text-[hsl(var(--foreground))]">{t.quote}</p>
              <div className="mt-5 pt-5 border-t border-[hsl(var(--border))]">
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

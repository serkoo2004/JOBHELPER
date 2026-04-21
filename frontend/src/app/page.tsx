import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { LogoBar } from "@/components/landing/logo-bar";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AIFlowViz } from "@/components/landing/ai-flow-viz";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="relative" data-testid="landing-page">
      <Navbar />
      <Hero />
      <section className="relative border-y border-[hsl(var(--border))] bg-[hsl(var(--background))]/70 py-8 backdrop-blur">
        <div className="container-custom grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Stored profile, not repeated forms",
              body: "The backend remembers your projects, experience, education and photo so every new draft starts from real data.",
            },
            {
              title: "AI with guardrails",
              body: "Resume, cover letter, photo and career tools all run on structured backend flows instead of random one-off prompts.",
            },
            {
              title: "Draft, review, finalize, export",
              body: "The product is built like a studio workflow: warnings first, edits second, final PDF and DOCX only after review.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]/60 p-5">
              <div className="label-mono mb-3">System</div>
              <h3 className="font-heading text-xl font-medium">{item.title}</h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
      <LogoBar />
      <Features />
      <HowItWorks />
      <AIFlowViz />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}

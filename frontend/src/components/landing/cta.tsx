import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative py-32 md:py-40 border-t border-[hsl(var(--border))] overflow-hidden">
      <div className="absolute inset-0 hero-bg opacity-60" />
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute inset-0 halo opacity-70" />

      <div className="container-custom relative text-center">
        <h2 className="font-heading text-display-lg font-medium text-balance max-w-4xl mx-auto">
          Your next role <br />
          <span className="italic font-normal text-[hsl(var(--muted-foreground))]">is one draft away.</span>
        </h2>
        <p className="mt-6 text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
          No credit card. 14 days of Pro on the house.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="xl">
            <Link href="/sign-up" data-testid="cta-footer-primary">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="xl" variant="secondary">
            <Link href="/sign-in" data-testid="cta-footer-secondary">I already have an account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

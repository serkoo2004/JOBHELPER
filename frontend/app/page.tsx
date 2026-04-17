import HeroSection from '../components/landing/HeroSection';
import ProductStory from '../components/landing/ProductStory';
import FeatureGrid from '../components/landing/FeatureGrid';
import ProcessTimeline from '../components/landing/ProcessTimeline';
import StudioCTA from '../components/landing/StudioCTA';
import ResumeBuilder from '../components/ResumeBuilder';
import TopNav from '../components/TopNav';

export default function Home() {
  return (
    <main className="app-shell min-h-screen text-[color:var(--text-primary)]">
      <TopNav />
      <HeroSection />
      <ProductStory />
      <FeatureGrid />
      <ProcessTimeline />
      <section id="studio" className="section-container pb-16">
        <ResumeBuilder />
      </section>
      <StudioCTA />
    </main>
  );
}

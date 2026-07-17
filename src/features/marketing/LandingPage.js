import { Show, SignUpButton } from "@clerk/nextjs";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const features = [
  {
    title: "Resume-Based Questions",
    description:
      "Get interview questions tailored to your skills, projects, and experience level.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: "Fresh Questions Every Time",
    description:
      "Each session draws five new questions from a bank of fifty built from your resume.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  {
    title: "Your Answers, Saved",
    description:
      "Every question and answer is stored so you can revisit your past sessions anytime.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    ),
  },
];

const stats = [
  { value: "1,000+", label: "Mock Interviews" },
  { value: "95%", label: "User Satisfaction" },
  { value: "5", label: "Job Roles" },
  { value: "24/7", label: "Availability" },
];

export function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-20 pb-32 max-w-5xl mx-auto">
        {/* Animated orbs */}
        <div className="orb orb-blue w-[500px] h-[500px] -top-20 -left-40 animate-float" />
        <div className="orb orb-violet w-[400px] h-[400px] top-20 -right-32 animate-float delay-200" />
        <div className="orb orb-cyan w-[300px] h-[300px] bottom-0 left-1/4 animate-float delay-400" />

        {/* Badge */}
        <div className="animate-fade-in-up mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-4 py-1.5 text-xs font-mono tracking-wider text-muted backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            AI-POWERED INTERVIEW PREP
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6 max-w-4xl">
          Ace Your Next Interview with{" "}
          <span className="text-gradient">PrepAI</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-200 text-lg md:text-xl text-muted max-w-2xl mb-10 leading-relaxed">
          An AI-powered mock interview platform that generates personalized
          questions from your resume and lets you practice answering them.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up delay-300 flex flex-wrap gap-4 justify-center">
          <Show when="signed-out">
            <SignUpButton>
              <Button size="lg" className="animate-pulse-glow">Get Started Free</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <ButtonLink href="/dashboard" size="lg">
              Go to Dashboard
            </ButtonLink>
          </Show>
          <ButtonLink href="#features" variant="ghost" size="lg">
            Learn More
          </ButtonLink>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="relative border-y border-glass-border bg-glass/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <p className="text-3xl md:text-4xl font-bold text-gradient">
                {stat.value}
              </p>
              <p className="text-sm text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-gradient font-semibold mb-3">
            FEATURES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
            Everything you need to prepare
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Our platform combines AI intelligence with structured practice to
            give you the best interview preparation experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              className={`p-8 animate-fade-in-up delay-${(i + 1) * 100} group relative overflow-hidden`}
            >
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-accent-blue/40 via-accent-violet/30 to-transparent" />

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-accent-blue/20 to-accent-violet/20 text-accent-blue mb-5 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-ink">
                {feature.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── CTA Footer ─── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <Card className="p-12 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-linear-to-br from-accent-blue/5 via-accent-violet/5 to-accent-cyan/5" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-ink mb-4">
              Ready to ace your interview?
            </h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
              Join thousands of candidates who have improved their interview
              skills with PrepAI.
            </p>
            <Show when="signed-out">
              <SignUpButton>
                <Button size="lg">Start Practicing Now</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <ButtonLink href="/dashboard" size="lg">
                Go to Dashboard
              </ButtonLink>
            </Show>
          </div>
        </Card>
      </section>
    </div>
  );
}

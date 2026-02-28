import FadeIn from "@/components/ui/FadeIn";

const steps = [
  {
    step: 1,
    title: "Create an Account",
    description: "Sign up for free in under 30 seconds. No credit card required.",
  },
  {
    step: 2,
    title: "Add Your Tasks",
    description:
      "Create tasks with a title and optional description. Organize everything in one place.",
  },
  {
    step: 3,
    title: "Mark Done as You Go",
    description:
      "One click to complete or delete tasks. Stay focused on what's next.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-brand-bg py-20">
      <div className="mx-auto max-w-4xl px-4">
        <FadeIn>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white text-center mb-4">
            How It Works
          </h2>
          <p className="font-body text-white/60 text-center mb-16 max-w-lg mx-auto">
            Three simple steps to take control of your tasks.
          </p>
        </FadeIn>
        <div className="flex flex-col md:flex-row gap-12 md:gap-8">
          {steps.map((s, i) => (
            <FadeIn
              key={s.step}
              delay={0.1 + i * 0.15}
              className="flex-1"
            >
              <div className="flex flex-col items-center text-center">
                <span className="font-accent text-6xl font-bold text-brand-cta mb-4 leading-none">
                  {s.step}
                </span>
                <h3 className="font-heading font-semibold text-white text-lg mb-2">
                  {s.title}
                </h3>
                <p className="font-body text-white/70 text-sm leading-relaxed">
                  {s.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

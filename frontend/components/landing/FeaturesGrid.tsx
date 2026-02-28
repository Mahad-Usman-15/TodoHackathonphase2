import FadeIn from "@/components/ui/FadeIn";

const features = [
  {
    id: "secure",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    title: "Secure by Default",
    description:
      "JWT authentication, bcrypt password hashing, and HTTP-only cookies keep your account protected at every layer.",
  },
  {
    id: "fast",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    title: "Fast & Simple",
    description:
      "No clutter, just tasks. Add, complete, and delete in seconds with a clean, distraction-free interface.",
  },
  {
    id: "isolated",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
    title: "Your Data, Only Yours",
    description:
      "Every task is isolated to your account. Full user data separation — no cross-account access, ever.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="bg-brand-bg py-20">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white text-center mb-4">
            Why Choose Taskify
          </h2>
          <p className="font-body text-white/60 text-center mb-12 max-w-xl mx-auto">
            Built for people who want a simple, secure, and reliable task manager.
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FadeIn key={f.id} delay={0.1 + i * 0.13} className="flex">
              <div className="flex-1 bg-brand-deep/10 border border-brand-primary/20 rounded-xl p-6 hover:border-brand-primary/40 transition-colors">
                <div className="text-brand-cta mb-4">{f.icon}</div>
                <h3 className="font-heading font-semibold text-white text-lg mb-2">
                  {f.title}
                </h3>
                <p className="font-body text-white/70 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

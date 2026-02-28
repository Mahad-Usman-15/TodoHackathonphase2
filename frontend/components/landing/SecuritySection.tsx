import FadeIn from "@/components/ui/FadeIn";

const points = [
  {
    label: "JWT HS256",
    detail: "Industry-standard token signing and verification on every request.",
  },
  {
    label: "bcrypt Hashing",
    detail: "Passwords are never stored in plain text — always securely hashed.",
  },
  {
    label: "HTTP-only Cookies",
    detail:
      "Refresh tokens are invisible to JavaScript — fully XSS-proof by design.",
  },
  {
    label: "User Isolation",
    detail:
      "All data queries are scoped to the authenticated user. No cross-account access.",
  },
];

export default function SecuritySection() {
  return (
    <section className="bg-brand-deep/10 border-y border-brand-primary/20 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <FadeIn delay={0.05}>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-8">
              Built with Security First
            </h2>
            <ul className="space-y-5">
              {points.map((p) => (
                <li key={p.label} className="flex items-start gap-4">
                  <div className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-cta flex-shrink-0" />
                  <div>
                    <span className="font-accent text-brand-primary text-xs uppercase tracking-widest block mb-0.5">
                      {p.label}
                    </span>
                    <p className="font-body text-white/70 text-sm leading-relaxed">
                      {p.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-40 h-40 text-brand-cta opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={0.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

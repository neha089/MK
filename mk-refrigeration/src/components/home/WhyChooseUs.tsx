const REASONS = [
  {
    icon: 'verified_user',
    title: 'Authorized Dealer',
    desc: 'We are an authorized dealer for all major brands — LG, Samsung, Whirlpool, Voltas, Daikin, and more. Every product is 100% genuine.',
    fill: true,
  },
  {
    icon: 'local_shipping',
    title: 'Fast Delivery',
    desc: 'Same-day or next-day delivery within Bharuch. We deliver to nearby areas including Ankleshwar, Amod, and Vagra.',
    fill: false,
  },
  {
    icon: 'build_circle',
    title: 'Expert Installation',
    desc: 'Certified technicians for professional installation. We handle everything from unboxing to testing.',
    fill: true,
  },
  {
    icon: 'price_check',
    title: 'Best Price Guarantee',
    desc: 'Wholesale rates for retail customers. If you find a lower price anywhere in Bharuch, we will match it.',
    fill: true,
  },
  {
    icon: 'support_agent',
    title: 'After-Sales Support',
    desc: 'Dedicated support for warranty claims, spare parts, and service. Just call or WhatsApp us anytime.',
    fill: false,
  },
  {
    icon: 'history',
    title: 'Years of Trust',
    desc: 'Serving Bharuch for years with thousands of satisfied customers across homes, offices, and commercial spaces.',
    fill: false,
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-surface">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-14">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Why MK Refrigeration</span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-2">
            The Bharuch Difference
          </h2>
          <p className="text-on-surface-variant text-sm mt-3 max-w-lg mx-auto">
            We are not just a shop — we are your long-term electronics partner. Here is what sets us apart.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((r) => (
            <div
              key={r.title}
              className="group p-7 rounded-2xl border border-outline-variant/40 bg-surface hover:border-primary/30 hover:shadow-lg transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                <span
                  className="material-symbols-outlined text-2xl text-primary group-hover:text-on-primary transition-colors"
                  style={r.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {r.icon}
                </span>
              </div>
              <h3 className="font-bold text-base text-on-surface mb-2">{r.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

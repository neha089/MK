const BADGES = [
  { icon: 'verified', label: 'Authorized Dealer', sub: 'All top brands', fill: true },
  { icon: 'workspace_premium', label: 'Genuine Products', sub: 'Original warranty', fill: true },
  { icon: 'home_repair_service', label: 'Expert Installation', sub: 'Certified technicians', fill: false },
  { icon: 'support_agent', label: 'After-Sales Support', sub: 'Always reachable', fill: false },
]

export default function TrustBadges() {
  return (
    <section className="py-6 bg-primary">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map((b) => (
            <div key={b.label} className="flex items-center gap-3 text-on-primary">
              <span
                className="material-symbols-outlined text-3xl opacity-90"
                style={b.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {b.icon}
              </span>
              <div>
                <p className="font-bold text-sm leading-tight">{b.label}</p>
                <p className="text-xs opacity-75">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

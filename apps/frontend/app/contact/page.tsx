import Header from '../../components/ui/Header'

export const metadata = {
  title: 'Contact Synkio | Let’s Chat',
  description: 'Reach the Synkio team for partnerships, support, or general inquiries.',
}

const contactMethods = [
  {
    title: 'General Inquiries',
    description: 'Ask us anything about Synkio’s conversational marketplace.',
    email: 'info@synkio.app',
  },
  {
    title: 'Support',
    description: 'Need help getting started or managing a transaction?',
    email: 'contacts@synkio.app',
  },
  {
    title: 'Partnerships',
    description: 'Let’s collaborate on commerce, payments, or ecosystem integrations.',
    email: 'partners@synkio.app',
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#101322] text-white">
      <Header variant="landing" hideNavLinks hideActionButton />
      <main className="max-w-4xl mx-auto px-6 py-20 space-y-12">
        <section className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-linka-emerald">Contact</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Talk to the Synkio team
          </h1>
          <p className="text-lg text-[#929bc9] max-w-2xl mx-auto leading-relaxed">
            We love chatting about conversational commerce, transparent payments, and all the ways Synkio can fit into your workflows. Drop us a note and we’ll get back within one business day.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map(method => (
            <div
              key={method.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-sm"
            >
              <h2 className="text-xl font-semibold">{method.title}</h2>
              <p className="text-sm text-[#929bc9] leading-relaxed">{method.description}</p>
              <a
                href={`mailto:${method.email}`}
                className="inline-flex items-center gap-2 text-linka-emerald font-semibold hover:underline"
              >
                {method.email}
              </a>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-linka-emerald/30 bg-linka-emerald/10 p-10 text-center space-y-4">
          <h3 className="text-2xl font-bold">Prefer async?</h3>
          <p className="text-[#d1fae5]">
            Send us a Loom, deck, or doc and we’ll follow up with next steps.
          </p>
          <a
            href="mailto:info@synkio.app"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-linka-emerald font-semibold px-6 py-3 hover:bg-gray-100 transition-colors"
          >
            email info@synkio.app
          </a>
        </section>
      </main>
    </div>
  )
}


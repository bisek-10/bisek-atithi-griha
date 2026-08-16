export default function Rooms() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-ink-800 mb-4">Rooms & rates</h1>
      <p className="text-ink-600 max-w-2xl mb-10">
        We keep 14 rooms, split between attached and shared bathrooms. Exact nightly rates are
        confirmed at check-in and depend on how many people will be staying in the room — please
        call ahead so we can hold the right room type for you.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        <div className="border border-sand-200 rounded-2xl p-6 bg-white">
          <h3 className="font-display text-xl text-ink-800 mb-2">Attached bathroom</h3>
          <p className="text-ink-600 text-sm">
            A private bathroom within the room. Best if you have an elderly patient or young
            children with you.
          </p>
        </div>
        <div className="border border-sand-200 rounded-2xl p-6 bg-white">
          <h3 className="font-display text-xl text-ink-800 mb-2">Shared bathroom</h3>
          <p className="text-ink-600 text-sm">
            A more economical option with a shared bathroom on the same floor — a good fit for
            longer stays on a tighter budget.
          </p>
        </div>
      </div>

      <h2 className="font-display text-2xl text-ink-800 mb-3">Extra services, only if you need them</h2>
      <ul className="text-ink-600 space-y-2 list-disc list-inside mb-10">
        <li>Gas cylinder for cooking, plus refills when you run out</li>
        <li>Utensils for basic home cooking</li>
        <li>Use of additional electrical appliances (rice cooker, heater, etc.)</li>
      </ul>

      <p className="text-sm text-ink-600">
        Staying for weeks or months? Let us know — long stays are exactly what these rooms are
        built for, and we're happy to talk through what works best for your family.
      </p>
    </section>
  )
}

const facilities = [
  {
    icon: "💰",
    title: "Budget-friendly rooms",
    description:
      "Affordable accommodation for patients and their families, helping you save thousands compared with staying in expensive hotels.",
  },
  {
    icon: "🕊️",
    title: "Peaceful & comfortable stay",
    description:
      "A calm and welcoming environment where patients and families can rest comfortably during difficult treatment periods.",
  },
  {
    icon: "🍳",
    title: "Self-cooking facility",
    description:
      "Prepare fresh and hygienic home-cooked meals according to your family's preferences and the patient's needs.",
  },
  {
    icon: "🥘",
    title: "Gas stove & utensils",
    description:
      "Essential cooking equipment is provided so you don't have to carry or purchase heavy kitchen items during your stay.",
  },
  {
    icon: "📅",
    title: "Suitable for long-term stays",
    description:
      "Our accommodation is suitable for families who need to stay for several days or weeks while treatment continues.",
  },
  {
    icon: "✨",
    title: "Patient-friendly environment",
    description:
      "Clean, hygienic and peaceful surroundings maintained with the comfort and needs of patients and their families in mind.",
  },
  {
    icon: "🏥",
    title: "Near BPKMCH",
    description:
      "Located close to B.P. Koirala Memorial Cancer Hospital, making regular hospital visits easier and less tiring.",
  },
  {
    icon: "🚗",
    title: "Safe parking facility",
    description:
      "Convenient parking space for guests travelling by private vehicle, giving you one less thing to worry about.",
  },
  {
    icon: "📍",
    title: "Near Cancer Gate No. 1",
    description:
      "Our convenient location near Cancer Gate No. 1 keeps the hospital within a short and easy distance.",
  },
];

export default function Facilities() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <p className="text-xs uppercase tracking-wide text-saffron-600 font-semibold mb-2">
          Our Services & Facilities
        </p>

        <h1 className="font-display text-4xl text-ink-800 mb-4">
          Comfort and essentials for your stay
        </h1>

        <p className="text-ink-600 leading-7">
          We provide a supportive, peaceful and budget-friendly environment for
          patients and their families staying near B.P. Koirala Memorial Cancer
          Hospital.
        </p>
      </div>

      {/* Facilities */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((facility) => (
          <div
            key={facility.title}
            className="bg-sand-50 border border-sand-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-5" aria-hidden="true">
              {facility.icon}
            </div>

            <h2 className="font-display text-2xl text-ink-800 mb-3">
              {facility.title}
            </h2>

            <p className="text-ink-600 leading-7 text-sm">
              {facility.description}
            </p>
          </div>
        ))}
      </div>

      {/* Location highlight */}
      <div className="mt-16 bg-pine-700 rounded-2xl px-6 py-10 sm:px-10 text-sand-50">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide text-saffron-300 font-semibold mb-2">
            Conveniently Located
          </p>

          <h2 className="font-display text-3xl mb-4">
            Stay close to B.P. Koirala Memorial Cancer Hospital
          </h2>

          <p className="text-sand-100 leading-7 mb-6">
            Bisek Atithi Griha is located near Cancer Gate No. 1, Bharatpur-7,
            Chitwan. The convenient location helps reduce travel time and
            fatigue for patients and families attending regular hospital
            appointments.
          </p>

          <a
            href="https://maps.app.goo.gl/L1uV9MmCwLr9skcN7"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-sand-50 text-pine-800 px-6 py-3 rounded-full text-sm font-semibold hover:bg-sand-100 transition-colors shadow-sm">
            View our location
          </a>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <h2 className="font-display text-3xl text-ink-800 mb-3">
          Looking for an affordable place to stay?
        </h2>

        <p className="text-ink-600 max-w-2xl mx-auto mb-6">
          Explore our rooms and find an option that suits your needs during your
          hospital stay.
        </p>

        <a
          href="/rooms"
          className="inline-block bg-pine-700 text-sand-50 px-6 py-3 rounded-full text-sm font-semibold hover:bg-pine-800 transition-colors shadow-sm">
          View Rooms
        </a>
      </div>
    </section>
  );
}

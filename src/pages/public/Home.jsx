import { useState } from 'react'
import { Link } from 'react-router-dom'

const MAPS_URL = 'https://maps.app.goo.gl/6GRTER9R9hxoL3G78'

export default function Home() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="bg-sand-50 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-12 gap-12 items-center">
        {/* Left Column: Text Content */}
        <div className="md:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-500/10 border border-saffron-500/20 text-saffron-600 font-semibold text-xs tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 animate-pulse"></span>
            Located near Cancer Gate No. 1
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-ink-800 leading-[1.12] tracking-tight">
              Bisek Atithi Griha
            </h1>
            <p className="text-pine-700/90 font-display text-lg md:text-xl lg:text-2xl italic leading-relaxed">
              “A Comfortable Home Away From Home for Patients and Their
              Families.”
            </p>
          </div>

          <div className="space-y-4 text-ink-600 text-base md:text-lg leading-relaxed max-w-xl">
            <p className="font-semibold text-ink-800">
              A comfortable and budget-friendly stay for patients and families
              visiting B.P. Koirala Memorial Cancer Hospital.
            </p>
            <p>
              Avoid spending thousands of rupees on expensive hotels and outside
              food. We provide a peaceful, highly affordable, and
              patient-friendly place to stay so you can focus fully on recovery.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/Book"
              className="bg-pine-700 text-sand-50 px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-pine-800 hover:shadow-md transition-all duration-200">
              Book Now
            </Link>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="border border-ink-600/25 text-ink-700 px-7 py-3.5 rounded-full text-sm font-semibold hover:border-pine-700 hover:text-pine-700 hover:bg-pine-50/20 transition-all duration-200">
              Get Directions
            </a>
          </div>
        </div>

        {/* Right Column: Property Image Slot */}
        <div className="md:col-span-5 h-full">
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm group">
            {!imageError ? (
              <img
                src="/property.jpeg"
                onError={() => setImageError(true)}
                alt="Bisek Atithi Griha property"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-sand-100 border-2 border-dashed border-sand-300 rounded-2xl flex flex-col justify-between p-8 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-pine-700/5 blur-xl"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-sand-200 text-pine-700 mb-4">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl text-ink-800 font-semibold">
                    Peaceful Environment
                  </h3>
                  <p className="text-ink-600 text-xs mt-2">
                    Clean and hygienic rooms designed for patient comfort.
                  </p>
                </div>
                <div className="relative z-10 border-t border-sand-200 pt-4 text-xs text-ink-600 flex justify-between items-center">
                  <span>Cancer Gate No. 1</span>
                  <span>Self-Cooking</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section
        id="facilities"
        className="bg-white border-y border-sand-200 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-display text-3xl text-ink-800">
              Our Services & Facilities
            </h2>
            <div className="w-16 h-1 bg-saffron-500 mx-auto rounded-full"></div>
            <p className="text-ink-600 text-sm md:text-base">
              Providing a supportive atmosphere with all the essentials for a
              comfortable, budget-friendly hospital stay.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FacilityCard
              title="Budget-friendly rooms"
              desc="Affordable options for patients and their families, saving you thousands on hotel costs."
              icon="💰"
            />
            <FacilityCard
              title="Peaceful & Comfortable Stay"
              desc="A quiet environment ensuring rest and dignity during difficult treatment periods."
              icon="🕊️"
            />
            <FacilityCard
              title="Self-cooking facility"
              desc="Prepare hygienic home-cooked meals tailored to the patient's nutritional needs."
              icon="🍳"
            />
            <FacilityCard
              title="Gas stove & utensils"
              desc="We provide the basics so you don't have to carry or buy heavy kitchen equipment."
              icon="🥘"
            />
            <FacilityCard
              title="Suitable for long-term stays"
              desc="Stay for as long as treatment takes without the pressure of typical hotel limits."
              icon="📅"
            />
            <FacilityCard
              title="Patient-friendly environment"
              desc="Highly hygienic and clean surroundings maintained specifically for recovery."
              icon="✨"
            />
            <FacilityCard
              title="Near BPKMCH"
              desc="Located just a short walk from B.P. Koirala Memorial Cancer Hospital."
              icon="🏥"
            />
            <FacilityCard
              title="Safe parking facility"
              desc="Secure space to park your vehicle while you focus on caregiving."
              icon="🚗"
            />
            <FacilityCard
              title="Cancer Gate No. 1"
              desc="Our convenient location makes hospital visits quick and low-fatigue."
              icon="📍"
            />
          </div>
        </div>
      </section>

      {/* Hospital Focus Callout */}
      <section className="bg-sand-100 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <p className="font-display text-2xl md:text-3xl text-pine-800 leading-snug italic">
            "We prioritize a clean, noise-free, and respectful environment
            tailored specifically for patient healing and caregiver support."
          </p>
          <div className="flex justify-center items-center gap-3">
            <span className="w-8 h-px bg-sand-300"></span>
            <span className="text-xs uppercase tracking-widest text-ink-600 font-semibold underline decoration-saffron-500 underline-offset-4">
              Hygienic • Calming • Compassionate
            </span>
            <span className="w-8 h-px bg-sand-300"></span>
          </div>
        </div>
      </section>

      {/* Gallery Section Placeholder */}
      <section id="gallery" className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-ink-800">
              Property Gallery
            </h2>
            <p className="text-ink-600">
              A look into our simple, clean, and patient-ready spaces.
            </p>
          </div>
          <Link
            to="/rooms"
            className="text-pine-700 font-semibold hover:underline">
            View Room Details →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="aspect-square bg-sand-200 rounded-2xl animate-pulse">
            <img
              src="/logo-cropped.svg"
              alt="Bisek Atithi Griha"
              className="h-full w-full object-contain"
            />{" "}
          </div>
          <div className="aspect-square bg-sand-200 rounded-2xl animate-pulse delay-75">
            <img
              src="/logo-cropped.svg"
              alt="Bisek Atithi Griha"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="aspect-square bg-sand-200 rounded-2xl animate-pulse delay-150">
            <img
              src="/logo-cropped.svg"
              alt="Bisek Atithi Griha"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="aspect-square bg-sand-200 rounded-2xl animate-pulse delay-300">
            <img
              src="/logo-cropped.svg"
              alt="Bisek Atithi Griha"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FacilityCard({ title, desc, icon }) {
  return (
    <div className="p-6 rounded-2xl bg-sand-50/60 border border-sand-200/50 hover:border-pine-700/30 hover:shadow-sm transition-all duration-200 space-y-3">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-xl">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      <p className="text-ink-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

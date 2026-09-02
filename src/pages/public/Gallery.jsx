const galleryImages = [
  {
    src: "/property.jpeg",
    alt: "Bisek Atithi Griha exterior",
    title: "Our Atithi Griha",
  },
  {
    src: "/property.jpeg",
    alt: "Guest room at Bisek Atithi Griha",
    title: "Comfortable Rooms",
  },
  {
    src: "/property.jpeg",
    alt: "Guest room interior",
    title: "Room Interior",
  },
  {
    src: "/property.jpeg",
    alt: "Self-cooking kitchen facility",
    title: "Self-Cooking Facility",
  },
  {
    src: "/property.jpeg",
    alt: "Kitchen utensils",
    title: "Kitchen & Utensils",
  },
  {
    src: "/property.jpeg",
    alt: "Common area",
    title: "Common Area",
  },
  {
    src: "/property.jpeg",
    alt: "Parking facility",
    title: "Parking Facility",
  },
  {
    src: "/property.jpeg",
    alt: "Location near Cancer Gate No. 1",
    title: "Our Location",
  },
];

export default function Gallery() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <p className="text-xs uppercase tracking-wide text-pine-700 font-semibold mb-2">
          Gallery
        </p>

        <h1 className="font-display text-4xl text-gray-900 mb-4">
          A glimpse of Bisek Atithi Griha
        </h1>

        <p className="text-gray-600 leading-7">
          Take a look at our rooms, facilities and surroundings before your
          stay. We aim to provide a clean, peaceful and comfortable place for
          patients and their families.
        </p>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {galleryImages.map((image) => (
          <div
            key={image.src}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="px-5 py-4">
              <h2 className="font-display text-xl text-gray-900">
                {image.title}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom message */}
      <div className="mt-16 bg-pine-700 rounded-lg px-6 py-10 sm:px-10 text-center text-white">
        <h2 className="font-display text-3xl mb-3">
          A comfortable place to stay during treatment
        </h2>

        <p className="text-gray-100 max-w-2xl mx-auto leading-7 mb-6">
          Located near Cancer Gate No. 1 of B.P. Koirala Memorial Cancer
          Hospital, we provide practical and affordable accommodation for
          patients and their families.
        </p>

        <a
          href="/rooms"
          className="inline-block bg-white text-pine-800 px-6 py-3 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors shadow-sm">
          View Our Rooms
        </a>
      </div>
    </section>
  );
}

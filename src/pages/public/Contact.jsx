const MAPS_URL = "https://maps.app.goo.gl/L1uV9MmCwLr9skcN7";
const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  "Bisek Atithi Griha, Cancer Gate No. 1, Bharatpur-7, Chitwan, Nepal",
)}&output=embed`;

export default function Contact() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-gray-900 mb-4">Find us</h1>
      <p className="text-gray-600 max-w-2xl mb-8">
        We are located at Bisek Atithi Griha near B.P. Koirala Memorial Cancer
        Hospital, Cancer Gate No. 1, Bharatpur-7, Chitwan. Call ahead if you'd
        like us to hold a room, especially for attached-bathroom rooms.
      </p>

      <div className="grid sm:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-pine-700 font-semibold mb-1">
              Address
            </p>
            <p className="text-gray-700">
              Bisek Atithi Griha, Cancer Gate No. 1, Bharatpur-7, Chitwan, Nepal
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-pine-700 font-semibold mb-1">
              Phone
            </p>
            <p className="text-gray-700">9855057330, 9845085316</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-pine-700 font-semibold mb-1">
              Email
            </p>
            <p className="text-gray-700">bisekatithigriha@gmail.com</p>
          </div>
          <div className="pt-4">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-pine-700 text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-pine-800 transition-colors shadow-sm">
              Open in Google Maps
            </a>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden border border-gray-200 aspect-video">
          <iframe
            title="Location map"
            className="w-full h-full"
            src={MAPS_EMBED_URL}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

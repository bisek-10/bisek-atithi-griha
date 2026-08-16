import { useState } from "react";

export default function Book() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <p className="text-xs uppercase tracking-wide text-saffron-600 font-semibold mb-2">
          Book Your Stay
        </p>

        <h1 className="font-display text-4xl text-ink-800 mb-4">
          Plan your stay with us
        </h1>

        <p className="text-ink-600 leading-7">
          Tell us about your stay and we will get in touch with you to
          confirm room availability and booking details.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="rounded-2xl border border-pine-200 bg-pine-50 p-8">
              <h2 className="font-display text-3xl text-pine-800 mb-3">
                Thank you for your inquiry
              </h2>

              <p className="text-ink-600 leading-7">
                We have received your request. Our team will contact you
                shortly to discuss availability and confirm your stay.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-2xl border border-sand-200 bg-sand-50 p-6 sm:p-8"
            >
              {/* Personal Information */}
              <div>
                <h2 className="font-display text-2xl text-ink-800 mb-5">
                  Your information
                </h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-ink-700 mb-2"
                    >
                      Full Name *
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink-800 outline-none focus:border-saffron-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-ink-700 mb-2"
                    >
                      Phone Number *
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="Your phone number"
                      className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink-800 outline-none focus:border-saffron-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-ink-700 mb-2"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink-800 outline-none focus:border-saffron-500"
                    />
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              <div className="pt-4">
                <h2 className="font-display text-2xl text-ink-800 mb-5">
                  Stay details
                </h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="checkIn"
                      className="block text-sm font-semibold text-ink-700 mb-2"
                    >
                      Check-in *
                    </label>

                    <input
                      id="checkIn"
                      name="checkIn"
                      type="date"
                      required
                      className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink-800 outline-none focus:border-saffron-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkOut"
                      className="block text-sm font-semibold text-ink-700 mb-2"
                    >
                      Check-out *
                    </label>

                    <input
                      id="checkOut"
                      name="checkOut"
                      type="date"
                      required
                      className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink-800 outline-none focus:border-saffron-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="guests"
                      className="block text-sm font-semibold text-ink-700 mb-2"
                    >
                      Number of Guests *
                    </label>

                    <select
                      id="guests"
                      name="guests"
                      required
                      defaultValue=""
                      className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink-800 outline-none focus:border-saffron-500"
                    >
                      <option value="" disabled>
                        Select guests
                      </option>
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="5">5 Guests</option>
                      <option value="6+">6+ Guests</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="room"
                      className="block text-sm font-semibold text-ink-700 mb-2"
                    >
                      Room Preference
                    </label>

                    <select
                      id="room"
                      name="room"
                      defaultValue=""
                      className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink-800 outline-none focus:border-saffron-500"
                    >
                      <option value="" disabled>
                        Select room type
                      </option>
                      <option value="standard">
                        Standard Room
                      </option>
                      <option value="attached-bathroom">
                        Attached Bathroom Room
                      </option>
                      <option value="any">
                        Any Available Room
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="pt-4">
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-ink-700 mb-2"
                >
                  Additional Information
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Tell us anything we should know about your stay..."
                  className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink-800 outline-none resize-none focus:border-saffron-500"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-pine-700 text-sand-50 px-8 py-3 rounded-full text-sm font-semibold hover:bg-pine-800 transition-colors shadow-sm"
                >
                  Send Booking Inquiry
                </button>

                <p className="mt-3 text-xs text-ink-500">
                  Submitting this form is an inquiry only. Your booking will
                  be confirmed after we contact you and verify availability.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Contact Information */}
        <aside className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-saffron-600 font-semibold mb-2">
              Need help?
            </p>

            <h2 className="font-display text-3xl text-ink-800 mb-4">
              Talk to us directly
            </h2>

            <p className="text-ink-600 leading-7">
              If you need a room urgently or have questions about availability,
              you can contact us directly.
            </p>
          </div>

          <div className="rounded-2xl bg-sand-50 border border-sand-200 p-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-saffron-600 font-semibold mb-1">
                Phone
              </p>

              <p className="text-ink-700">
                9855057330
                <br />
                9845085316
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-saffron-600 font-semibold mb-1">
                Email
              </p>

              <p className="text-ink-700 break-all">
                bisekatithigriha@gmail.com
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-saffron-600 font-semibold mb-1">
                Location
              </p>

              <p className="text-ink-700">
                Cancer Gate No. 1,
                <br />
                Bharatpur-7, Chitwan
              </p>
            </div>
          </div>

          <a
            href="tel:9855057330"
            className="block text-center bg-pine-700 text-sand-50 px-6 py-3 rounded-full text-sm font-semibold hover:bg-pine-800 transition-colors shadow-sm"
          >
            Call Us
          </a>
        </aside>
      </div>
    </section>
  );
}
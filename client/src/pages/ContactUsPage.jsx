import { useState } from 'react';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const offices = [
    {
      country: 'United Kingdom',
      city: 'London',
      address: '1 St Katharine\'s Way, London, E1W 1UN',
      phone: '+44 20 8191 1814',
      email: 'gb@zoltanvisa.com',
      timezone: 'GMT'
    },
    {
      country: 'India',
      city: 'Mumbai',
      address: 'Coming Soon',
      phone: '+91 95020 60511',
      email: 'in@zoltanvisa.com',
      timezone: 'IST'
    },
    {
      country: 'Singapore',
      city: 'Singapore',
      address: 'Coming Soon',
      phone: '+65 XXXX XXXX',
      email: 'sg@zoltanvisa.com',
      timezone: 'SGT'
    },
    {
      country: 'UAE',
      city: 'Dubai',
      address: 'Coming Soon',
      phone: '+971 X XXX XXXX',
      email: 'ae@zoltanvisa.com',
      timezone: 'GST'
    }
  ];

  return (
    <main className="pt-24">
      {/* Hero Section */}
      <section className="relative py-16 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary font-headline font-bold text-sm tracking-wide">
              GET IN TOUCH
            </span>
            <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-6 text-on-surface">
              Contact <span className="text-primary">Zoltan Visa</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
              We are here to help with all your visa and travel needs. Reach out to us through any of our global offices or contact channels.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="py-12 px-6 md:px-12 bg-white">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a 
              href="https://wa.me/919502060511"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-container-low p-8 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="font-headline text-xl font-bold mb-2 text-on-surface">WhatsApp</h3>
              <p className="text-on-surface-variant mb-4">Chat with us instantly for quick assistance</p>
              <p className="text-primary font-semibold">+91 95020 60511</p>
            </a>

            <a 
              href="tel:+442081911814"
              className="bg-surface-container-low p-8 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-3xl">phone</span>
              </div>
              <h3 className="font-headline text-xl font-bold mb-2 text-on-surface">Phone</h3>
              <p className="text-on-surface-variant mb-4">Call us for immediate support</p>
              <p className="text-primary font-semibold">+44 20 8191 1814</p>
            </a>

            <a 
              href="mailto:gb@zoltanvisa.com"
              className="bg-surface-container-low p-8 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-3xl">email</span>
              </div>
              <h3 className="font-headline text-xl font-bold mb-2 text-on-surface">Email</h3>
              <p className="text-on-surface-variant mb-4">Send us detailed inquiries</p>
              <p className="text-primary font-semibold">gb@zoltanvisa.com</p>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form & Office Locations */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm">
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-6 text-on-surface">
                Send Us a Message
              </h2>
              <p className="text-on-surface-variant mb-8">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface appearance-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                    >
                      <option value="">Select a subject</option>
                      <option value="visa-inquiry">Visa Inquiry</option>
                      <option value="booking">Travel Booking</option>
                      <option value="document">Document Assistance</option>
                      <option value="general">General Question</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                    placeholder="Tell us about your travel plans and how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold px-10 py-4 rounded-xl hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Send Message
                    </>
                  )}
                </button>

                {submitStatus === 'success' && (
                  <div className="bg-green-500/10 text-green-700 p-4 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined">check_circle</span>
                    <p className="font-medium">Thank you! Your message has been sent successfully. We'll get back to you soon.</p>
                  </div>
                )}
              </form>
            </div>

            {/* Office Locations */}
            <div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-6 text-on-surface">
                Our Global Offices
              </h2>
              <p className="text-on-surface-variant mb-8">
                Visit us at any of our offices across the world. We are always ready to assist you in person.
              </p>

              <div className="space-y-6">
                {offices.map((office, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">location_on</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-headline text-lg font-bold text-on-surface">
                            {office.city}, {office.country}
                          </h3>
                          <span className="px-2 py-1 bg-surface-container-low rounded text-xs font-medium text-outline">
                            {office.timezone}
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-sm mb-3">
                          {office.address}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 text-sm">
                          <a 
                            href={`tel:${office.phone.replace(/\s/g, '')}`}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <span className="material-symbols-outlined text-sm">phone</span>
                            {office.phone}
                          </a>
                          <a 
                            href={`mailto:${office.email}`}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <span className="material-symbols-outlined text-sm">email</span>
                            {office.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Working Hours */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
              Working Hours
            </h2>
            <p className="text-on-surface-variant mt-2">
              Our customer support is available around the clock
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-surface-container-low p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary">schedule</span>
              </div>
              <h3 className="font-headline font-bold text-lg mb-2">Customer Support</h3>
              <p className="text-on-surface-variant">24/7 Available</p>
              <p className="text-sm text-outline mt-1">Always here to help</p>
            </div>

            <div className="bg-surface-container-low p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary">business</span>
              </div>
              <h3 className="font-headline font-bold text-lg mb-2">Office Hours</h3>
              <p className="text-on-surface-variant">Mon - Fri: 9AM - 6PM</p>
              <p className="text-sm text-outline mt-1">Local time for each office</p>
            </div>

            <div className="bg-surface-container-low p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary">bolt</span>
              </div>
              <h3 className="font-headline font-bold text-lg mb-2">Emergency Support</h3>
              <p className="text-on-surface-variant">Priority Assistance</p>
              <p className="text-sm text-outline mt-1">For urgent visa matters</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-br from-primary/5 to-primary-container/10">
        <div className="max-w-screen-2xl mx-auto text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-6 text-on-surface">
            Prefer to Chat?
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-8">
            Our WhatsApp support is the fastest way to get answers to your questions. Click below to start a conversation.
          </p>
          <a 
            href="https://wa.me/919502060511"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-headline font-bold px-10 py-4 rounded-xl hover:shadow-xl transition-all"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
};

export default ContactUsPage;

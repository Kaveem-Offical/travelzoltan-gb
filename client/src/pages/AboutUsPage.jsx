const AboutUsPage = () => {
  return (
    <main className="pt-24">
      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary font-headline font-bold text-sm tracking-wide">
              ABOUT ZOLTAN VISA
            </span>
            <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-6 text-on-surface">
              Your Trusted Partner in <span className="text-primary">Global Travel</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
              With over 20 years of excellence, we simplify visa processing and travel planning for thousands of customers worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-gradient-to-r from-primary/5 to-primary-container/10 rounded-2xl p-8 md:p-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">target</span>
              </div>
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-6 text-on-surface">
                Our Mission
              </h2>
              <p className="text-xl md:text-2xl text-on-surface-variant leading-relaxed font-medium">
                To provide hassle free, smooth visa assistance with exceptional travel experience to everyone traveling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-6 text-on-surface">
                Company Overview
              </h2>
              <div className="space-y-4 text-on-surface-variant text-lg leading-relaxed">
                <p>
                  We find immense pleasure in introducing ourselves <strong className="text-on-surface">"Zoltan Visa"</strong> — a sister company of Travel Zoltan with over 20 years of experience, now one of the leading travel companies in India. We are a multi-national company established in <strong className="text-on-surface">India, UK, Singapore, and UAE</strong>.
                </p>
                <p>
                  "Zoltan Visa" was established with a goal to provide hassle free and smooth visa assistance which enables our clients to travel around the world without worrying about minute details of the visa application process and get complete assistance right from the beginning till obtaining the visa.
                </p>
                <p>
                  We are highly professionals with a team of extensive experience in the travel industry. Our team of professionals ensures that our customers get the best assistance and consultancy to get their visa so that they can travel to their intended destination with peace of mind.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow text-center">
                    <p className="text-4xl font-bold text-primary mb-2">20+</p>
                    <p className="text-sm text-outline">Years Experience</p>
                  </div>
                  <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow text-center">
                    <p className="text-4xl font-bold text-primary mb-2">80+</p>
                    <p className="text-sm text-outline">Countries Served</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow text-center">
                    <p className="text-4xl font-bold text-primary mb-2">4</p>
                    <p className="text-sm text-outline">Global Offices</p>
                  </div>
                  <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow text-center">
                    <p className="text-4xl font-bold text-primary mb-2">99.8%</p>
                    <p className="text-sm text-outline">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4 text-on-surface">
              What Makes Us Different?
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Our unique approach sets us apart from other travel companies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'assignment',
                title: 'Complete Document Assessment',
                desc: 'Thorough review and guidance to fit eligibility criteria for visa approval.'
              },
              {
                icon: 'visibility',
                title: 'Complete Transparency',
                desc: 'Clear and honest process with no hidden fees or surprises.'
              },
              {
                icon: 'timer',
                title: 'Fastest Processing',
                desc: 'Expedited visa processing with the best possible turnaround time.'
              },
              {
                icon: 'support_agent',
                title: '24/7 Assistance',
                desc: 'Round-the-clock support available whenever you need help.'
              },
              {
                icon: 'savings',
                title: 'Best Market Price',
                desc: 'Competitive pricing without compromising on quality service.'
              },
              {
                icon: 'sentiment_very_satisfied',
                title: 'Complete Satisfaction',
                desc: 'Customer happiness is our ultimate goal and measure of success.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-surface-container-low p-8 rounded-xl hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-3 text-on-surface">{item.title}</h3>
                <p className="text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple 3-Step Process */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4 text-on-surface">
              Simple 3-Step Process
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Straightforward and easy way of applying in just 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', icon: 'call', title: 'Contact', desc: 'Reach out to us via phone, email, or chat' },
              { step: '2', icon: 'upload_file', title: 'Send Documents', desc: 'Share your documents securely with us' },
              { step: '3', icon: 'badge', title: 'Apply for Visa', desc: 'We handle the entire application process' }
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                  <span className="material-symbols-outlined text-white text-3xl">{item.icon}</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-2 text-on-surface">{item.title}</h3>
                <p className="text-on-surface-variant">{item.desc}</p>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full">
                    <span className="material-symbols-outlined text-primary/30 text-4xl">arrow_forward</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 via-white to-primary-container/10 rounded-2xl p-8 md:p-16">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4 text-on-surface">
                Travel Services Beyond Visa
              </h2>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
                After visa approval, access exclusive services from our sister company Travel Zoltan at attractive prices
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: 'flight', title: 'Flight Tickets' },
                { icon: 'hotel', title: 'Hotel Bookings' },
                { icon: 'local_taxi', title: 'Airport Transfers' },
                { icon: 'car_rental', title: 'Car Hire' },
                { icon: 'shield', title: 'Travel Insurance' },
                { icon: 'beach_access', title: 'Holiday Packages' },
                { icon: 'business_center', title: 'Business Travel' },
                { icon: 'concierge', title: 'Concierge Services' }
              ].map((service, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-all">
                  <span className="material-symbols-outlined text-primary text-3xl mb-3">{service.icon}</span>
                  <p className="font-semibold text-on-surface text-sm">{service.title}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <p className="text-on-surface-variant mb-4">Also visit our sister company for all travel services</p>
              <a 
                href="https://www.travelzoltan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
              >
                www.travelzoltan.com <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-highest">
        <div className="max-w-screen-2xl mx-auto text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-6 text-on-surface">
            Ready to Start Your Journey?
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-8">
            We are here for all your travel needs. If you are planning to travel, don't hesitate to contact us or use the chat button to get in touch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#support" 
              className="bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold px-10 py-4 rounded-xl hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">chat</span>
              Chat With Us
            </a>
            <a 
              href="mailto:concierge@visacurator.com" 
              className="bg-surface-container-lowest text-on-surface font-headline font-bold px-10 py-4 rounded-xl hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 border border-outline"
            >
              <span className="material-symbols-outlined">mail</span>
              Email Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUsPage;

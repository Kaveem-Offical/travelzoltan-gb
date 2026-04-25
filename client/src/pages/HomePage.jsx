import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [citizenship, setCitizenship] = useState('');
  const [destination, setDestination] = useState('');
  const [otherCitizenship, setOtherCitizenship] = useState('');
  const [otherDestination, setOtherDestination] = useState('');
  const [citizenshipOptions, setCitizenshipOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch citizenship and destination options from API
  useEffect(() => {
    const fetchVisaOptions = async () => {
      try {
        console.log('[HomePage] Fetching from:', `${API_URL}/visa-options`);
        const response = await fetch(`${API_URL}/visa-options`);
        console.log('[HomePage] Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[HomePage] Received data:', data);
          setCitizenshipOptions(data.citizenships || []);
          setDestinationOptions(data.destinations || []);
        } else {
          const errorText = await response.text();
          console.error('[HomePage] Failed to fetch visa options:', errorText);
          // Fallback to hardcoded options if API fails
          setCitizenshipOptions(['United Kingdom', 'Europe Nationals']);
          setDestinationOptions(['Europe (Schengen States)', 'USA', 'Canada', 'Australia', 'Dubai', 'New Zealand', 'India', 'Japan']);
        }
      } catch (error) {
        console.error('[HomePage] Error fetching visa options:', error);
        // Fallback to hardcoded options if API fails
        setCitizenshipOptions(['United Kingdom', 'Europe Nationals']);
        setDestinationOptions(['Europe (Schengen States)', 'USA', 'Canada', 'Australia', 'Dubai', 'New Zealand', 'India', 'Japan']);
      } finally {
        setLoading(false);
      }
    };

    fetchVisaOptions();
  }, []);

  const handleCheckDetails = () => {
    if (!citizenship || citizenship === 'Select Citizenship') return;
    if (!destination || destination === 'Select Destination') return;

    const finalCitizenship = citizenship === 'Other Nationals' && otherCitizenship
      ? otherCitizenship
      : citizenship;
    const finalDestination = destination === 'Other Countries' && otherDestination
      ? otherDestination
      : destination;
    navigate('/checklist', {
      state: { citizenship: finalCitizenship, destination: finalDestination }
    });
  };

  return (
    <main className="pt-24">
      {/* Hero Section */}
      <section className="relative min-h-[870px] flex items-center overflow-hidden px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 z-10">
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary font-headline font-bold text-sm tracking-wide">
              THE DIGITAL CURATOR
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-6 text-on-surface">
              Worldwide Visa Assistance. <span className="text-primary">Simplified.</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
              Apply for visas, book flights, hotels, and airport transfers all in one place. Experience travel logistics reimagined for the modern explorer.
            </p>
            
            {/* Interactive Selector Box */}
            <div className="bg-surface-container-lowest editorial-shadow rounded-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 w-full space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-outline ml-1">
                  Citizenship
                </label>
                <div className="relative">
                  {citizenship === 'Other Nationals' ? (
                    <input
                      type="text"
                      value={otherCitizenship}
                      onChange={(e) => setOtherCitizenship(e.target.value)}
                      placeholder="Enter your nationality"
                      className="w-full bg-surface-container-low border-none rounded-DEFAULT py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all"
                      autoFocus
                    />
                  ) : (
                    <div className="relative group">
                      <select
                        value={citizenship}
                        onChange={(e) => setCitizenship(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-DEFAULT py-4 px-5 text-on-surface appearance-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                        disabled={loading}
                      >
                        <option value="">{loading ? 'Loading...' : 'Select Citizenship'}</option>
                        {citizenshipOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                        <option>Other Nationals</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  )}
                  {citizenship === 'Other Nationals' && (
                    <button
                      onClick={() => {
                        setCitizenship('');
                        setOtherCitizenship('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 w-full space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-outline ml-1">
                  Destination
                </label>
                <div className="relative">
                  {destination === 'Other Countries' ? (
                    <input
                      type="text"
                      value={otherDestination}
                      onChange={(e) => setOtherDestination(e.target.value)}
                      placeholder="Enter destination country"
                      className="w-full bg-surface-container-low border-none rounded-DEFAULT py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all"
                      autoFocus
                    />
                  ) : (
                    <div className="relative group">
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-DEFAULT py-4 px-5 text-on-surface appearance-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                        disabled={loading}
                      >
                        <option value="">{loading ? 'Loading...' : 'Select Destination'}</option>
                        {destinationOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                        <option>Other Countries</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  )}
                  {destination === 'Other Countries' && (
                    <button
                      onClick={() => {
                        setDestination('');
                        setOtherDestination('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={handleCheckDetails}
                className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold px-10 py-4 rounded-xl hover:shadow-xl transition-all active:scale-[0.98]"
              >
                Check Details
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative hidden lg:block h-full min-h-[600px]">
            <div className="absolute top-0 right-0 w-4/5 h-[80%] rounded-[4rem] overflow-hidden rotate-3 z-0">
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" 
                alt="Beach"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-3/4 h-[70%] rounded-[3rem] overflow-hidden -rotate-6 z-10 border-[12px] border-surface shadow-2xl">
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80" 
                alt="European Facade"
              />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-surface-container-lowest p-5 rounded-lg editorial-shadow flex items-center gap-4 animate-bounce">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>
                  check_circle
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-outline">Visa Approved</p>
                <p className="font-headline font-bold">Schengen Area</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badge Section */}
      <section className="py-12 px-6 md:px-12 bg-white border-y border-slate-100">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="shrink-0">
              <h2 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-outline">
                Trusted & Certified
              </h2>
            </div>
            <div className="w-full flex-1 flex justify-center md:justify-end overflow-hidden">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">99.8%</p>
                  <p className="text-xs text-outline">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">5000+</p>
                  <p className="text-xs text-outline">Happy Travelers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-xs text-outline">Countries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-6">
                Complete Travel Concierge
              </h2>
              <p className="text-on-surface-variant text-lg">
                We handle the complexity so you can focus on the experience. Our end-to-end services ensure your journey is seamless from takeoff to landing.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: 'flight_takeoff', 
                title: 'Global Flights', 
                desc: 'Curated routes with premium airlines at competitive institutional rates.' 
              },
              { 
                icon: 'hotel', 
                title: 'Luxury Stays', 
                desc: 'Verified accommodations ranging from boutique gems to 5-star legends.' 
              },
              { 
                icon: 'airport_shuttle', 
                title: 'Elite Transfers', 
                desc: 'Private, punctual airport transfers with professional multilingual chauffeurs.' 
              },
              { 
                icon: 'explore', 
                title: 'Tour Packages', 
                desc: 'Hand-crafted itineraries that blend popular sites with local secrets.' 
              },
            ].map((service, idx) => (
              <div 
                key={idx} 
                className="bg-surface-container-lowest p-8 rounded-lg group hover:bg-primary transition-all duration-500 editorial-shadow"
              >
                <div className="w-14 h-14 bg-surface-container-high rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl">
                    {service.icon}
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4 group-hover:text-white transition-colors">
                  {service.title}
                </h3>
                <p className="text-on-surface-variant group-hover:text-white/80 mb-6 transition-colors">
                  {service.desc}
                </p>
                <a className="inline-flex items-center gap-2 font-bold text-primary group-hover:text-white transition-colors" href="#">
                  Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid - Destinations */}
      <section id="destinations" className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
              Upcoming Tours & Destinations
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Limited-availability curated experiences for the discerning traveler.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto lg:h-[700px]">
            <div className="md:col-span-8 group relative rounded-lg overflow-hidden editorial-shadow">
              <img 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80" 
                alt="Swiss Alps"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-10 w-full">
                <span className="bg-secondary text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-4 inline-block uppercase">
                  Bestseller
                </span>
                <h3 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-4">
                  European Alpine Odyssey
                </h3>
                <p className="text-white/80 text-lg mb-8 max-w-xl">
                  A 12-day journey through the heart of Switzerland, France, and Italy.
                </p>
                <button className="bg-white text-on-surface font-bold px-8 py-4 rounded-xl hover:bg-primary hover:text-white transition-all flex items-center gap-3">
                  Contact Us <span className="material-symbols-outlined text-sm">mail</span>
                </button>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col gap-8">
              <div className="flex-1 group relative rounded-lg overflow-hidden editorial-shadow min-h-[300px]">
                <img 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80" 
                  alt="Australia"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h4 className="font-headline text-2xl font-bold text-white mb-2">
                    Australian Coastlines
                  </h4>
                  <button className="text-white font-bold text-sm flex items-center gap-2 group-hover:gap-4 transition-all">
                    Enquire Now <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 group relative rounded-lg overflow-hidden editorial-shadow min-h-[300px]">
                <img 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" 
                  alt="Japan"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h4 className="font-headline text-2xl font-bold text-white mb-2">
                    Japanese Heritage
                  </h4>
                  <button className="text-white font-bold text-sm flex items-center gap-2 group-hover:gap-4 transition-all">
                    Enquire Now <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

<section className="py-24 px-6 md:px-12">
<div className="max-w-screen-2xl mx-auto">
<div className="bg-surface-container-highest rounded-lg overflow-hidden flex flex-col lg:flex-row">
<div className="p-12 lg:p-20 lg:w-1/2">
<h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-8">Visit Our London Boutique Office</h2>
<p className="text-on-surface-variant text-lg mb-12">Prefer a face-to-face consultation? Our experts are ready to welcome you at our headquarters in the heart of London.</p>
<div className="space-y-8"> 
<div className="flex items-start gap-6">
<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary">location_on</span>
</div>
<div>
<p className="font-headline font-bold text-lg">Address</p>
<p className="text-on-surface-variant">1 St Katharine's Way, London, E1W 1UN</p>
</div>
</div>
<div className="flex items-start gap-6">
<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary">call</span>
</div>
<div>
<p className="font-headline font-bold text-lg">Direct Line</p>
<p className="text-on-surface-variant">+44 (0) 20 7123 4567</p>
</div>
</div>
<div className="flex items-start gap-6">
<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary">mail</span>
</div>
<div>
<p className="font-headline font-bold text-lg">Support</p>
<p className="text-on-surface-variant">concierge@visacurator.com</p>
</div>
</div>
</div>
</div>
<div className="lg:w-1/2 min-h-[400px] relative">
<img className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" data-alt="classic red London telephone booth on a cobblestone street with the Big Ben tower in the distance" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjhDdSU6iD4d7Dwy1w1d1kfG6K0TWhhRzr7LBgUZRIasVNgKUi66LCF09ujtNcgYUY_bBLXj7TCeN78pgSE0IocPCxvU3aj2uOIVm2R_8alBzsyp3QPGgissm6kAVvq9JLEz3EWRVDR4wyHFzFicIK1xzxw27t7lfYyZ4sYkx86BGmjCANcZGpcTfbuGR_wDnPi8GsxNXwW5a9fZw7AhUrWxd9ke7U8u_h3dOPPWsqBQsgeAmleO3E7_qTE5XmBcBEAnIACEOG7io"/>
</div>
</div>
</div>
</section>
    </main>
  );
};

export default HomePage;

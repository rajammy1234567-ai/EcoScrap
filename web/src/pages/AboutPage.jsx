import React, { useState } from 'react';
import { 
  Recycle, 
  ShieldCheck, 
  Scale, 
  Leaf, 
  Smartphone, 
  Phone, 
  Mail, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  Globe,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLAY_STORE_URL } from '../components/AppShowcase';

export const AboutPage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const materialsInfo = [
    {
      title: 'Paper & Cardboard Recycling',
      icon: '📦',
      desc: 'Recycling 1 ton of paper saves approximately 17 trees, 26,000 liters of fresh water, and 4,000 kilowatts of electricity. All collected newspapers, cardboard boxes, and office files are baled and sent to regional paper mills for pulping into fresh packaging materials.',
    },
    {
      title: 'Ferrous & Non-Ferrous Metals (Iron, Copper, Brass)',
      icon: '⚙️',
      desc: 'Metals can be recycled indefinitely without losing their structural properties. Recycling scrap copper uses 85% less energy than primary mining. Collected metals are sorted by grade, compressed into dense cubes, and melted in certified induction furnaces.',
    },
    {
      title: 'Electronic Waste & IT Equipment (E-Waste)',
      icon: '💻',
      desc: 'E-Waste contains hazardous substances like lead, cadmium, and mercury which poison groundwater if dumped in landfills. EcoScrap safely dismantles electronics, recovering gold, copper, and aluminium while neutralizing hazardous battery components.',
    },
    {
      title: 'Large Household Appliances (White Goods)',
      icon: '❄️',
      desc: 'Old refrigerators, washing machines, and air conditioners contain fluorocarbon refrigerants (CFCs/HFCs). Our specialized handling ensures safe degassing before the steel chassis, copper coils, and compressors are reclaimed.',
    },
  ];

  const faqs = [
    {
      q: 'What is EcoScrap and how does the Mobile App work?',
      a: 'EcoScrap is an organized, technology-driven doorstep scrap collection and franchise recycling platform. Through the official EcoScrap Android App, customers can view live daily rates, book free doorstep pickups, track verified collection heroes live on GPS, and receive instant digital payments.',
    },
    {
      q: 'Where can I download the official EcoScrap App?',
      a: 'The official mobile app is available for Android on the Google Play Store. It features real-time GPS tracking, daily rate updates, digital weight invoices, and one-tap payments.',
    },
    {
      q: 'How does the app verify scrap weights and prices?',
      a: 'Our pickup heroes carry government-inspected, ISO-certified digital electronic scales. The weight is displayed transparently at your doorstep, and prices match the live daily rate card on your app screen with zero manual tampering.',
    },
    {
      q: 'How and when do I receive payment for my scrap?',
      a: 'Payment is made immediately on the spot before our collector leaves your doorstep. You can choose instant UPI (Google Pay, PhonePe, Paytm, BHIM), direct bank transfer, or cash in hand.',
    },
    {
      q: 'How can I start an EcoScrap Franchise in my area?',
      a: 'Visit our Franchise Program page to explore our Collection Franchise (₹5 Lakhs) and Master Franchise (₹17 Lakhs) opportunities. Submit an application to check territory availability in your city.',
    },
    {
      q: 'What happens to the scrap after it is collected?',
      a: '100% of collected scrap is sorted, compacted, and dispatched directly to certified recycling mills and smelters. We operate with a strict Zero-Landfill policy.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Mission Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
            About EcoScrap & Recycling Technology
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Transforming Waste into Wealth with <span className="text-gradient-emerald">Smart Mobile Technology</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            EcoScrap bridges the gap between everyday consumers and industrial circular recycling. We provide transparent digital weighing, direct market pricing, and doorstep convenience powered by our mobile application.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-brand-700 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Digital Scale Integrity</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Zero manual adjustments. Our collectors carry government-inspected digital scales with clear LED displays so every gram is accounted for accurately.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-brand-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Verified Doorstep Safety</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every pickup hero undergoes Aadhaar identity verification, background checks, and wears standard EcoScrap uniforms and identification.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-brand-700 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Zero-Landfill Commitment</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every single kilogram collected is sorted by material grade and supplied directly to certified metallurgical smelters and paper pulping mills.
            </p>
          </div>
        </div>

        {/* Pan-India App Coverage Highlight */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                <span>Pan-India App Coverage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Auto-GPS Service Detection on EcoScrap App
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Wherever you are located, the EcoScrap Android App automatically detects your GPS location, checks nearest verified pickup fleet routes, and calculates instant doorstep arrival times.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md"
              >
                <Smartphone className="w-4 h-4 text-slate-950" />
                <span>Get App on Google Play</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Recycling Science Breakdown */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              How Materials Are Recycled & Reprocessed
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Discover the journey of your household items into fresh manufactured goods.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {materialsInfo.map((mat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-3xl block mb-2">{mat.icon}</span>
                <h3 className="text-base font-extrabold text-slate-900">{mat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{mat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehensive FAQs Accordion */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all bg-white"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm sm:text-base pr-4">{faq.q}</span>
                    <div className="p-1 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact & Helpline Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900">Get in Touch with EcoScrap</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Have bulk commercial scrap inquiries, apartment society collection requests, or franchise questions? Reach our helpline anytime.
              </p>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Customer Toll-Free Helpline</p>
                    <p className="text-slate-500">1800-123-9999 (Mon - Sun: 8 AM - 8 PM)</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Email Inquiries</p>
                    <p className="text-slate-500">support@ecoscrap.in / franchise@ecoscrap.in</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Collection Days</p>
                    <p className="text-slate-500">Open All 7 Days a Week</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50/80 border border-brand-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white flex items-center justify-center mx-auto shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-brand-900">Download the Official App</h4>
              <p className="text-xs text-slate-600">
                Schedule a free doorstep collection with instant UPI settlement on Google Play.
              </p>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 w-full py-3.5 rounded-xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md"
              >
                <Smartphone className="w-4 h-4" />
                <span>Get on Google Play Store</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { MaterialsShowcase } from '../components/MaterialsShowcase';
import { HowItWorks } from '../components/HowItWorks';
import { AppShowcase } from '../components/AppShowcase';
import { ImpactCalculator } from '../components/ImpactCalculator';
import { HappyCustomers } from '../components/HappyCustomers';
import { PartnerBanner } from '../components/PartnerBanner';
import { 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Home,
  Laptop
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'What is EcoScrap and how is it different from traditional kabadiwalas?',
      a: 'EcoScrap is an organized, technology-enabled scrap collection platform. Unlike traditional kabadiwalas with biased analog scales and uncertain timing, EcoScrap offers ISO-certified digital electronic scales, published daily market rates in our official app, verified background-checked collectors, and instant UPI payment.',
    },
    {
      q: 'Where can I check today\'s live daily scrap rates?',
      a: 'All daily market-linked rates for metals, copper, brass, iron, paper, plastics, e-waste, and large appliances are updated in real-time inside the official EcoScrap Android App on Google Play Store.',
    },
    {
      q: 'Where can I download the official EcoScrap Mobile App?',
      a: 'The official mobile app is available for Android on the Google Play Store. It features real-time GPS tracking of your pickup hero, instant rate alerts, digital weight invoices, and one-tap payments.',
    },
    {
      q: 'Do I need to sign up or create an account on this website?',
      a: 'No! This website is an open informative portal. You can explore all services, understand material recycling science, and learn about our Franchise opportunities with zero login or password needed.',
    },
    {
      q: 'How and when do I receive payment for my scrap?',
      a: 'Payment is transferred immediately on the spot before our collector leaves your premises via instant UPI (Google Pay, PhonePe, Paytm), direct bank transfer, or cash.',
    },
  ];

  return (
    <div className="space-y-0">
      {/* Hero Section with App Highlights & Fast Doorstep Pickup */}
      <HeroSection />

      {/* Educational Materials Showcase */}
      <MaterialsShowcase />

      {/* 4-Step Doorstep Workflow */}
      <HowItWorks />

      {/* Official Google Play Store Mobile App Showcase */}
      <AppShowcase />

      {/* Services Showcase Cards */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              End-to-End Recycling
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Recycling Solutions for Everyone
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Whether you are an individual household, apartment society, or corporate office.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-brand-700 flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Residential Pickups</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Free doorstep collection for newspapers, cartons, appliances, and metals with digital electronic weighing scales and instant UPI.
              </p>
              <Link to="/book-pickup" className="inline-flex items-center text-xs font-bold text-brand-700 hover:underline">
                <span>Book Household Pickup &rarr;</span>
              </Link>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-brand-700 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Society Green Drives</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Organized weekend collection camps for residential societies and townships with community receipts and green certification.
              </p>
              <Link to="/services" className="inline-flex items-center text-xs font-bold text-brand-700 hover:underline">
                <span>Explore Society Drives &rarr;</span>
              </Link>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-brand-700 flex items-center justify-center">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Corporate IT E-Waste</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Secure recycling of servers, laptops, and networking hardware with certified physical data destruction and ESG audit compliance.
              </p>
              <Link to="/services" className="inline-flex items-center text-xs font-bold text-brand-700 hover:underline">
                <span>View Corporate Services &rarr;</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Eco Impact Calculator */}
      <ImpactCalculator />

      {/* Customer Testimonials from Database */}
      <HappyCustomers />

      {/* Partner & Franchise Recruiting Banner */}
      <PartnerBanner />

      {/* FAQ Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to know about EcoScrap, mobile app, and doorstep recycling.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 bg-slate-50/50"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                  >
                    <span className="text-sm sm:text-base pr-4">{faq.q}</span>
                    <div className="p-1 rounded-lg bg-white border border-slate-200 text-slate-500 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-500">
              Have questions about our Franchise or Bulk Recycling?{' '}
              <Link to="/about" className="font-bold text-brand-700 hover:underline">
                Contact our helpline or explore our FAQ &rarr;
              </Link>
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

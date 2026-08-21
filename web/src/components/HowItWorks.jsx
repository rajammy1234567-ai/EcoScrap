import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Truck, Scale, Coins, ArrowRight, ShieldCheck } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      icon: Calendar,
      title: 'Schedule a Pickup',
      desc: 'Select your scrap types (paper, metal, e-waste, appliances) and choose your preferred date and convenient time slot.',
      badge: 'Takes 1 Minute',
    },
    {
      num: '02',
      icon: Truck,
      title: 'Doorstep Pickup Agent',
      desc: 'Our verified, background-checked EcoScrap pickup hero arrives at your home or office right on time with protective gear.',
      badge: 'Zero Pickup Fee',
    },
    {
      num: '03',
      icon: Scale,
      title: 'Accurate Digital Weighing',
      desc: 'All scrap is weighed in front of you using ISO-certified digital electronic scales for 100% transparency.',
      badge: 'Zero Tampering',
    },
    {
      num: '04',
      icon: Coins,
      title: 'Instant Cash / UPI Payout',
      desc: 'Receive your scrap payout immediately on the spot via Google Pay, PhonePe, Paytm UPI, Bank Transfer or cash.',
      badge: 'Instant Transfer',
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How EcoScrap Doorstep Collection Works
          </h2>
          <p className="text-base text-slate-600">
            We have eliminated the hassle of finding a local kabadiwala or carrying heavy scrap down the street. We do all the heavy lifting!
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group relative bg-slate-50 hover:bg-emerald-50/40 p-6 rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
              >
                {/* Step Number Top Right */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-3xl font-black text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-6">
                  <div className="inline-block text-[11px] font-bold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-md mb-1">
                    {step.badge}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-900 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Bottom Step connector indicator */}
                <div className="pt-3 border-t border-slate-200/60 flex items-center text-[11px] font-semibold text-brand-700">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  <span>Guaranteed Professionalism</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Bar */}
        <div className="mt-14 bg-gradient-to-r from-brand-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="space-y-2 mb-6 md:mb-0 text-center md:text-left z-10">
            <h3 className="text-2xl font-black tracking-tight">Ready to clear your household scrap today?</h3>
            <p className="text-sm text-emerald-200">
              No minimum pickup weight for bundled items. Book online in 60 seconds.
            </p>
          </div>
          <div className="flex items-center space-x-4 z-10">
            <Link
              to="/book-pickup"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-900 bg-white hover:bg-emerald-50 shadow-lg active:scale-95 transition-all"
            >
              <span>Schedule Free Pickup</span>
              <ArrowRight className="w-4 h-4 text-brand-700" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

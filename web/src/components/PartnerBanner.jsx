import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, ArrowRight, ShieldCheck, Banknote, Store, Sparkles } from 'lucide-react';

export const PartnerBanner = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-8 sm:p-12 shadow-2xl overflow-hidden border border-emerald-800/60">
          
          {/* Background shapes */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold uppercase tracking-wide">
                <Briefcase className="w-3.5 h-3.5 mr-1 text-emerald-400" /> 
                <span>EcoScrap Franchise Opportunity (FOCO & FOFO)</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Start Your Own Scrap Collection & Trading Business
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Launch a modern recycling hub in your city starting at <strong>₹5 Lakhs + GST</strong>. Get app-powered customer leads, digital scale calibration, training, and <strong>100% guaranteed immediate buyout</strong> of all collected scrap.
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-200">
                  <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>₹40k–₹50k Monthly Est. Earnings</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-200">
                  <Store className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>~1,000 Sq. Ft. Warehouse / Plot</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Zero Idle Stock • Instant Buyout</span>
                </div>
              </div>
            </div>

            {/* Right Action */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center lg:items-end justify-center gap-3">
              <Link
                to="/partner"
                className="w-full sm:w-auto lg:w-full inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-500/20 active:scale-98 transition-all"
              >
                <span>Explore Franchise Models</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-[11px] text-slate-400 text-center">
                Collection & Master Franchise tiers available
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

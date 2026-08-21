import React from 'react';
import { 
  Smartphone, 
  Star, 
  Download, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Coins
} from 'lucide-react';

export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.thekabadiwala.app";

export const AppShowcase = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden border-y border-slate-800">
      
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: App Copy & Download Badges */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wide">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Official EcoScrap Mobile Application</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Recycling Made Effortless with the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-brand-400 to-green-300">
                EcoScrap Mobile App
              </span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
              Experience India’s smartest scrap recycling platform right on your smartphone. Track your doorstep pickup agent live on Google Maps, receive instant market rate change alerts, and manage direct UPI payouts.
            </p>

            {/* App Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Live GPS Hero Tracking</h4>
                  <p className="text-xs text-slate-400">See your pickup agent’s real-time vehicle route</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Daily Rate Change Alerts</h4>
                  <p className="text-xs text-slate-400">Get notified when metal or copper rates spike</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Instant UPI & Digital Wallet</h4>
                  <p className="text-xs text-slate-400">One-tap payouts direct to GPay, PhonePe, Paytm</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Electronic Weigh Invoices</h4>
                  <p className="text-xs text-slate-400">Download digital weight slips with photo receipts</p>
                </div>
              </div>
            </div>

            {/* Play Store Rating & Download Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-brand-600 hover:from-emerald-400 hover:to-brand-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 active:scale-98 transition-all group"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <span className="text-[10px] font-bold block text-slate-900 uppercase leading-none">GET IT ON</span>
                  <span className="text-base font-extrabold leading-tight">Google Play Store</span>
                </div>
              </a>

              {/* Rating Box */}
              <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-white">4.8 ★ Rating</span>
                  <span className="text-slate-400 block text-[10px]">Over 100,000+ Downloads</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px]">
              
              {/* Glowing Phone Frame */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-brand-500 rounded-[44px] blur-2xl opacity-40 transform scale-95"></div>

              <div className="relative bg-slate-950 border-4 border-slate-800 rounded-[44px] p-4 shadow-2xl overflow-hidden ring-1 ring-slate-700">
                
                {/* Phone Speaker & Camera Notch */}
                <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                </div>

                {/* Mockup Screen Content */}
                <div className="space-y-3 bg-slate-900 rounded-3xl p-4 text-xs">
                  
                  {/* Mock Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
                        E
                      </div>
                      <span className="font-extrabold text-white text-xs">EcoScrap App</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>

                  {/* Mock Pickup Tracker Card */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-900 to-emerald-950 text-white space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-emerald-300">
                      <span>Active Pickup</span>
                      <span className="font-bold">Arriving in 18 mins</span>
                    </div>
                    <p className="font-bold text-xs text-white">Scrapper Hero is on the way</p>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 w-3/4 rounded-full"></div>
                    </div>
                  </div>

                  {/* Mock Today's Top Rates */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Today's Fast Rates</span>
                    <div className="p-2 rounded-xl bg-slate-800 flex justify-between items-center text-[11px]">
                      <span>Copper Wire</span>
                      <span className="font-extrabold text-emerald-400">₹450/Kg</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-800 flex justify-between items-center text-[11px]">
                      <span>Old Newspaper</span>
                      <span className="font-extrabold text-emerald-400">₹14/Kg</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-800 flex justify-between items-center text-[11px]">
                      <span>Split AC (1.5 Ton)</span>
                      <span className="font-extrabold text-emerald-400">₹2,000/Unit</span>
                    </div>
                  </div>

                  {/* Mock Direct Button */}
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-center text-xs transition-colors shadow-md"
                  >
                    Install from Play Store &rarr;
                  </a>

                </div>

              </div>

              {/* Floating Verified Badge */}
              <div className="absolute -bottom-4 -right-4 bg-slate-900 p-3 rounded-2xl border border-slate-700 shadow-xl flex items-center space-x-2 text-white text-xs animate-float">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-bold text-[11px]">100% Free App</p>
                  <p className="text-[9px] text-slate-400">No In-App Purchases</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

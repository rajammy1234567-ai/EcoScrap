import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Coins, 
  ShieldCheck, 
  Smartphone, 
  Star, 
  QrCode,
  MapPin,
  Clock
} from 'lucide-react';
import { PLAY_STORE_URL } from './AppShowcase';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-mesh-pattern border-b border-emerald-100/60">
      
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-emerald-200/40 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-brand-300/30 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Content & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tag badge with Play store link */}
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-brand-800 border border-emerald-300/50 shadow-sm text-xs font-extrabold uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Doorstep Scrap Recycling & Franchise Network</span>
              </span>

              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Android App Available</span>
                <span className="text-amber-400 font-bold ml-0.5">4.8★</span>
              </a>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Sell Scrap Online & Get{' '}
              <span className="text-gradient-emerald">Instant Cash</span> at Your Doorstep
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              India's transparent doorstep recycling platform. Enjoy certified digital electronic scales, verified scrap pickup heroes, zero pickup fees, and live daily rates updated directly in our official mobile app.
            </p>

            {/* Bullet Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free Doorstep Pickup</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ISO Digital Scales</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant UPI Payment</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Link
                to="/book-pickup"
                className="inline-flex items-center justify-center space-x-2 px-7 py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 hover:from-brand-800 hover:to-emerald-700 shadow-xl shadow-brand-600/25 hover:shadow-2xl hover:shadow-brand-600/35 active:scale-98 transition-all"
              >
                <Calendar className="w-5 h-5" />
                <span>Schedule Free Pickup</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl font-black text-base text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-500/20 active:scale-98 transition-all"
              >
                <Smartphone className="w-5 h-5" />
                <span>Check Live Rates on App</span>
              </a>
            </div>

            {/* Live Trust Badges */}
            <div className="pt-6 border-t border-slate-200/80 flex items-center space-x-6 sm:space-x-8 text-slate-700">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span className="text-xs font-bold text-slate-800">Verified Heroes</span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-brand-600" />
                <span className="text-xs font-bold text-slate-800">Calibrated Scales</span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-brand-600" />
                <span className="text-xs font-bold text-slate-800">Instant UPI</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive App & Booking Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-emerald-400 rounded-3xl blur-xl opacity-30 transform -rotate-1"></div>

              {/* Main Glass Card */}
              <div className="relative glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-white/80 space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2.5 rounded-2xl bg-emerald-100 text-brand-700">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">EcoScrap Mobile App</h3>
                      <p className="text-xs text-slate-500">Live Rates & GPS Pickup Scheduling</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                    4.8★ Play Store
                  </span>
                </div>

                {/* App Value Bullets */}
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-emerald-100 text-brand-700">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Live Daily Rate Updates</p>
                        <p className="text-[11px] text-slate-500">Updated daily with global commodity indices</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">In App</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-emerald-100 text-brand-700">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Live GPS Vehicle Tracking</p>
                        <p className="text-[11px] text-slate-500">Track your pickup agent live on Google Maps</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Live Map</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-emerald-100 text-brand-700">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Instant UPI Direct Transfer</p>
                        <p className="text-[11px] text-slate-500">GPay, PhonePe, Paytm or Cash on the spot</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Instant</span>
                  </div>
                </div>

                {/* Direct Google Play Download Action */}
                <div className="space-y-2 pt-1">
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 shadow-xl shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Download App on Google Play</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <p className="text-[11px] text-center text-slate-400 font-medium">
                    100% Free • No in-app purchases • Over 100,000+ Downloads
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

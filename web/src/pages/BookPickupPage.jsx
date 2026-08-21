import React from 'react';
import { 
  Smartphone, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Coins, 
  QrCode, 
  Star, 
  Download, 
  Sparkles, 
  Zap 
} from 'lucide-react';
import { PLAY_STORE_URL } from '../components/AppShowcase';

export const BookPickupPage = () => {
  const steps = [
    {
      step: '01',
      title: 'Download the Official App',
      desc: 'Install the EcoScrap Android App from Google Play Store in seconds.',
      icon: Download,
    },
    {
      step: '02',
      title: 'Select Scrap & Time Slot',
      desc: 'Pick your scrap categories, enter your address, and choose your preferred date.',
      icon: Calendar,
    },
    {
      step: '03',
      title: 'Doorstep Weighing & Instant Cash',
      desc: 'Our verified hero arrives with digital scales and pays you via instant UPI / Cash.',
      icon: Coins,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-brand-800 border border-emerald-300/50 text-xs font-extrabold uppercase tracking-wide">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Official EcoScrap Mobile App</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Schedule Your Doorstep Pickup on the{' '}
            <span className="text-gradient-emerald">EcoScrap App</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            All scrap pickup requests, live daily market rates, live GPS vehicle tracking, certified electronic weigh slips, and instant UPI transfers are managed securely inside our official Android application.
          </p>
        </div>

        {/* Hero App Download Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>4.8★ Top Rated Scrap Recycling App • 100,000+ Downloads</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                Install EcoScrap from Google Play Store to Book Pickup & Check Live Rates
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Enjoy real-time live map tracking of your pickup agent, certified digital electronic scale receipts, and instant direct payment to Google Pay, PhonePe, or Paytm.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-brand-600 hover:from-emerald-400 hover:to-brand-500 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 hover:shadow-2xl active:scale-98 transition-all"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <span className="text-[10px] font-bold block uppercase leading-none text-slate-900">GET IT ON</span>
                    <span className="text-base font-black leading-tight">Google Play Store</span>
                  </div>
                </a>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>100% Free App • Safe & Verified</span>
                </div>
              </div>
            </div>

            {/* QR Code Phone Download Widget */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-700 rounded-3xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white">Scan with Phone Camera</h3>
              <p className="text-[11px] text-slate-400">
                Point your mobile camera to open the official Play Store download page directly.
              </p>
              <div className="p-3 bg-white rounded-2xl max-w-[140px] mx-auto shadow-md">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://play.google.com/store/apps/details?id=com.thekabadiwala.app"
                  alt="Download EcoScrap App QR Code"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block">
                Quick 1-Second Scan
              </span>
            </div>

          </div>
        </div>

        {/* 3 Step Process Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Simple 3-Step Process</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">How to Book on the App</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-brand-700 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-200">
                      {s.step}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-1">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phone Helpline Support Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center justify-center sm:justify-start">
              <Phone className="w-5 h-5 mr-2 text-brand-600" />
              <span>Need Assistance with Your Pickup?</span>
            </h3>
            <p className="text-xs text-slate-600">
              Our customer care executive can assist you with society drives or app installation.
            </p>
          </div>

          <a
            href="tel:18001239999"
            className="px-6 py-3 rounded-2xl text-xs font-black text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md whitespace-nowrap transition-colors"
          >
            Call Helpline: 1800-123-9999
          </a>
        </div>

      </div>
    </div>
  );
};

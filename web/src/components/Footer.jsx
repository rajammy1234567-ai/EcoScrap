import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Recycle, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  HeartHandshake, 
  ArrowRight,
  Leaf,
  Smartphone,
  Star
} from 'lucide-react';
import { PLAY_STORE_URL } from './AppShowcase';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 mb-12 border-b border-slate-800">
          <div className="flex items-center space-x-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">ISO 14001 Certified</h4>
              <p className="text-xs text-slate-400">Green Recycling Standards</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Verified Pickup Heroes</h4>
              <p className="text-xs text-slate-400">Background Checked Fleet</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Zero-Landfill Policy</h4>
              <p className="text-xs text-slate-400">100% Reprocessed at Mills</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-emerald-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant Payment</h4>
              <p className="text-xs text-slate-400">Immediate UPI / Cash Payout</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Eco<span className="text-emerald-400">Scrap</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              India's transparent doorstep scrap recycling and structured franchise network. Connecting households, housing societies, and commercial enterprises directly with circular recycling mills.
            </p>

            {/* Official App Google Play Badge */}
            <div className="pt-2">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-all shadow-md group"
              >
                <svg className="w-6 h-6 fill-current text-emerald-400" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <span className="text-[9px] font-bold block text-slate-400 uppercase leading-none">DOWNLOAD ON</span>
                  <span className="text-xs font-black text-white leading-tight flex items-center">
                    Google Play <span className="text-amber-400 ml-1">4.8★</span>
                  </span>
                </div>
              </a>
            </div>

            <div className="pt-2 flex flex-col space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Toll-Free Helpline: 1800-123-9999 (All 7 Days: 8 AM - 8 PM)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Support: support@ecoscrap.in / franchise@ecoscrap.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Operational across Indore, Bhopal, Ujjain, Dewas, Jabalpur & Gwalior</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Recycling Services
                </Link>
              </li>
              <li>
                <Link to="/franchise" className="hover:text-emerald-400 transition-colors flex items-center text-amber-400 font-semibold">
                  <ArrowRight className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Franchise Program (₹5L)
                </Link>
              </li>
              <li>
                <Link to="/book-pickup" className="hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Schedule Free Pickup
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> About & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Scrap Categories Info */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              What We Collect
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>• Paper, Corrugated Cartons & Books</li>
              <li>• Iron, Copper, Brass & Aluminium</li>
              <li>• IT E-Waste & Computer Assets</li>
              <li>• ACs, Refrigerators & Washing Machines</li>
              <li>• Clothes & Textile Recyclables</li>
              <li>• Glass Beverage Bottles</li>
            </ul>
          </div>

          {/* Official App & Live Rates */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Live Rates on App
            </h3>
            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <p>
                Daily scrap prices for metals, copper, iron and paper are updated live inside the <strong>EcoScrap Android App</strong>.
              </p>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
              >
                <span>Check Daily Rates on Google Play &rarr;</span>
              </a>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 mt-3">
                <span className="font-bold text-white block mb-0.5">Franchise Inquiries:</span>
                <span>Contact franchise@ecoscrap.in for territory availability.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright & Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} EcoScrap Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">Safety Standards</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

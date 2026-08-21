import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Recycle, 
  Calendar, 
  Menu, 
  X, 
  Phone, 
  Smartphone,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { PLAY_STORE_URL } from './AppShowcase';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Navigation Items
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Services', path: '/services' },
    { name: 'Franchise Program', path: '/franchise', badge: '₹5L Hub' },
    { name: 'About & FAQs', path: '/about' },
  ];

  // Sliding pill state & refs
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navContainerRef = useRef(null);
  const itemRefs = useRef([]);

  const getActiveIndex = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname.startsWith('/services')) return 1;
    if (location.pathname.startsWith('/franchise') || location.pathname.startsWith('/partner')) return 2;
    if (location.pathname.startsWith('/about')) return 3;
    return -1;
  };

  const activeIdx = getActiveIndex();
  const currentTargetIdx = hoveredIdx !== null ? hoveredIdx : activeIdx;

  useEffect(() => {
    if (currentTargetIdx !== -1 && itemRefs.current[currentTargetIdx]) {
      const el = itemRefs.current[currentTargetIdx];
      setPillStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      });
    } else {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [currentTargetIdx, location.pathname]);

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-300">
      {/* Top Informative Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-brand-100 text-xs py-2 px-4 border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2 text-center sm:text-left">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3 h-3 mr-1 text-emerald-400" /> Official Mobile App
            </span>
            <span className="text-slate-300">
              India's Smart App-Driven Scrap Recycling & Franchise Platform
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <a 
              href="tel:18001239999" 
              className="text-emerald-300 hover:text-white flex items-center transition-colors"
            >
              <Phone className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>Helpline: 1800-123-9999</span>
            </a>
            <span className="text-emerald-800">|</span>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline flex items-center font-bold"
            >
              <Smartphone className="w-3.5 h-3.5 mr-1" />
              <span>Get Android App (4.8★)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300">
              <Recycle className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                Eco<span className="text-brand-600">Scrap</span>
                <span className="ml-1.5 text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-brand-800 border border-emerald-200">
                  Official App
                </span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 -mt-1">
                Recycling & Franchise Network
              </span>
            </div>
          </Link>

          {/* Ultra-Cool Sliding Navigation Bar */}
          <nav
            ref={navContainerRef}
            onMouseLeave={() => setHoveredIdx(null)}
            className="hidden md:flex items-center relative p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 shadow-inner backdrop-blur-md"
          >
            {/* Animated Sliding Pill Highlight */}
            <div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-md border border-slate-200/70 transition-all duration-300 ease-out pointer-events-none"
              style={{
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
                opacity: pillStyle.opacity,
              }}
            />

            {navLinks.map((link, idx) => {
              const isActive = activeIdx === idx;
              return (
                <Link
                  key={link.name}
                  ref={(el) => (itemRefs.current[idx] = el)}
                  to={link.path}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  className={`relative z-10 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors duration-200 flex items-center space-x-1.5 whitespace-nowrap ${
                    isActive
                      ? 'text-brand-800 font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Direct Play Store Link to view dynamic rates */}
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Smartphone className="w-4 h-4 text-slate-950" />
              <span>Check Rates on App</span>
            </a>

            <Link
              to="/book-pickup"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-brand-700 to-emerald-600 hover:from-brand-800 hover:to-emerald-700 shadow-lg shadow-brand-600/25 active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Pickup</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center space-x-2">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-amber-400 shadow-sm"
            >
              Rates on App
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navLinks.map((link, idx) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-extrabold transition-all ${
                  activeIdx === idx
                    ? 'text-brand-800 bg-emerald-50 border border-emerald-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl text-xs font-black text-slate-950 bg-amber-400 shadow-md"
            >
              <Smartphone className="w-4 h-4 text-slate-950" />
              <span>Download Official App for Live Rates (4.8★)</span>
            </a>

            <Link
              to="/book-pickup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl text-sm font-extrabold text-white bg-brand-700 shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Free Doorstep Pickup</span>
            </Link>

            <a
              href="tel:18001239999"
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100"
            >
              <Phone className="w-3.5 h-3.5 text-brand-600" />
              <span>Call Helpline: 1800-123-9999</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

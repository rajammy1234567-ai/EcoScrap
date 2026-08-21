import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Factory, 
  Laptop, 
  ShieldCheck, 
  FileText, 
  Scale, 
  Coins, 
  ArrowRight, 
  CheckCircle2, 
  Truck,
  Sparkles,
  Phone
} from 'lucide-react';

export const ServicesPage = () => {
  const services = [
    {
      id: 'residential',
      icon: Home,
      title: 'Residential & Household Scrap Pickup',
      tagline: 'Doorstep collection for homes, flats & independent houses',
      desc: 'Clear unwanted clutter from your home with zero effort. Our verified pickup heroes arrive at your doorstep, weigh all scrap accurately with digital scales in front of you, and pay you instantly on the spot.',
      features: [
        'Paper, Cardboard, Books & Magazines',
        'Iron, Copper, Brass & Aluminium scrap',
        'Old Refrigerators, ACs, TVs & Washing Machines',
        'Old Clothes, Glass bottles & Plastic containers',
        'Instant UPI (Google Pay, PhonePe, Paytm) or Cash',
      ],
      badge: 'Zero Pickup Fee',
    },
    {
      id: 'societies',
      icon: Building2,
      title: 'Apartment & Housing Society Scrap Drives',
      tagline: 'Organized weekend recycling campaigns for residential communities',
      desc: 'We organize dedicated community scrap collection drives for residential towers, gated townships, and apartment associations. Residents get maximum transparent value while the society earns green certification.',
      features: [
        'Scheduled Saturday / Sunday community collection camps',
        'Multi-collector fleet with high-capacity digital scales',
        'Individual receipts for each flat / resident',
        'Contribution to Society maintenance fund / green fund',
        'Certificate of Green Society participation',
      ],
      badge: 'Society Special Rates',
    },
    {
      id: 'corporate',
      icon: Laptop,
      title: 'Corporate & Office IT E-Waste Disposal',
      tagline: 'Secure, compliant asset recycling & certified data destruction',
      desc: 'Compliant disposal of obsolete IT infrastructure including servers, desktops, laptops, networking equipment, UPS batteries, and office furniture. Complete with green recycling certificates for ESG audits.',
      features: [
        'ISO & CPCB compliant recycling protocols',
        'Certified physical & digital data destruction',
        'Bulk pickup of IT assets, cabling & monitors',
        'Formal GST invoice & Green Recycling Certificate',
        'Safe de-installation and transport assistance',
      ],
      badge: 'ESG & ISO Compliant',
    },
    {
      id: 'industrial',
      icon: Factory,
      title: 'Factory & Commercial Metal Scrap',
      tagline: 'Heavy machinery, manufacturing offcuts & industrial scrap',
      desc: 'End-to-end commercial scrap collection for manufacturing plants, workshops, automobile garages, and construction sites. Transparent weighbridge certified measurement and timely contract settlements.',
      features: [
        'Heavy structural steel, iron rebar, copper, brass & aluminium',
        'Machinery dismantling and torch cutting on site',
        'Certified weighbridge slips for complete transparency',
        'Direct RTGS / NEFT commercial settlements',
        'Long-term recurring scrap lifting contracts',
      ],
      badge: 'Bulk Commercial Contracts',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
            Comprehensive Recycling Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Our Recycling & Collection <span className="text-gradient-emerald">Services</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            From single households to multi-acre industrial facilities, EcoScrap provides transparent, tech-driven, and green recycling services tailored to your exact needs.
          </p>
        </div>

        {/* Services List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-brand-700/20">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                      {svc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
                      {svc.title}
                    </h3>
                    <p className="text-xs font-bold text-brand-700 uppercase tracking-wide">
                      {svc.tagline}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {svc.desc}
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Key Highlights:
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {svc.features.map((f, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to="/book-pickup"
                    className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 px-4 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    <span>Request This Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href="tel:18001239999"
                    className="text-xs font-bold text-slate-600 hover:text-brand-700 flex items-center"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1" />
                    <span>Inquire: 1800-123-9999</span>
                  </a>
                </div>

              </div>
            );
          })}
        </div>

        {/* Informational Standard Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Certified Recycling Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                100% Circular Economy & Zero-Landfill Guarantee
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                EcoScrap ensures that all collected items — from scrap iron and copper to electronic printed circuit boards and plastics — are directed strictly to certified smelters and re-processing facilities.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                to="/rates"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md"
              >
                <span>View All Scrap Materials & Rates</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

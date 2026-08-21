import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { PLAY_STORE_URL } from './AppShowcase';

export const MaterialsShowcase = () => {
  const [activeTab, setActiveTab] = useState('paper');

  const materialCategories = [
    {
      id: 'paper',
      name: 'Paper & Cardboard',
      icon: '📄',
      summary: 'Newspapers, corrugated boxes, office files, notebooks & magazines.',
      environmentalFact: '1 Ton of recycled paper preserves 17 mature trees and 26,000 Liters of fresh water.',
      accepted: [
        'Daily Newspapers & Newsprint',
        'Corrugated Cardboard & Delivery Boxes',
        'School/College Notebooks & Textbooks',
        'A4 Office Printing Paper & Shredded Paper',
        'Magazines & Glossy Brochures',
      ],
      notAccepted: [
        'Wet or food-contaminated pizza boxes',
        'Wax-coated thermal receipts or carbon paper',
      ],
    },
    {
      id: 'metal',
      name: 'Iron, Copper & Metals',
      icon: '🔩',
      summary: 'Ferrous & non-ferrous metals: Heavy Iron, Copper wire, Brass & Aluminium.',
      environmentalFact: 'Copper recycling uses 85% less energy than mining and smelting new raw ore.',
      accepted: [
        'Pure Copper Wires & Armatures',
        'Structural Iron Bars, Rods & Grills',
        'Brass (Peetal) Utensils & Fittings',
        'Aluminium Window Frames & Utensils',
        'Stainless Steel Plates, Bowls & Sink Fittings',
      ],
      notAccepted: [
        'Pressurized gas cylinders with gas inside',
        'Radioactive or contaminated heavy industrial waste',
      ],
    },
    {
      id: 'ewaste',
      name: 'IT & Electronic Waste',
      icon: '💻',
      summary: 'Laptops, desktop CPUs, motherboards, CRT/LED monitors, printers & networking cables.',
      environmentalFact: 'Proper e-waste recycling stops toxic lead, cadmium, and mercury from poisoning groundwater.',
      accepted: [
        'Laptops, Notebooks & Tablets',
        'Computer CPUs, Power Supplies & RAM',
        'CRT / LCD / LED Computer Monitors',
        'Office Printers, Scanners & Fax Machines',
        'Modems, Routers, Keyboards & Mouse cables',
      ],
      notAccepted: [
        'Broken CFL mercury tubes without protective wrapping',
        'Swollen Lithium-Ion pouch batteries',
      ],
    },
    {
      id: 'appliances',
      name: 'Large Home Appliances',
      icon: '❄️',
      summary: 'Refrigerators, Split/Window ACs, Washing Machines, Gas Stoves & Microwaves.',
      environmentalFact: 'Safe degassing prevents ozone-depleting refrigerants from venting into the atmosphere.',
      accepted: [
        'Split & Window Air Conditioners (Indoor + Outdoor)',
        'Single & Double Door Refrigerators',
        'Automatic & Semi-Automatic Washing Machines',
        'Commercial & Domestic Gas Stoves / Cookers',
        'Microwave Ovens & Geysers',
      ],
      notAccepted: [
        'Wooden furniture with zero metal content',
        'Cracked plastic buckets without recyclability markings',
      ],
    },
    {
      id: 'clothes',
      name: 'Clothes & Glass',
      icon: '👕',
      summary: 'Old wearable clothes, denim jeans, bedsheets, glass bottles & jars.',
      environmentalFact: 'Textile shredding diverts non-biodegradable synthetic polyesters from open landfills.',
      accepted: [
        'Cotton T-Shirts, Shirts & Pants',
        'Denim Jeans, Bedsheets & Curtains',
        'Glass Beverage Bottles & Jam Jars',
      ],
      notAccepted: [
        'Wet or soiled rags, carpets & shoes',
        'Broken sheet mirror glass or ceramic crockery',
      ],
    },
  ];

  const current = materialCategories.find((c) => c.id === activeTab) || materialCategories[0];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
            Educational Scrap Guide
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            What Materials Does EcoScrap Accept?
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Discover accepted recyclable items and check today's live daily rates inside the official EcoScrap Android App.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center justify-start sm:justify-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {materialCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 ${
                activeTab === cat.id
                  ? 'bg-brand-700 text-white shadow-lg shadow-brand-700/25 scale-105'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-brand-800 border border-slate-200/80'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Detailed Material Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 cols: What's accepted vs not accepted */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1.5 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{current.icon}</span>
                  <h3 className="text-2xl font-black text-slate-900">{current.name}</h3>
                </div>
                <p className="text-sm text-slate-600">{current.summary}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Accepted List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                    <span>Accepted Items</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    {current.accepted.map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Not Accepted List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1.5 text-rose-500" />
                    <span>Not Accepted</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-500">
                    {current.notAccepted.map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Right 5 cols: Live Rates on App & Eco Science */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* App Live Rate Callout Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-900 to-emerald-950 text-white space-y-3 shadow-md">
                <div className="flex justify-between items-center text-xs text-emerald-300">
                  <span>Daily Live Rates</span>
                  <span className="text-[10px] uppercase font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                    In Official App
                  </span>
                </div>
                <p className="text-lg font-black text-white">
                  Check Today's Real-Time Market Rates for {current.name}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Scrap commodity prices fluctuate daily. Open the EcoScrap App to view exact rates per kg and schedule calibrated doorstep collection.
                </p>

                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl font-black text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-colors w-full justify-center"
                >
                  <Smartphone className="w-4 h-4 text-slate-950" />
                  <span>View {current.name} Rates on App &rarr;</span>
                </a>
              </div>

              {/* Eco Fact Box */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-brand-200 text-xs text-brand-950 space-y-1.5">
                <span className="font-extrabold text-brand-900 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Environmental Fact
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {current.environmentalFact}
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

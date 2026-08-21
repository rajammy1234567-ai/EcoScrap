import React, { useState } from 'react';
import { 
  Building2, 
  Store, 
  TrendingUp, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  Coins, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Phone, 
  Clock, 
  Sparkles, 
  Users, 
  Briefcase, 
  Award, 
  HelpCircle, 
  Scale, 
  AlertCircle,
  Truck,
  RotateCw,
  QrCode,
  Smartphone,
  Check,
  Megaphone,
  Globe,
  Handshake,
  BarChart3,
  Flame,
  Zap,
  Leaf
} from 'lucide-react';
import { POPULAR_CITIES } from '../services/api';
import { PLAY_STORE_URL } from '../components/AppShowcase';

export const PartnerPage = () => {
  const [activeTab, setActiveTab] = useState('collection'); // 'collection' or 'master'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'Indore',
    pincode: '452001',
    investmentTier: 'Collection Franchise (₹5 Lakhs + GST)',
    businessModel: 'FOCO (Franchise Owned, Company Operated)',
    spaceAvailable: '1,000 sq. ft.',
    notes: '',
  });

  const [submittedApp, setSubmittedApp] = useState(null);
  const [loading, setLoading] = useState(false);

  const rateMatrix = [
    { name: 'Iron / MS', market: '₹24 - 36', buying: '₹25 - 29', selling: '₹30 - 34', margin: '₹3 - 6' },
    { name: 'Stainless Steel', market: '₹40 - 55', buying: '₹42 - 48', selling: '₹50 - 55', margin: '₹4 - 8' },
    { name: 'Aluminium', market: '₹100 - 170', buying: '₹105 - 125', selling: '₹125 - 150', margin: '₹10 - 25' },
    { name: 'Copper', market: '₹500 - 750', buying: '₹520 - 600', selling: '₹600 - 700', margin: '₹50 - 100' },
    { name: 'Brass (Peetal)', market: '₹400 - 500', buying: '₹410 - 440', selling: '₹460 - 490', margin: '₹30 - 60' },
    { name: 'Newspaper', market: '₹12 - 16', buying: '₹12 - 13', selling: '₹15 - 16', margin: '₹2 - 3' },
    { name: 'Office Paper', market: '₹8 - 12', buying: '₹8 - 9', selling: '₹11 - 12', margin: '₹2 - 3' },
    { name: 'Cardboard', market: '₹6 - 10', buying: '₹6 - 7', selling: '₹9 - 10', margin: '₹2 - 3' },
    { name: 'Mixed Plastic', market: '₹8 - 16', buying: '₹9 - 11', selling: '₹13 - 16', margin: '₹3 - 5' },
    { name: 'PET Bottles', market: '₹10 - 20', buying: '₹12 - 14', selling: '₹17 - 20', margin: '₹3 - 6' },
    { name: 'Old Batteries', market: '₹70 - 110', buying: '₹75 - 85', selling: '₹95 - 110', margin: '₹10 - 25' },
    { name: 'E-Waste', market: 'Highly Variable', buying: 'Grade-based', selling: 'Grade-based', margin: 'Case-by-case' },
    { name: 'Rubber', market: '₹10 - 20', buying: '₹11 - 14', selling: '₹16 - 20', margin: '₹3 - 6' },
    { name: 'Glass', market: '₹2 - 5', buying: '₹2 - 3', selling: '₹4 - 5', margin: '₹1 - 2' },
  ];

  const edgeFeatures = [
    { icon: '💡', title: 'Low Investment', desc: 'Start a scrap business with just ₹5 Lakhs + GST — accessible entry into a high-growth sector.' },
    { icon: '📊', title: 'Systematic Procurement', desc: 'App-led customer lead flow and automated scheduling remove the guesswork from sourcing.' },
    { icon: '💻', title: 'Digital Support', desc: 'Real-time pricing, digital weighing calibration, and instant payments build trust with every customer.' },
    { icon: '⚡', title: 'Immediate Scrap Buyout', desc: 'Fast inventory rotation keeps your business cash-positive with zero idle stock.' },
    { icon: '📈', title: 'Long-Term Potential', desc: 'Recurring scrap demand from households, societies, and businesses builds repeatable revenue.' },
    { icon: '🌱', title: 'Purpose-Driven Brand', desc: 'Be part of a national circular economy platform promoting sustainability and zero landfill.' },
  ];

  const roadmapSteps = [
    { num: '1', title: 'Enquiry & Discussion', desc: 'Connect with the EcoScrap franchise team to explore territory availability in your city.' },
    { num: '2', title: 'Model Selection', desc: 'Choose between FOCO (passive) or FOFO (active) based on your investment preference.' },
    { num: '3', title: 'Space Setup', desc: 'Arrange 1,000 sq. ft. (Collection) or 5,000-6,000 sq. ft. (Master) warehouse or open plot.' },
    { num: '4', title: 'Training & Onboarding', desc: 'Get hands-on training on digital weighing systems, ERP dashboard, and payment flows.' },
    { num: '5', title: 'Go Live & App Leads', desc: 'Start receiving customer pickup requests from the EcoScrap App and generate daily revenue.' },
  ];

  const masterEdges = [
    { icon: Building2, title: 'Multi-City Scale', desc: 'Manage an entire regional network across 2–3 cities instead of a single collection centre.' },
    { icon: ShieldCheck, title: 'Structured Support', desc: 'Full training, operational guidance, and a dedicated BDM assigned to your territory.' },
    { icon: Megaphone, title: 'Marketing Backing', desc: 'Dedicated regional marketing support to help you build the collection franchise network faster.' },
    { icon: TrendingUp, title: 'Higher Earning Potential', desc: 'Approx. ₹1.2–2 Lakhs monthly, scaling with regional network size and scrap volumes.' },
    { icon: Store, title: 'Long-Term Network', desc: 'Build a scalable, repeatable multi-city business across your assigned territory.' },
    { icon: Leaf, title: 'Purpose-Driven Brand', desc: 'Lead regional sustainability initiatives in partnership with circular processing mills.' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in your name and contact phone number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const generatedId = 'FRAN-' + Math.floor(100000 + Math.random() * 900000);
      setSubmittedApp({ ...formData, id: generatedId });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Slide 1: Hero Section */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>Official Franchise Opportunity</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              ECO SCRAP <span className="text-emerald-400">Franchise Program</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Start your own Scrap Collection & Trading Business with India's smart, tech-driven recycling platform.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-extrabold text-amber-300">
                Low Investment (₹5 Lakhs + GST)
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-extrabold text-emerald-300">
                FOCO & FOFO Models
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-extrabold text-white">
                App-Powered Business
              </span>
            </div>
          </div>

          {/* Metric highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800 relative z-10">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">₹40k–50k</p>
              <p className="text-xs text-slate-400">Monthly Est. Earnings (Collection)</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">₹1.2L–2L</p>
              <p className="text-xs text-slate-400">Monthly Est. Earnings (Master)</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">1,000 Sq.Ft</p>
              <p className="text-xs text-slate-400">Minimum Space Requirement</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">100%</p>
              <p className="text-xs text-slate-400">Immediate Stock Buyout Support</p>
            </div>
          </div>

        </div>

        {/* Slide 2: What is Eco Scrap? */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              About the Brand
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              What is Eco Scrap?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Eco Scrap is an advanced digital platform built to simplify scrap collection and guarantee fair value for every customer — now expanding across India through a structured franchise network.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Franchise partners get access to the same technology, verified agent network, and digital weighing & payment systems used across the Eco Scrap platform, so you can launch a professional recycling business without building infrastructure from scratch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-brand-700 flex items-center justify-center text-xl font-bold">
                ♻️
              </div>
              <h3 className="text-base font-extrabold text-slate-900">One-Stop Scrap Solution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paper, plastics, metals & e-waste — all handled on a single platform.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-brand-700 flex items-center justify-center text-xl font-bold">
                ✓
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Verified Agent Network</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trained, tracked and accountable pickup agents on every job.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-brand-700 flex items-center justify-center text-xl font-bold">
                📱
              </div>
              <h3 className="text-base font-extrabold text-slate-900">App-Driven Operations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scheduling, weighing, pricing and payments — all digital.
              </p>
            </div>
          </div>
        </div>

        {/* Slide 3 & 4: Franchise Overview & Highlights */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              Franchise Overview
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Franchise Highlights & Investment Breakdown
            </h2>
            <p className="text-sm text-slate-600">
              Select between a Local City Collection Franchise or a Multi-City Regional Master Franchise.
            </p>

            {/* Toggle buttons */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-300">
              <button
                onClick={() => setActiveTab('collection')}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  activeTab === 'collection'
                    ? 'bg-brand-700 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Collection Franchise (₹5 Lakhs)
              </button>
              <button
                onClick={() => setActiveTab('master')}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  activeTab === 'master'
                    ? 'bg-brand-700 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Master Franchise (₹17 Lakhs)
              </button>
            </div>
          </div>

          {activeTab === 'collection' ? (
            /* Collection Franchise Card */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-emerald-500/50 shadow-xl space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase">
                    City / Neighborhood Hub Level
                  </span>
                  <h3 className="text-3xl font-black text-slate-900 mt-2">
                    EcoScrap Collection Franchise
                  </h3>
                  <p className="text-sm text-slate-600">
                    Manage direct doorstep collection, local sorting & immediate buyouts in your neighborhood territory.
                  </p>
                </div>

                <div className="text-right bg-slate-900 text-white p-5 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block">Total Investment</span>
                  <span className="text-3xl font-black text-emerald-400">₹5,00,000</span>
                  <span className="text-[11px] text-slate-400 block">+ Applicable GST</span>
                </div>
              </div>

              {/* 6 Highlights from Page 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase">
                    <span>📍</span>
                    <span>Space Required</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">Approx. 1,000 sq. ft.</p>
                  <p className="text-[11px] text-slate-500">Warehouse or open area for storage & sorting.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase">
                    <span>💰</span>
                    <span>Total Investment</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">₹5 Lakhs + GST</p>
                  <p className="text-[11px] text-slate-500">One of the most accessible recycling franchises available.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase">
                    <span>🏷️</span>
                    <span>Franchise Fee</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">₹2 Lakhs</p>
                  <p className="text-[11px] text-slate-500">Covering brand licence, onboarding and training support.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase">
                    <span>📦</span>
                    <span>Stock Purchase</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">₹3 Lakhs</p>
                  <p className="text-[11px] text-slate-500">Allocated for initial scrap stock purchase & working capital.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase">
                    <span>📲</span>
                    <span>Procurement Support</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">Eco Scrap App</p>
                  <p className="text-[11px] text-slate-500">Complete sourcing assistance through the Eco Scrap App.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase">
                    <span>🔄</span>
                    <span>Business Models</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">FOCO & FOFO</p>
                  <p className="text-[11px] text-slate-500">Choose between FOCO and FOFO based on your investment style.</p>
                </div>
              </div>

              {/* What's Included & Potential Earnings (Page 4) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-6 rounded-2xl bg-emerald-50 border border-brand-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-brand-950">What's Included:</h4>
                  <p className="text-xs text-brand-900 leading-relaxed">
                    Brand licence, digital weighing integration, app access, training, marketing support & procurement assistance.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-emerald-950 text-white space-y-2">
                  <h4 className="font-extrabold text-sm text-emerald-300">Potential Monthly Earnings:</h4>
                  <p className="text-2xl font-black text-amber-400">Around ₹40,000 – ₹50,000</p>
                  <p className="text-[11px] text-slate-300">Depending on location, volumes and operations.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Master Franchise Card (Pages 16, 17, 18) */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-amber-500/50 shadow-xl space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full uppercase">
                    Master Franchise Opportunity / 2–3 Cities
                  </span>
                  <h3 className="text-3xl font-black text-slate-900 mt-2">
                    Eco Scrap Master Franchise
                  </h3>
                  <p className="text-sm text-slate-600">
                    Become the Master Franchise Partner for 2–3 cities — build and manage a complete scrap collection network across your territory, backed by Eco Scrap's technology and support.
                  </p>
                </div>

                <div className="text-right bg-slate-900 text-white p-5 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block">Total Investment</span>
                  <span className="text-3xl font-black text-amber-400">₹17,00,000</span>
                  <span className="text-[11px] text-slate-400 block">+ Applicable GST</span>
                </div>
              </div>

              {/* Master Breakdown Grid (Page 16) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Territory</span>
                  <p className="text-base font-extrabold text-slate-900">2–3 Cities</p>
                  <p className="text-[11px] text-slate-500">Exclusive Master Franchise rights for 2–3 cities.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Space Required</span>
                  <p className="text-base font-extrabold text-slate-900">5,000–6,000 sq. ft.</p>
                  <p className="text-[11px] text-slate-500">Regional facility for sorting & aggregation.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Investment</span>
                  <p className="text-base font-extrabold text-slate-900">₹17 Lakhs + GST</p>
                  <p className="text-[11px] text-slate-500">Complete regional territory rights.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Collection Network</span>
                  <p className="text-base font-extrabold text-slate-900">Territory Hub</p>
                  <p className="text-[11px] text-slate-500">All collection franchises report to Master.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Procurement System</span>
                  <p className="text-base font-extrabold text-slate-900">Eco Scrap App</p>
                  <p className="text-[11px] text-slate-500">Complete procurement support through app.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Training</span>
                  <p className="text-base font-extrabold text-slate-900">Full Guidance</p>
                  <p className="text-[11px] text-slate-500">Full training and operational guidance provided.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Marketing Support</span>
                  <p className="text-base font-extrabold text-slate-900">Dedicated BDM</p>
                  <p className="text-[11px] text-slate-500">Dedicated BDM & marketing support assigned.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Potential Earnings</span>
                  <p className="text-base font-extrabold text-emerald-700">₹1.20–2 Lakhs/mo</p>
                  <p className="text-[11px] text-slate-500">Depending on territory & scrap volumes.</p>
                </div>
              </div>

              {/* Master Franchise Role: Regional Business Head (Page 17) */}
              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Your Role: Regional Business Head</span>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white">Master Franchise</span>
                  <span>&rarr;</span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-300">Collection Franchises</span>
                  <span>&rarr;</span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-300">Scrap Collection</span>
                  <span>&rarr;</span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white">Procurement / Buyout</span>
                  <span>&rarr;</span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-slate-950 font-black">Revenue</span>
                </div>
              </div>

              {/* Why Become a Master Franchise (Page 18) */}
              <div className="space-y-4 pt-2">
                <h4 className="text-lg font-black text-slate-900">Why Become a Master Franchise?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {masterEdges.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h5 className="font-extrabold text-sm text-slate-900">{m.title}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slide 5: FOCO & FOFO Franchise Models */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              Choose Your Model
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              FOCO & FOFO Franchise Models
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FOCO Card */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-emerald-50 to-teal-50/40 border-2 border-emerald-300/80 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">FOCO Model</h3>
                  <p className="text-xs font-bold text-emerald-700">Franchise Owned, Company Operated</p>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Franchise Owned, Company Operated</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Partner invests in space & setup</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Eco Scrap manages day-to-day operations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lower involvement, steady returns</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Ideal for:</strong> investors seeking passive income</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* FOFO Card */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-amber-50 to-orange-50/40 border-2 border-amber-300/80 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">FOFO Model</h3>
                  <p className="text-xs font-bold text-amber-700">Franchise Owned, Franchise Operated</p>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Franchise Owned, Franchise Operated</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Partner manages complete operations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Full access to app, training & support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Higher control and higher earning potential</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Ideal for:</strong> hands-on entrepreneurs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 6: App-Powered Procurement */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Technology Support
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              App-Powered Procurement
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              You don't need to build a sourcing network from scratch. The Eco Scrap App streamlines the entire procurement journey for franchise partners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">1</span>
              <h4 className="font-extrabold text-base text-white">Lead Generation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customer requests flow directly into your dashboard from the app.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">2</span>
              <h4 className="font-extrabold text-base text-white">Scheduled Pickup</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assign verified agents and manage doorstep collection with ease.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">3</span>
              <h4 className="font-extrabold text-base text-white">Digital Weighing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ultra-precise measurement with real-time value calculation.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">4</span>
              <h4 className="font-extrabold text-base text-white">Instant Settlement</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pay customers instantly via UPI, bank transfer or wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Slide 7: Digital Marketing & Brand Support */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              Growth Support
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Digital Marketing & Brand Support
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 p-8 rounded-3xl bg-gradient-to-br from-brand-900 to-emerald-950 text-white space-y-4">
              <p className="text-xl sm:text-2xl font-black leading-snug">
                "Turn your waste into wealth while protecting the planet."
              </p>
              <span className="text-xs font-bold text-emerald-400 block tracking-widest uppercase">— ECO SCRAP</span>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl">📣</span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Local & Digital Campaigns</h4>
                  <p className="text-xs text-slate-600">Franchise-level marketing support to build awareness in your area.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl">🌐</span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Brand Visibility</h4>
                  <p className="text-xs text-slate-600">Use of the Eco Scrap name, logo and verified app listing.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl">🤝</span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Operational Guidance</h4>
                  <p className="text-xs text-slate-600">Ongoing training and business support from the Eco Scrap team.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 8: Circular Economy & Immediate Buyout */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              Business Model
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Circular Economy & Immediate Buyout
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <span className="text-3xl">📥</span>
              <h4 className="font-extrabold text-sm text-slate-900">Collection</h4>
              <p className="text-xs text-slate-600">Efficiently collected from doorstep.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <span className="text-3xl">♻️</span>
              <h4 className="font-extrabold text-sm text-slate-900">Recycling</h4>
              <p className="text-xs text-slate-600">Sent to specialized processing units.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <span className="text-3xl">⚙️</span>
              <h4 className="font-extrabold text-sm text-slate-900">Processing</h4>
              <p className="text-xs text-slate-600">Transformed into raw material.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <span className="text-3xl">🏪</span>
              <h4 className="font-extrabold text-sm text-slate-900">Resale</h4>
              <p className="text-xs text-slate-600">Re-introduced into the market.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 border border-brand-200 text-xs text-brand-950 flex items-start space-x-3">
            <span className="text-2xl">💵</span>
            <div>
              <strong>Immediate Buyout:</strong> Scrap collected by your franchise can be sold straight back through the Eco Scrap system, keeping inventory moving fast and cash flow healthy — <strong>no idle stock, no waiting for buyers.</strong>
            </div>
          </div>
        </div>

        {/* Slide 9: What You Can Earn (Revenue Potential) */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Revenue Potential
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              What You Can Earn
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Earnings Bar Visual */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-slate-800 border border-slate-700 space-y-6">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-emerald-400">₹40K–50K</span>
                <p className="text-xs text-slate-400">Estimated potential monthly earnings*</p>
              </div>

              <div className="flex items-end justify-between gap-3 h-32 pt-4 border-b border-slate-700">
                <div className="w-1/3 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-400">Low</span>
                  <div className="w-full bg-emerald-600/40 h-12 rounded-t-lg"></div>
                  <span className="text-[10px] text-slate-400">Tier-3</span>
                </div>
                <div className="w-1/3 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-400">Avg</span>
                  <div className="w-full bg-emerald-500/70 h-20 rounded-t-lg"></div>
                  <span className="text-[10px] text-slate-400">Tier-2</span>
                </div>
                <div className="w-1/3 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-emerald-300 font-bold">High</span>
                  <div className="w-full bg-emerald-400 h-28 rounded-t-lg"></div>
                  <span className="text-[10px] text-slate-300 font-bold">Tier-1</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3 text-xs sm:text-sm text-slate-300">
              <p className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">&rarr;</span>
                <span>Earnings vary by location, volumes and daily operations.</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">&rarr;</span>
                <span>Recurring B2B and B2C scrap demand builds steady long-term revenue.</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">&rarr;</span>
                <span>Digital pricing keeps margins transparent and fair on every transaction.</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">&rarr;</span>
                <span>Immediate buyout support keeps working capital rotating quickly.</span>
              </p>
              <p className="text-[11px] text-slate-500 pt-2 italic">
                *Figures are indicative estimates, not guaranteed returns.
              </p>
            </div>
          </div>
        </div>

        {/* Slide 10: The Eco Scrap Edge - Why Choose Eco Scrap Franchise? */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              The Eco Scrap Edge
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Why Choose Eco Scrap Franchise?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {edgeFeatures.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-2xl">{f.icon}</span>
                <h4 className="font-extrabold text-sm text-slate-900">{f.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Slide 11: Your Roadmap to Launch */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              Getting Started
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Your Roadmap to Launch
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {roadmapSteps.map((step) => (
              <div
                key={step.num}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="w-8 h-8 rounded-full bg-brand-700 text-white font-black text-xs flex items-center justify-center">
                  {step.num}
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{step.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Slide 12: Eco Scrap Rate & Distribution Model Table */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
                Rate Structure
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Eco Scrap Rate & Distribution Model
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Indicative Rate Bands (₹ / kg)
              </p>
            </div>

            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              Unit: ₹ / kg
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3.5 rounded-l-xl">#</th>
                  <th className="p-3.5">Scrap Material</th>
                  <th className="p-3.5">Indicative Market Rate (₹/kg)</th>
                  <th className="p-3.5 bg-emerald-950 text-emerald-300">Collection Franchise Buying Target (₹/kg)</th>
                  <th className="p-3.5 bg-slate-800 text-amber-300">Eco Scrap / Master Sale Target (₹/kg)</th>
                  <th className="p-3.5 rounded-r-xl bg-brand-700 text-white font-black">Suggested Franchise Margin (₹/kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {rateMatrix.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-400">{i + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.name}</td>
                    <td className="p-3.5 text-slate-600">{r.market}</td>
                    <td className="p-3.5 font-semibold text-emerald-700 bg-emerald-50/50">{r.buying}</td>
                    <td className="p-3.5 font-semibold text-slate-900 bg-slate-50">{r.selling}</td>
                    <td className="p-3.5 font-black text-brand-700 bg-brand-50/60">{r.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <strong>Important:</strong> These are indicative rate bands, not fixed promises. Scrap rates change with quality, quantity, city and market conditions.
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-brand-200 text-xs text-brand-900">
              <strong>Example:</strong> One recent published rate list showed copper at ₹580/kg, brass ₹325/kg, aluminium ₹112/kg and iron ₹28/kg, illustrating how different published markets can be.
            </div>
          </div>
        </div>

        {/* Slide 13: Recommended Distribution Structure */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Supply Chain
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Recommended Distribution Structure
            </h2>
            <p className="text-xs text-slate-300">
              This multi-level flow ensures transparency, better margins for partners and efficient supply chain management.
            </p>
          </div>

          {/* 4 Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase">1. CUSTOMER</span>
              <p className="text-xs text-slate-300">Households / Businesses</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase">2. COLLECTION FRANCHISE</span>
              <p className="text-xs text-slate-300">Collects Scrap & buys from Customer</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase">3. MASTER FRANCHISE</span>
              <p className="text-xs text-slate-300">Aggregates & manages distribution</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
              <span className="text-xs font-bold text-white uppercase">4. ECO SCRAP / RECYCLER</span>
              <p className="text-xs text-slate-300">Processes & sells to end market</p>
            </div>
          </div>

          {/* Example calculation */}
          <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
            <h4 className="font-extrabold text-sm text-white">EXAMPLE (Iron / MS — 1,000 KG Collection)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Collection Buys</span>
                <span className="text-base font-bold text-white">₹27 / kg</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Investment</span>
                <span className="text-base font-bold text-amber-400">₹27,000</span>
                <span className="text-[9px] text-slate-500 block">1,000 kg × ₹27</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Master Buys</span>
                <span className="text-base font-bold text-white">₹32 / kg</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Gross Spread</span>
                <span className="text-base font-bold text-emerald-400">₹5 / kg</span>
              </div>
              <div className="p-3 bg-emerald-600 rounded-xl col-span-2 sm:col-span-1 text-slate-950">
                <span className="text-[10px] font-bold block">Total Gross Spread</span>
                <span className="text-xl font-black text-white">₹5,000</span>
                <span className="text-[9px] block text-slate-950">1,000 kg × ₹5</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-700">
              <div>
                <strong className="text-slate-300">How the Spread is Utilized:</strong> From this ₹5,000 gross spread, the Master Franchise receives a defined commission and Eco Scrap retains balance after deducting logistics, handling, and operational costs.
              </div>
              <div>
                <strong className="text-emerald-400">Key Benefit:</strong> A fair spread ensures motivation for collection partners while maintaining profitability across the ecosystem.
              </div>
            </div>
          </div>
        </div>

        {/* Slide 14: Three-Tier Rate Model in the Eco Scrap App */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              App Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Three-Tier Rate Model in the Eco Scrap App
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              We recommend showing three rates in the Eco Scrap App for full transparency and daily rate updates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-black text-brand-700 uppercase">1. CUSTOMER RATE</span>
              <p className="text-xs text-slate-600">What the household / business receives for their scrap material.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-black text-amber-700 uppercase">2. COLLECTION FRANCHISE RATE</span>
              <p className="text-xs text-slate-600">What the collection franchise pays to the customer.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-black text-emerald-800 uppercase">3. MASTER / ECO SCRAP RATE</span>
              <p className="text-xs text-slate-600">What the collection franchise receives when material is transferred upward.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-brand-200 text-xs text-brand-900 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>This makes earning potential transparent and allows rates to be updated daily.</span>
          </div>
        </div>

        {/* Slide 15: Quick Reference Summary */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              At A Glance
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Quick Reference Summary
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Rate Basis</span>
              <p className="text-xs text-slate-700 leading-relaxed pt-1">
                Rates are indicative bands, not fixed. Change daily with market, quality, quantity & location.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Distribution Flow</span>
              <p className="text-xs text-slate-700 leading-relaxed pt-1">
                Customer &rarr; Collection Franchise &rarr; Master Franchise &rarr; Eco Scrap / Recycler
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Earning Model</span>
              <p className="text-xs text-slate-700 leading-relaxed pt-1">
                Franchise earns margin on spread between buying & selling rates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase">High-Value Materials</span>
              <p className="text-xs text-slate-700 leading-relaxed pt-1">
                Use daily app-based rates for Copper, Brass, Aluminium and other valuables.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-900 to-emerald-950 text-white text-center text-xs font-bold">
            🌱 Transparent Rates – Fair Business – Strong Network • Building a Sustainable Scrap Ecosystem
          </div>
        </div>

        {/* Slide 19: Franchise Application Form */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              Start Your Journey
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Start Your Eco Scrap Franchise
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Investment: ₹5 Lakhs + GST · Space: 1,000 Sq. Ft. · FOCO & FOFO Models Available
            </p>
            <p className="text-xs text-amber-700 font-bold">
              Limited locations available — contact Eco Scrap today to explore franchise availability in your city.
            </p>
          </div>

          {submittedApp ? (
            <div className="p-8 rounded-3xl bg-emerald-50 border border-brand-200 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-brand-700 text-white flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Application Received!</h3>
              <p className="text-xs text-slate-600">
                Thank you, <strong>{submittedApp.name}</strong>. Your franchise inquiry for <strong>{submittedApp.city}</strong> ({submittedApp.investmentTier}) has been registered with reference ID:
              </p>
              <p className="font-mono text-base font-black text-brand-800 bg-white p-2 rounded-xl border border-brand-200">
                {submittedApp.id}
              </p>
              <p className="text-xs text-slate-500">
                Our Fleet Business Development Manager will call you at <strong>{submittedApp.phone}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10 digit number"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred City / Territory</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm font-semibold outline-none text-slate-800"
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="e.g. 452001"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Franchise Tier</label>
                  <select
                    value={formData.investmentTier}
                    onChange={(e) => setFormData({ ...formData, investmentTier: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm font-semibold outline-none text-slate-800"
                  >
                    <option value="Collection Franchise (₹5 Lakhs + GST)">Collection Franchise (₹5 Lakhs + GST)</option>
                    <option value="Master Franchise (₹17 Lakhs + GST)">Master Franchise (₹17 Lakhs + GST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operating Model</label>
                  <select
                    value={formData.businessModel}
                    onChange={(e) => setFormData({ ...formData, businessModel: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm font-semibold outline-none text-slate-800"
                  >
                    <option value="FOCO (Franchise Owned, Company Operated)">FOCO (Company Operated - Passive)</option>
                    <option value="FOFO (Franchise Owned, Franchise Operated)">FOFO (Franchise Operated - Active)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Available Warehouse / Land Space</label>
                  <input
                    type="text"
                    value={formData.spaceAvailable}
                    onChange={(e) => setFormData({ ...formData, spaceAvailable: e.target.value })}
                    placeholder="e.g. 1,000 sq. ft. shed / commercial plot..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Submit Franchise Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

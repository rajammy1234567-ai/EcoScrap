import React, { useState } from 'react';
import { Leaf, Droplets, Trees, Factory, Coins, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ImpactCalculator = () => {
  const [scrapKg, setScrapKg] = useState(60);

  // Environmental conversion ratios based on EPA & recycling metrics
  const co2Saved = Math.round(scrapKg * 2.2); // ~2.2kg CO2 per kg mixed scrap recycled
  const treesPreserved = (scrapKg * 0.017).toFixed(1); // 1 ton paper = ~17 trees
  const waterSavedLiters = Math.round(scrapKg * 28); // ~28 liters per kg
  const estimatedMinCash = Math.round(scrapKg * 14);

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-800">
            Real Environmental Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            See What Your Scrap Saves for the Planet
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Recycling metal, paper, electronics, and plastics diverts harmful waste from our local landfills and drastically reduces industrial carbon emissions.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 sm:p-12 shadow-2xl">
          
          {/* Slider Controls */}
          <div className="space-y-4 mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-bold text-slate-200">
                How many kilograms of scrap do you recycle or plan to recycle?
              </label>
              <span className="text-2xl font-black text-emerald-400 bg-emerald-950/80 px-4 py-1 rounded-xl border border-emerald-700/60 inline-block text-center">
                {scrapKg} Kilograms
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={scrapKg}
              onChange={(e) => setScrapKg(Number(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>10 Kg (1 household box)</span>
              <span>150 Kg (Apartment / Office)</span>
              <span>500 Kg (Commercial)</span>
            </div>
          </div>

          {/* Impact Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Metric 1 */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700/60 text-center space-y-2 hover:border-emerald-500/50 transition-all">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Factory className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{co2Saved} kg</p>
              <p className="text-xs text-slate-400 font-medium">CO₂ Emissions Avoided</p>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700/60 text-center space-y-2 hover:border-emerald-500/50 transition-all">
              <div className="w-10 h-10 mx-auto rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
                <Trees className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{treesPreserved}</p>
              <p className="text-xs text-slate-400 font-medium">Trees Equivalent Saved</p>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700/60 text-center space-y-2 hover:border-emerald-500/50 transition-all">
              <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{waterSavedLiters.toLocaleString()} L</p>
              <p className="text-xs text-slate-400 font-medium">Freshwater Conserved</p>
            </div>

            {/* Metric 4 */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700/60 text-center space-y-2 hover:border-amber-500/50 transition-all">
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">~₹{estimatedMinCash.toLocaleString()}</p>
              <p className="text-xs text-slate-400 font-medium">Approx. Cash Earned</p>
            </div>

          </div>

          {/* Action Link */}
          <div className="mt-10 pt-6 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 flex items-center">
              <Sparkles className="w-4 h-4 mr-1 text-emerald-400" />
              Calculations are based on average life cycle analysis of mixed paper and metal recycling.
            </p>
            <Link
              to="/book-pickup"
              className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline shrink-0"
            >
              <span>Recycle this scrap now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};

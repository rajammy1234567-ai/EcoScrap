import React, { useState, useEffect } from 'react';
import { Star, Quote, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { fetchHappyCustomers } from '../services/api';
import { Link } from 'react-router-dom';

export const HappyCustomers = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHappyCustomers()
      .then((data) => {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch((err) => {
        console.error('Error loading reviews:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-400">
        Loading customer experiences...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-16 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-md mx-auto px-4 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-brand-700 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Experience Transparent Recycling</h3>
          <p className="text-xs text-slate-600">
            Schedule a free doorstep pickup today and get instant digital payments.
          </p>
          <Link
            to="/book-pickup"
            className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-700 hover:bg-brand-800"
          >
            Book Your First Pickup
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
            Real Stories, Real Trust
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Happy Customers & Doorstep Stories
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Verified feedback from customers recycling with EcoScrap.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((item, idx) => (
            <div
              key={item.id || item._id || idx}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo if available */}
                {item.photoUrl && (
                  <div className="mb-4 rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100">
                    <img
                      src={item.photoUrl}
                      alt={item.customerName || 'Customer photo'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Rating & Quote */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-emerald-100 fill-emerald-100" />
                </div>

                {/* Caption / Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4 italic">
                  "{item.caption || item.comment || 'Smooth, fast and accurate weighing service.'}"
                </p>
              </div>

              {/* User Details */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center">
                    <span>{item.customerName || 'Verified Customer'}</span>
                    <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-600" />
                  </h4>
                  {item.city && (
                    <span className="text-[10px] text-slate-500 flex items-center">
                      <MapPin className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                      {item.city}
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

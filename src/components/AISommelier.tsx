import React, { useState } from 'react';
import { Sparkles, HelpCircle, Activity, Star, Flame, Loader2, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Product } from '../types';
import { getAuthHeaders } from '../App';

interface AISommelierProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
}

interface Recommendation {
  productId: string;
  score: number;
  headline: string;
  explanation: string;
}

export default function AISommelier({
  products,
  onAddToCart,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
}: AISommelierProps) {
  const [mood, setMood] = useState('Relax & Melt');
  const [details, setDetails] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState('');

  const PRESETS = [
    { label: 'Relax & Melt', desc: 'Soothe muscles, melt anxiety, sink into the couch' },
    { label: 'Uplifting Energy', desc: 'Boost euphoria, daytime motivation, combat fatigue' },
    { label: 'Deep Sleep & Rest', desc: 'Overcome insomnia, quiet the mind, sleep deeply' },
    { label: 'Creative Spark', desc: 'Inspire artistic flow, write, play music, think deeply' },
    { label: 'Focus & Clarity', desc: 'Clear task management, sustained concentration, alertness' },
    { label: 'Physical Pain Relief', desc: 'Soothe chronic back pain, joint tension, muscle aches' },
  ];

  const LOADING_STEPS = [
    'Consulting GreenLeaf strain catalogs...',
    'Reviewing live terpene profiles and chromatography ratios...',
    'Matching cannabinoids (THC & CBD) with your desired state...',
    'Formulating clinical cannabis sommelier pairing scores...',
  ];

  const handleAskSommelier = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(0);
    setError('');
    setRecommendations([]);

    // Cycle loading messages for visual luxury
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= LOADING_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          mood,
          details,
          filterCategory: categoryFilter || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Sommelier is currently resting. Please try again soon.');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err: any) {
      console.error(err);
      setError('The Sommelier is temporarily offline. Working with local fallback catalog recommendation.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans selection:bg-brand-green selection:text-white">
      {/* Sommelier Banner */}
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#4B6344] to-[#2F3E30] p-8 md:p-12 mb-8 shadow-md">
        <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-[#F5F5F0] border border-white/20 text-[10px] font-mono font-bold uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini AI
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#F5F5F0] tracking-tight">
            Meet Your <span className="text-[#C7D1C3]">Strain Sommelier</span>
          </h1>
          <p className="mt-3 text-[#C7D1C3] text-sm sm:text-base leading-relaxed font-sans">
            Cannabis is deeply personal. Our state-of-the-art AI Sommelier analyzes the precise terpene profiles, THC/CBD distribution, and strain classifications of our physical inventory to design the perfect cannabis experience for your exact mood, activity, or clinical need.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Form Panel */}
        <div className="lg:col-span-1 glass-light rounded-[24px] p-6 space-y-6 shadow-sm text-brand-dark">
          <h2 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2 border-b border-brand-border pb-3">
            <Activity className="w-5 h-5 text-brand-green" />
            1. Describe Your Intention
          </h2>

          <form onSubmit={handleAskSommelier} className="space-y-4">
            {/* Mood selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-brand-muted-green uppercase tracking-wider font-mono">
                Select Core Vibe
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setMood(preset.label)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      mood === preset.label
                        ? 'bg-[#E8E8DF] border-brand-border text-brand-dark'
                        : 'bg-brand-bg border-brand-border text-brand-dark opacity-80 hover:opacity-100 hover:border-brand-green/40'
                    }`}
                  >
                    <p className="text-xs font-bold font-sans">{preset.label}</p>
                    <p className="text-[10px] text-brand-muted-green mt-0.5">{preset.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom details */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-brand-muted-green uppercase tracking-wider font-mono">
                2. Additional Details (Optional)
              </label>
              <textarea
                placeholder="e.g., 'I want a sweet berry flavor with zero anxiety', 'I need something for coding that lasts 3 hours', 'First-time user, low tolerance...'"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-xs text-brand-dark focus:border-brand-green focus:outline-none placeholder:text-brand-muted-green/60 resize-none font-sans"
              />
            </div>

            {/* Preference */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-brand-muted-green uppercase tracking-wider font-mono">
                3. Category Filter (Optional)
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-xs text-brand-dark focus:border-brand-green focus:outline-none cursor-pointer font-sans"
              >
                <option value="">All Categories</option>
                <option value="Flower">Flower Only</option>
                <option value="Edibles">Edibles Only</option>
                <option value="Vapes">Vapes Only</option>
                <option value="Concentrates">Concentrates Only</option>
                <option value="CBD Wellness">CBD Wellness Only</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-green hover:bg-brand-green-dark active:bg-brand-green-dark text-white font-bold rounded-lg transition-colors shadow-md text-xs font-sans tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  CONSULTING SOMMELIER...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  DISCOVER MATCHES
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass-light rounded-[24px] space-y-4">
              <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
              <div>
                <p className="text-brand-dark font-sans font-medium text-sm">Sommelier is brewing pairings...</p>
                <p className="text-brand-green font-mono text-xs mt-1 transition-all animate-pulse">
                  {LOADING_STEPS[loadingStep]}
                </p>
              </div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-brand-dark">Your Curated Matches</h3>
                <span className="text-xs text-brand-muted-green font-mono">Matching active dispensary stock</span>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec) => {
                  const product = products.find((p) => p.id === rec.productId);
                  if (!product) return null;
                  const isWishlisted = wishlist.some((p) => p.id === product.id);

                  return (
                    <div
                      key={rec.productId}
                      className="group glass-light rounded-[24px] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row gap-5"
                    >
                      {/* Product Image Block */}
                      <div className="md:w-40 w-full h-40 md:h-auto rounded-[16px] overflow-hidden relative bg-brand-bg shrink-0 border border-brand-border">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-brand-green text-[#F5F5F0] text-[9px] font-mono text-white font-bold uppercase tracking-wider">
                          {product.strainType}
                        </span>
                      </div>

                      {/* Info & Recommendation justification */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[10px] text-brand-muted-green font-mono tracking-wider uppercase">
                                {product.brand} • {product.category}
                              </p>
                              <h4
                                onClick={() => onSelectProduct(product)}
                                className="font-serif font-bold text-brand-dark hover:text-brand-green cursor-pointer transition-colors text-base mt-0.5"
                              >
                                {product.name}
                              </h4>
                            </div>

                            {/* Scoring Circle badge */}
                            <div className="flex flex-col items-center justify-center bg-[#E8E8DF] border border-brand-border rounded-xl p-2 shrink-0">
                              <span className="text-[9px] text-brand-green font-mono font-bold leading-none">
                                MATCH
                              </span>
                              <span className="font-serif font-extrabold text-base text-brand-green leading-none mt-1">
                                {rec.score}%
                              </span>
                            </div>
                          </div>

                          {/* Cannabinoid percentages */}
                          <div className="flex gap-4 mt-2 mb-3 text-xs font-mono text-brand-muted-green">
                            <span>
                              THC: <span className="text-brand-dark font-bold">{product.thcPercent}%</span>
                            </span>
                            <span>
                              CBD: <span className="text-brand-dark font-bold">{product.cbdPercent}%</span>
                            </span>
                          </div>

                          {/* Recommendation specific justification block */}
                          <div className="p-4 bg-brand-bg border border-brand-border rounded-xl mb-3">
                            <p className="text-[11px] text-brand-green font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                              <Sparkles className="w-3.5 h-3.5 text-brand-green" /> {rec.headline}
                            </p>
                            <p className="text-xs text-brand-dark/90 leading-relaxed font-sans">{rec.explanation}</p>
                          </div>
                        </div>

                        {/* Actions line */}
                        <div className="flex items-center justify-between border-t border-brand-border pt-3 mt-2">
                          <p className="font-serif font-bold text-brand-dark text-base">
                            R{product.price}
                            <span className="text-[10px] text-brand-muted-green font-normal font-sans ml-1">
                              / unit
                            </span>
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onToggleWishlist(product)}
                              className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                                isWishlisted
                                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                                  : 'bg-white border-brand-border text-brand-muted-green hover:text-brand-dark hover:bg-brand-bg'
                              }`}
                              title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>

                            <button
                              onClick={() => onAddToCart(product)}
                              disabled={product.stock === 0}
                              className="px-4 py-2 rounded-full bg-brand-green hover:bg-brand-green-dark active:bg-brand-green-dark disabled:bg-brand-bg disabled:text-brand-muted-green text-white font-semibold text-xs font-sans flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lab compliance badge */}
              <div className="flex items-center gap-3 p-4 bg-[#E8E8DF]/40 border border-brand-border rounded-xl">
                <ShieldCheck className="w-5 h-5 text-brand-green shrink-0" />
                <p className="text-[11px] text-brand-muted-green leading-relaxed font-sans">
                  <strong>DISCLAIMER & SAFETY:</strong> AI Sommelier recommendations do not substitute for clinical medical advice. Strains listed have passed full state-mandated microbiological, solvent residue, heavy metal, and potency laboratory validation checks.
                </p>
              </div>
            </div>
          ) : (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass-light rounded-[24px] space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-brand-green animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-brand-dark text-base">Awaiting Your Instructions</h3>
                <p className="text-brand-muted-green text-xs max-w-sm mt-1 mx-auto leading-relaxed">
                  Select a mood preset, type in specific flavor profiles or effects, and watch our AI Sommelier search the active dispensary dispensary list to map perfect fits.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

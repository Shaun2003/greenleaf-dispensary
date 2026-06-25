import React, { useState, useEffect } from 'react';
import { X, Star, Flame, ShieldAlert, Sparkles, Send, ShoppingBag } from 'lucide-react';
import { Product, Review } from '../types';
import { getAuthHeaders } from '../App';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Strain type colors
  const strainColors: { [key: string]: string } = {
    Indica: 'bg-purple-50 text-purple-700 border-purple-200',
    Sativa: 'bg-amber-50 text-amber-700 border-amber-200',
    Hybrid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CBD: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`/api/reviews/${product.id}`, {
        headers: { ...getAuthHeaders() },
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewError('Please complete both your name and review comment.');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          productId: product.id,
          userName: reviewName.trim(),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Could not submit review.');
      }

      setReviewSuccess(true);
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      
      // Refresh reviews list
      fetchReviews();
    } catch (err) {
      setReviewError('Failed to post review. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-md p-4 font-sans selection:bg-brand-green selection:text-white overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-brand-border rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header bar */}
        <div className="flex items-center justify-between p-5 border-b border-brand-border bg-brand-bg shrink-0">
          <span className="text-[10px] text-brand-muted-green font-mono uppercase tracking-widest">
            PRODUCT DETAILS • POTENCY CERTIFIED
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-brand-border text-brand-muted-green hover:text-brand-dark transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Image & Stats */}
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-[24px] overflow-hidden bg-brand-bg border border-brand-border relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <span className={`absolute top-3 left-3 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${strainColors[product.strainType] || 'bg-brand-bg border-brand-border text-brand-dark'}`}>
                  {product.strainType} Strain
                </span>
              </div>

              {/* Lab test sheet */}
              <div className="p-5 bg-brand-bg border border-brand-border rounded-2xl space-y-2">
                <p className="text-[10px] text-brand-green font-mono font-bold tracking-widest uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> CERTIFICATE OF LAB ANALYSIS (COA)
                </p>
                <p className="text-xs text-brand-dark/80 leading-relaxed font-mono">
                  {product.labResultsDoc || 'THC / CBD concentrations successfully certified. Zero hazardous compounds, heavy metals, or residual solvents detected.'}
                </p>
              </div>
            </div>

            {/* Right Information detail */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs text-brand-muted-green font-mono tracking-widest uppercase">
                  {product.brand} • {product.category}
                </p>
                <h2 className="font-serif font-bold text-3xl text-brand-dark tracking-tight leading-tight">
                  {product.name}
                </h2>
                
                {/* Rating line */}
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex text-brand-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current text-brand-gold' : 'text-brand-border'}`}
                      />
                    ))}
                  </div>
                  <span className="text-brand-dark font-mono font-semibold">{product.rating}</span>
                  <span className="text-brand-muted-green font-sans">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Potency indicators */}
              <div className="grid grid-cols-2 gap-4 border-y border-brand-border py-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-muted-green font-mono uppercase">THC Concentration</p>
                  <p className="font-serif font-bold text-brand-dark text-lg font-mono">{product.thcPercent}%</p>
                  <div className="w-full bg-brand-bg h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${Math.min(product.thcPercent * 3.5, 100)}%` }} className="bg-brand-green h-full rounded-full" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-muted-green font-mono uppercase">CBD Concentration</p>
                  <p className="font-serif font-bold text-brand-dark text-lg font-mono">{product.cbdPercent}%</p>
                  <div className="w-full bg-brand-bg h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${Math.min(product.cbdPercent * 3.5, 100)}%` }} className="bg-[#4a8ba8] h-full rounded-full" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-brand-muted-green font-mono uppercase">Description</p>
                <p className="text-sm text-brand-dark/90 leading-relaxed font-sans">{product.description}</p>
              </div>

              {/* Effects tags */}
              <div className="space-y-2">
                <p className="text-[10px] text-brand-muted-green font-mono uppercase">Reported Effects</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.effects.map((eff) => (
                    <span key={eff} className="px-3 py-1 bg-brand-bg border border-brand-border text-brand-dark text-[11px] font-mono rounded-lg">
                      {eff}
                    </span>
                  ))}
                </div>
              </div>

              {/* Buy actions */}
              <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-brand-muted-green font-mono uppercase">Price per Unit</p>
                  <p className="font-serif font-extrabold text-2xl text-brand-dark">R{product.price}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-brand-border bg-brand-bg rounded-full p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-brand-muted-green hover:text-brand-dark hover:bg-brand-border transition-colors cursor-pointer font-bold"
                    >
                      -
                    </button>
                    <span className="px-2 text-sm text-brand-dark font-mono font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-brand-muted-green hover:text-brand-dark hover:bg-brand-border transition-colors cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    disabled={product.stock === 0}
                    className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-full tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md disabled:bg-brand-tag disabled:text-brand-muted-green"
                  >
                    <ShoppingBag className="w-4 h-4" /> ADD TO CART
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Reviews List & Write Form Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-brand-border pt-8">
            
            {/* Read Feedback */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-brand-dark text-lg">Customer Feedback</h3>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {loadingReviews ? (
                  <p className="text-xs text-brand-muted-green font-mono">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-xs text-brand-muted-green font-mono italic">No reviews submitted for this strain yet. Be the first to write one!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-brand-bg border border-brand-border space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-brand-dark font-sans">{rev.userName}</span>
                        <span className="text-brand-muted-green font-mono">{new Date(rev.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-brand-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current text-brand-gold' : 'text-brand-border'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-brand-dark/95 font-sans leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Write a review */}
            <div className="space-y-4 bg-brand-bg p-6 rounded-2xl border border-brand-border">
              <h3 className="font-serif font-bold text-brand-dark text-lg">Review this Product</h3>
              
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-brand-muted-green font-mono uppercase">Your Name</label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. David J."
                      className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs text-brand-dark focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-brand-muted-green font-mono uppercase">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full px-2 py-2 bg-white border border-brand-border rounded-lg text-xs text-brand-dark focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green cursor-pointer"
                    >
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Good)</option>
                      <option value="3">3 Stars (Average)</option>
                      <option value="2">2 Stars (Fair)</option>
                      <option value="1">1 Star (Poor)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-brand-muted-green font-mono uppercase">Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    placeholder="Describe aroma, smoke texture, somatic effect speed..."
                    className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs text-brand-dark focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green resize-none"
                  />
                </div>

                {reviewError && <p className="text-xs text-red-500 font-mono">{reviewError}</p>}
                
                {reviewSuccess ? (
                  <p className="text-xs text-brand-green font-mono font-bold">Review submitted successfully! Potency average updated.</p>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-semibold text-xs font-sans rounded-full tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> SUBMIT REVIEW
                  </button>
                )}
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

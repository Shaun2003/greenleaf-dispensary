import { useState } from 'react';
import { BookOpen, Sparkles, AlertCircle, Info, ChevronRight, User, Clock, Calendar, HelpCircle, Activity } from 'lucide-react';
import { Article } from '../types';

interface EducateProps {
  articles: Article[];
}

export default function Educate({ articles }: EducateProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // Dosage state
  const [tolerance, setTolerance] = useState('Beginner / Low');
  const [useCase, setUseCase] = useState('Edibles (Gummies/Chocolates)');
  const [dosageResult, setDosageResult] = useState({
    dose: '1.0mg to 2.5mg THC',
    advice: 'Very mild micro-dose. Ideal for complete beginners. Feel the gentle mood elevation. Wait at least 2 to 3 full hours before taking any more.',
  });

  // Terpenes Database with Natural Tones styles
  const TERPENES = [
    { name: 'Myrcene', scent: 'Herbal, Musky, Cloves', effect: 'Deep Sedation, Muscle Relaxation, Calmness', strains: 'Granddaddy Purple, Blue Dream', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Limonene', scent: 'Citrus, Lemon, Orange', effect: 'Anxiety Relief, Mood Elevation, Daytime Focus', strains: 'Sour Diesel, Wedding Cake', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Pinene', scent: 'Sharp Pine, Forest, Woody', effect: 'Alertness, Brain Circulation, Memory Retention', strains: 'Blue Dream, Jack Herer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Caryophyllene', scent: 'Spicy, Peppery, Woody', effect: 'Anti-inflammatory, Severe Pain Relief, Safe Belly', strains: 'Wedding Cake, Sour Diesel', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'Linalool', scent: 'Floral, Lavender, Sweet', effect: 'Insomnia Cure, Mind De-stressing, Tranquility', strains: 'Granddaddy Purple', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ];

  const handleCalculateDosage = (tol: string, form: string) => {
    setTolerance(tol);
    setUseCase(form);

    if (form.startsWith('Edibles')) {
      if (tol === 'Beginner / Low') {
        setDosageResult({
          dose: '1.0mg - 2.5mg THC',
          advice: 'The standard micro-dose. Perfect for first-time edible consumers. Expect light, warm body fuzz. Always wait 2 full hours before re-dosing.',
        });
      } else if (tol === 'Moderate') {
        setDosageResult({
          dose: '5.0mg - 10.0mg THC',
          advice: 'The standard recreational dosage. Offers robust, blissful body-high and cerebral laughter. Do not operate machinery.',
        });
      } else {
        setDosageResult({
          dose: '15.0mg - 25.0mg THC',
          advice: 'High-tolerance medical dosing. Provides very deep muscle relaxation and strong visual and physical immersion. Only for seasoned consumers.',
        });
      }
    } else if (form.startsWith('Vapes')) {
      if (tol === 'Beginner / Low') {
        setDosageResult({
          dose: '1 Short Draw (1-2 seconds)',
          advice: 'Take 1 small draw, wait 10-15 minutes. Inhalables act within seconds. This allows you to scale your high extremely precisely.',
        });
      } else if (tol === 'Moderate') {
        setDosageResult({
          dose: '2 - 3 Draws (2-3 seconds)',
          advice: 'Comfortable experience. Delivers instantaneous relaxation and mind spark. Keeps you buoyant and floating for 2 to 3 hours.',
        });
      } else {
        setDosageResult({
          dose: '4+ Deep Draws',
          advice: 'Highly therapeutic high-dose. Will trigger intense body melt and cerebral euphoria. Perfect for severe pain relief.',
        });
      }
    } else {
      // Flower
      if (tol === 'Beginner / Low') {
        setDosageResult({
          dose: '1 - 2 Inhalations from Joint/Pipe',
          advice: 'Take 2 small puffs. Raw flower contains full terpenes. Wait 15 minutes to evaluate how the full-spectrum entourage effect sets in.',
        });
      } else if (tol === 'Moderate') {
        setDosageResult({
          dose: '0.25g to 0.5g Premium Flower',
          advice: 'Standard dry flower dose. High terpene aroma, cheerful laughing fit, and cozy evening vibes.',
        });
      } else {
        setDosageResult({
          dose: '0.5g+ Or full standard Joint',
          advice: 'Heavy medical dose. Complete stress eradication and deep somatic immersion. Ensure comfortable seating is nearby.',
        });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans selection:bg-brand-green selection:text-white">
      {/* Detail overlay if article is clicked */}
      {selectedArticle ? (
        <div className="glass-light rounded-[32px] p-6 md:p-10 space-y-6 shadow-sm text-brand-dark">
          <button
            onClick={() => setSelectedArticle(null)}
            className="px-4 py-2 rounded-full bg-brand-bg text-xs text-brand-green hover:bg-brand-border border border-brand-border font-mono tracking-wider cursor-pointer transition-colors"
          >
            ← BACK TO ARTICLES LIST
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-brand-muted-green font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-green text-white font-semibold">
                {selectedArticle.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {selectedArticle.readTime}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {new Date(selectedArticle.date).toLocaleDateString()}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
              {selectedArticle.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-brand-muted-green border-b border-brand-border pb-4">
              <div className="w-7 h-7 rounded-full bg-[#E8E8DF] flex items-center justify-center font-mono font-bold text-brand-green">
                {selectedArticle.author.slice(0,1)}
              </div>
              <span>Written by <span className="text-brand-dark font-semibold">{selectedArticle.author}</span></span>
            </div>
          </div>

          <div className="w-full h-64 md:h-[400px] rounded-[24px] overflow-hidden border border-brand-border">
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-brand-dark opacity-90 text-sm sm:text-base leading-relaxed max-w-none space-y-4 font-sans">
            {selectedArticle.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#E8E8DF]/60 border border-brand-border flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-brand-green shrink-0" />
            <p className="text-xs text-brand-muted-green">
              GreenLeaf education guides are compiled by regulatory experts and botanists to keep users informed about legal, safe cannabis consumption. Enjoy responsibly.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Main Title Section */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h1 className="font-serif text-3xl font-extrabold text-brand-dark tracking-tight">
              Cannabis <span className="text-brand-green">Education & Science</span>
            </h1>
            <p className="text-brand-muted-green text-sm leading-relaxed">
              Dosing safely, understanding strain biology, and exploring cannabinoid therapy are fundamental to a premium, controlled experience. Knowledge is power.
            </p>
          </div>

          {/* Interactive Dose Calculator & Terpenes Glossary Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Interactive Dose Planner */}
            <div className="glass-light rounded-[24px] p-6 space-y-5 shadow-sm text-brand-dark">
              <h2 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2 border-b border-brand-border pb-3">
                <Activity className="w-5 h-5 text-brand-green" />
                Somatic Dose Guide Planner
              </h2>
              
              <p className="text-xs text-brand-muted-green leading-relaxed font-sans">
                Edibles, vapes, and classic flowers hit your body differently. Pick your profile and consumption choice to calculate an eye-safe compliant initial starting dosage.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted-green uppercase tracking-wider font-mono mb-2">
                    My Cannabis Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner / Low', 'Moderate', 'High / Veteran'].map((t) => (
                      <button
                        key={t}
                        onClick={() => handleCalculateDosage(t, useCase)}
                        className={`py-2 px-1 text-center rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                          tolerance === t
                            ? 'bg-brand-green border-brand-green text-white font-bold'
                            : 'bg-brand-bg border-brand-border text-brand-dark opacity-80 hover:opacity-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-muted-green uppercase tracking-wider font-mono mb-2">
                    Product Intake Form
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Edibles (Gummies/Chocolates)', 'Vapes (Cartridges)', 'Flower (Smoking/Dry Vapes)'].map((f) => (
                      <button
                        key={f}
                        onClick={() => handleCalculateDosage(tolerance, f)}
                        className={`py-2 px-1 text-center rounded-lg border text-[10px] sm:text-xs font-mono transition-all cursor-pointer ${
                          useCase === f
                            ? 'bg-brand-green border-brand-green text-white font-bold'
                            : 'bg-brand-bg border-brand-border text-brand-dark opacity-80 hover:opacity-100'
                        }`}
                      >
                        {f.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Result */}
                <div className="p-5 rounded-2xl bg-brand-bg border border-brand-border space-y-2 mt-4">
                  <p className="text-[10px] text-brand-green font-mono tracking-wider uppercase font-bold">
                    Curated Safe Dosing Estimate
                  </p>
                  <p className="text-brand-dark font-serif font-extrabold text-lg">
                    {dosageResult.dose}
                  </p>
                  <p className="text-xs text-brand-dark/80 leading-relaxed font-sans">
                    {dosageResult.advice}
                  </p>
                </div>
              </div>
            </div>

            {/* Terpenes Glossary */}
            <div className="glass-light rounded-[24px] p-6 space-y-4 shadow-sm text-brand-dark">
              <h2 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2 border-b border-brand-border pb-3">
                <Sparkles className="w-5 h-5 text-brand-green" />
                The Terpenes Chemistry Glossary
              </h2>
              
              <p className="text-xs text-brand-muted-green leading-relaxed font-sans">
                Terpenes are organic aroma compounds that dictate how a strain feels. Look for these on our products' lab reports.
              </p>

              <div className="space-y-3 pt-1 max-h-[280px] overflow-y-auto pr-1">
                {TERPENES.map((terp) => (
                  <div key={terp.name} className={`p-3.5 rounded-xl border ${terp.color} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                    <div>
                      <h4 className="text-xs font-extrabold tracking-wider uppercase font-mono">{terp.name}</h4>
                      <p className="text-[10px] opacity-90 mt-0.5">Scent Profile: <span className="font-medium">{terp.scent}</span></p>
                      <p className="text-[10px] opacity-80 leading-snug mt-0.5">Therapeutic Effect: <span className="font-semibold">{terp.effect}</span></p>
                    </div>
                    <div className="text-[9px] font-mono shrink-0 bg-white/45 border border-brand-border px-2 py-1 rounded text-brand-dark">
                      Found in: {terp.strains}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Education Articles List */}
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-brand-dark border-b border-brand-border pb-3">
              Scientific Literature & Responsible Usage
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="glass-light rounded-[24px] overflow-hidden group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                >
                  <div className="h-44 overflow-hidden relative border-b border-brand-border">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-brand-green text-[#F5F5F0] text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-brand-dark">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[10px] text-brand-muted-green font-mono">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {art.readTime}</span>
                        <span>{new Date(art.date).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-serif font-bold text-brand-dark group-hover:text-brand-green transition-colors text-sm sm:text-base leading-snug line-clamp-2">
                        {art.title}
                      </h3>
                      <p className="text-brand-muted-green text-xs line-clamp-3 leading-relaxed font-sans">
                        {art.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-brand-green font-mono pt-3 border-t border-brand-bg uppercase tracking-wider">
                      <span>Read Article</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

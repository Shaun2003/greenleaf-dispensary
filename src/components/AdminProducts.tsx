import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Sparkles, CheckCircle } from 'lucide-react';
import { Product, StrainType, CategoryType } from '../types';

interface AdminProductsProps {
  products: Product[];
  onCreateProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export default function AdminProducts({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}: AdminProductsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [strainType, setStrainType] = useState<StrainType>('Hybrid');
  const [category, setCategory] = useState<CategoryType>('Flower');
  const [price, setPrice] = useState('40');
  const [thcPercent, setThcPercent] = useState('18');
  const [cbdPercent, setCbdPercent] = useState('0.1');
  const [stock, setStock] = useState('20');
  const [effectsInput, setEffectsInput] = useState('Relaxed, Happy, Creative');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [labResults, setLabResults] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleOpenAddForm = () => {
    setIsEditing(true);
    setEditId(null);
    setName('');
    setBrand('');
    setStrainType('Hybrid');
    setCategory('Flower');
    setPrice('40');
    setThcPercent('18');
    setCbdPercent('0.1');
    setStock('20');
    setEffectsInput('Relaxed, Happy, Creative');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=600&auto=format&fit=crop');
    setLabResults('THC potency validated. Passed chemical & microbial analysis.');
    setFormError('');
  };

  const handleOpenEditForm = (p: Product) => {
    setIsEditing(true);
    setEditId(p.id);
    setName(p.name);
    setBrand(p.brand);
    setStrainType(p.strainType);
    setCategory(p.category);
    setPrice(String(p.price));
    setThcPercent(String(p.thcPercent));
    setCbdPercent(String(p.cbdPercent));
    setStock(String(p.stock));
    setEffectsInput(p.effects.join(', '));
    setDescription(p.description);
    setImage(p.image);
    setLabResults(p.labResultsDoc || '');
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !brand.trim() || !description.trim()) {
      setFormError('Please fill in the product Name, Brand, and Description.');
      return;
    }

    const priceNum = Number(price);
    const thcNum = Number(thcPercent);
    const cbdNum = Number(cbdPercent);
    const stockNum = Number(stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price greater than zero.');
      return;
    }

    const effectsArray = effectsInput
      .split(',')
      .map((eff) => eff.trim())
      .filter((eff) => eff.length > 0);

    const productPayload = {
      name: name.trim(),
      brand: brand.trim(),
      strainType,
      category,
      price: priceNum,
      thcPercent: isNaN(thcNum) ? 0 : thcNum,
      cbdPercent: isNaN(cbdNum) ? 0 : cbdNum,
      stock: isNaN(stockNum) ? 0 : stockNum,
      effects: effectsArray,
      description: description.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=600&auto=format&fit=crop',
      labResultsDoc: labResults.trim() || 'State laboratory Potency, Heavy metals, and Pesticide evaluation passed.',
    };

    if (editId) {
      onUpdateProduct(editId, productPayload);
    } else {
      onCreateProduct(productPayload);
    }

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setIsEditing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 font-sans selection:bg-brand-green selection:text-white">
      {/* List Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-brand-dark text-base">Dispensary Stock & Catalog</h3>
          <p className="text-xs text-brand-muted-green font-mono">Manage products currently visible in the store</p>
        </div>

        {!isEditing && (
          <button
            onClick={handleOpenAddForm}
            className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold rounded-lg font-sans flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> ADD NEW STRAIN / PRODUCT
          </button>
        )}
      </div>

      {/* Editing overlay or form card */}
      {isEditing && (
        <div className="glass-light p-6 rounded-2xl space-y-6 shadow-sm text-brand-dark">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h4 className="font-serif font-bold text-brand-dark text-sm">
              {editId ? `Edit Product: ${name}` : 'Catalog Addition Form'}
            </h4>
            <button
              onClick={() => setIsEditing(false)}
              className="text-brand-muted-green hover:text-brand-dark p-1 rounded-full hover:bg-brand-bg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Core textuals */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sour Diesel Kush"
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">Brand / Grower</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. HighGarden Inc"
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">Strain Category</label>
                  <select
                    value={strainType}
                    onChange={(e) => setStrainType(e.target.value as StrainType)}
                    className="w-full px-2 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark cursor-pointer"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Indica">Indica</option>
                    <option value="Sativa">Sativa</option>
                    <option value="CBD">CBD Only</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">Menu Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full px-2 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark cursor-pointer"
                  >
                    <option value="Flower">Flower</option>
                    <option value="Edibles">Edibles</option>
                    <option value="Vapes">Vapes</option>
                    <option value="Concentrates">Concentrates</option>
                    <option value="CBD Wellness">CBD Wellness</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">Price (R per unit)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">THC % Potency</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thcPercent}
                    onChange={(e) => setThcPercent(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">CBD % Potency</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cbdPercent}
                    onChange={(e) => setCbdPercent(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">Physical Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">Effects (Comma-separated)</label>
                <input
                  type="text"
                  value={effectsInput}
                  onChange={(e) => setEffectsInput(e.target.value)}
                  placeholder="e.g. Euphoric, Sleepy, Pain Relief"
                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide details about aroma, terpenes profile, growth metrics, and intake warnings..."
                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark resize-none font-sans"
                />
              </div>
            </div>

            {/* Image & Lab documents section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">Product Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                />
                <div className="w-full h-32 rounded-xl bg-brand-bg border border-brand-border overflow-hidden mt-2 relative">
                  <img src={image || 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=600&auto=format&fit=crop'} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 right-1.5 bg-brand-dark/85 text-[8px] text-white px-1.5 rounded font-mono">IMAGE PREVIEW</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-muted-green font-mono uppercase">Chemical Lab Results Doc</label>
                <textarea
                  value={labResults}
                  onChange={(e) => setLabResults(e.target.value)}
                  rows={3}
                  placeholder="Potency, Pesticides detected, microbes passed details..."
                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark resize-none font-sans"
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-600 font-mono">{formError}</p>
              )}

              {formSuccess ? (
                <div className="p-3 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Item saved to database!
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-lg text-xs font-sans cursor-pointer transition-colors"
                  >
                    {editId ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 bg-brand-tag hover:bg-brand-border text-brand-dark rounded-lg text-xs font-sans cursor-pointer transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              )}
            </div>

          </form>
        </div>
      )}

      {/* Products list - Mobile Card Layout */}
      <div className="block md:hidden space-y-4">
        {products.map((p) => (
          <div key={p.id} className="glass-light p-4 space-y-3.5 shadow-xs text-brand-dark">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-brand-bg border border-brand-border shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-serif font-bold text-brand-dark text-sm leading-tight truncate">{p.name}</h4>
                <p className="text-[10px] text-brand-muted-green font-mono mt-0.5">{p.brand} • <span className="text-brand-green font-bold">{p.strainType}</span></p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-brand-tag text-brand-green border border-brand-border text-[8px] font-mono font-bold uppercase tracking-wider">
                    {p.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-brand-bg text-[11px] font-mono">
              <div>
                <p className="text-[9px] text-brand-muted-green uppercase leading-none">Price</p>
                <p className="font-bold text-brand-dark mt-1">R{p.price}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-muted-green uppercase leading-none">Potency</p>
                <p className="font-bold text-brand-dark mt-1">T: {p.thcPercent}%</p>
                <p className="text-brand-muted-green text-[9px]">C: {p.cbdPercent}%</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-muted-green uppercase leading-none">Stock</p>
                <p className={`font-bold mt-1 ${p.stock <= 5 ? 'text-rose-600 animate-pulse' : 'text-brand-dark'}`}>
                  {p.stock} units
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => handleOpenEditForm(p)}
                className="flex-1 py-2 rounded-xl bg-brand-bg hover:bg-brand-tag border border-brand-border text-brand-muted-green hover:text-brand-dark transition-colors cursor-pointer text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Details
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                    onDeleteProduct(p.id);
                  }
                }}
                className="py-2 px-3 rounded-xl bg-brand-bg hover:bg-rose-50 border border-brand-border hover:border-rose-100 text-brand-muted-green hover:text-rose-600 transition-colors cursor-pointer"
                title="Delete Product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Products list - Desktop Spreadsheet Table */}
      <div className="hidden md:block glass-light rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-bg border-b border-brand-border text-brand-dark font-mono uppercase">
                <th className="p-4">Strain Info</th>
                <th className="p-4">Category</th>
                <th className="p-4">Potency (THC/CBD)</th>
                <th className="p-4">Price</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-brand-bg/45 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-bg border border-brand-border shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover animate-fade-in" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-dark truncate max-w-[200px] sm:max-w-xs">{p.name}</p>
                      <p className="text-[10px] text-brand-muted-green font-mono">{p.brand} • <span className="text-brand-green font-bold">{p.strainType}</span></p>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-tag text-brand-green border border-brand-border text-[9px] font-mono font-bold uppercase">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono whitespace-nowrap">
                    <p className="text-brand-dark">THC: {p.thcPercent}%</p>
                    <p className="text-brand-muted-green text-[10px]">CBD: {p.cbdPercent}%</p>
                  </td>
                  <td className="p-4 font-semibold text-brand-dark font-mono">R{p.price}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`font-mono font-bold ${p.stock <= 5 ? 'text-rose-600 animate-pulse' : 'text-brand-dark'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1 shrink-0 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEditForm(p)}
                      className="p-1.5 rounded-lg bg-brand-bg hover:bg-brand-tag border border-brand-border text-brand-muted-green hover:text-brand-dark transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                          onDeleteProduct(p.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-brand-bg hover:bg-rose-50 border border-brand-border hover:border-rose-100 text-brand-muted-green hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

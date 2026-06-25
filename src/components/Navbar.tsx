import { useState } from 'react';
import { ShoppingCart, Heart, Flame, Shield, User, ChevronDown, BookOpen, Sparkles, LogIn, LogOut, ShoppingBag, Sun, Moon } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  wishlistCount: number;
  onLogout: () => void;
  onSwitchUser: (role: 'guest' | 'customer' | 'admin') => void;
  onOpenCart: () => void;
  adminSubTab?: 'overview' | 'products' | 'orders' | 'users';
  setAdminSubTab?: (subTab: 'overview' | 'products' | 'orders' | 'users') => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  onLogout,
  onSwitchUser,
  onOpenCart,
  adminSubTab,
  setAdminSubTab,
  theme = 'light',
  onToggleTheme,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [testLoginOpen, setTestLoginOpen] = useState(false);

  const navigationItems = [
    { id: 'shop', label: 'Shop', icon: Flame },
    { id: 'sommelier', label: 'AI Sommelier', icon: Sparkles, highlight: true },
    { id: 'educate', label: 'Learn', icon: BookOpen },
  ];

  // If we are on the admin onboarding/signup flow, render an isolated, clean admin header
  if (activeTab === 'admin_signup') {
    return (
      <nav className="sticky top-0 z-40 bg-[#151a13] text-white border-b border-brand-green/30 backdrop-blur-md selection:bg-brand-green selection:text-white">
        {/* Secure Top Banner Notice */}
        <div className="bg-[#8F9A7D] text-brand-dark py-1.5 text-center text-[10px] md:text-[11px] font-mono tracking-widest px-4 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 animate-pulse text-brand-dark" />
          <span>ADMINISTRATOR REGISTRATION PORTAL • SECURE ACCESS CONTROL</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo Brand with Admin Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-serif font-black text-white text-base sm:text-lg tracking-wider block leading-none">
                GREENLEAF
              </span>
              <span className="text-[9px] text-brand-green font-mono tracking-widest leading-none font-bold uppercase mt-1 block">
                ADMIN PRIVILEGE PORTAL
              </span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-brand-muted-green uppercase bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Pending Auth
          </div>
        </div>
      </nav>
    );
  }

  // If we are on the admin panel, render a fully secure administrator control hub header
  if (activeTab === 'admin' && currentUser?.role === 'admin') {
    return (
      <nav className="sticky top-0 z-40 bg-white/95 border-b border-brand-gold/30 backdrop-blur-md selection:bg-brand-green selection:text-white">
        {/* Secure Top Banner Notice */}
        <div className="bg-brand-gold text-white py-1.5 text-center text-[11px] font-mono tracking-wider px-4 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          SECURE ADMINISTRATOR CONSOLE • LIVE COMPLIANCE STATUS OVERVIEW
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Brand with Admin Badge */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-gold flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-serif font-extrabold text-brand-dark text-base sm:text-lg tracking-wide">
                  GREENLEAF
                </span>
                <span className="block text-[9px] text-brand-gold font-mono tracking-widest leading-none font-bold uppercase">
                  ADMIN CONTROL HUB
                </span>
              </div>
            </div>

            {/* Desktop Admin-Only Sub navigation options */}
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
              {[
                { id: 'overview', label: 'Dashboard', icon: Flame },
                { id: 'products', label: 'Inventory', icon: Sparkles },
                { id: 'orders', label: 'Orders Log', icon: BookOpen },
                { id: 'users', label: 'Accounts', icon: User },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = adminSubTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminSubTab && setAdminSubTab(item.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-green text-white shadow-xs'
                        : 'text-brand-dark opacity-75 hover:opacity-100 hover:bg-brand-tag'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

             {/* Back to Shop & Session Switcher */}
             <div className="flex items-center gap-2 sm:gap-3">
               <button
                 onClick={() => setActiveTab('shop')}
                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-white text-xs text-brand-dark hover:bg-brand-tag transition-all cursor-pointer font-sans font-semibold"
                 title="Exit to Customer Storefront"
               >
                 <ShoppingBag className="w-4 h-4 text-brand-green" />
                 <span className="hidden sm:inline">Storefront</span>
               </button>

               {/* Sandbox switcher dropdown for testing */}
               <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-white text-xs text-brand-dark hover:bg-brand-tag transition-all cursor-pointer focus:outline-none"
                >
                  <User className="w-4 h-4 text-brand-gold" />
                  <span className="hidden sm:inline font-mono">Admin</span>
                  <ChevronDown className="w-3.5 h-3.5 text-brand-muted-green" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-brand-border shadow-2xl p-2 space-y-1 font-sans text-brand-dark">
                    <div className="px-3 py-2 border-b border-brand-border">
                      <p className="text-xs text-brand-muted-green font-mono uppercase tracking-wider">Session Admin</p>
                      <p className="font-semibold text-brand-dark truncate text-sm">{currentUser.name}</p>
                      <p className="text-xs text-brand-gold font-mono truncate">{currentUser.email}</p>
                      <p className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-mono">
                        🛡️ Administrator
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      Log Out <LogOut className="w-3.5 h-3.5" />
                    </button>

                    <div className="pt-2 mt-2 border-t border-brand-border px-3">
                      <p className="text-[10px] text-brand-green uppercase font-mono tracking-widest font-bold mb-1.5">
                        SANDBOX SWITCHER
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => {
                            onSwitchUser('guest');
                            setDropdownOpen(false);
                          }}
                          className="text-[10px] py-1 rounded text-center transition-colors font-mono cursor-pointer bg-brand-tag text-brand-dark hover:bg-brand-border"
                        >
                          GUEST
                        </button>
                        <button
                          onClick={() => {
                            onSwitchUser('customer');
                            setDropdownOpen(false);
                          }}
                          className="text-[10px] py-1 rounded text-center transition-colors font-mono cursor-pointer bg-brand-tag text-brand-dark hover:bg-brand-border"
                        >
                          CUST
                        </button>
                        <button
                          onClick={() => {
                            onSwitchUser('admin');
                            setDropdownOpen(false);
                          }}
                          className="text-[10px] py-1 rounded text-center transition-colors font-mono cursor-pointer bg-brand-gold text-white font-bold"
                        >
                          ADMIN
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile secondary navigation for admin tabs */}
        <div className="lg:hidden flex items-center justify-around h-12 border-t border-brand-border glass-light px-2">
          {[
            { id: 'overview', label: 'Overview', icon: Flame },
            { id: 'products', label: 'Inventory', icon: Sparkles },
            { id: 'orders', label: 'Orders Log', icon: BookOpen },
            { id: 'users', label: 'Accounts', icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = adminSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminSubTab && setAdminSubTab(item.id as any)}
                className={`flex flex-col items-center justify-center w-full h-full text-[10px] transition-colors ${
                  isActive ? 'text-brand-green font-bold' : 'text-brand-muted-green hover:text-brand-dark'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-40 glass-light border-b border-brand-border/60 selection:bg-brand-green selection:text-white">
      {/* Sleek Premium Top Banner Notice */}
      <div className="bg-brand-dark text-brand-bg py-2 text-center text-[10px] md:text-[11px] font-mono tracking-widest px-4 flex items-center justify-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
        <span className="font-semibold uppercase tracking-widest">STATE-LICENSED DISPENSARY</span>
        <span className="opacity-40 hidden md:inline">|</span>
        <span className="hidden md:inline text-brand-gold uppercase tracking-widest font-semibold">DELIVERY & IN-STORE PICKUP AVAILABLE</span>
        <span className="opacity-40 hidden md:inline">|</span>
        <span className="hidden md:inline uppercase tracking-widest text-brand-bg/85">21+ VERIFICATION MANDATORY</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Elegant Logo Brand */}
          <button
            onClick={() => setActiveTab('shop')}
            className="flex items-center gap-2.5 cursor-pointer focus:outline-none group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-green/10 border border-brand-green/30 flex items-center justify-center transition-all group-hover:bg-brand-green group-hover:border-transparent">
              <Flame className="w-5 h-5 text-brand-green group-hover:text-white group-hover:scale-110 transition-all duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-black text-brand-dark text-base sm:text-lg tracking-wider leading-none group-hover:text-brand-green transition-colors">
                GREENLEAF
              </span>
              <span className="text-[9px] text-brand-muted-green font-mono tracking-[0.25em] leading-none font-bold uppercase mt-1">
                EST. 2026
              </span>
            </div>
          </button>

          {/* Modern Navigation Links with Bottom Border Effect */}
          <div className="hidden md:flex items-center space-x-0.5 lg:space-x-1 h-full">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 lg:px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all duration-300 relative ${
                    isActive
                      ? item.highlight
                        ? 'bg-brand-green text-white shadow-xs'
                        : 'bg-brand-tag text-brand-green border border-brand-border/60'
                      : item.highlight
                      ? 'text-brand-green hover:bg-brand-green/5 hover:text-brand-green-dark'
                      : 'text-brand-dark opacity-75 hover:opacity-100 hover:bg-brand-tag'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="ml-1 bg-brand-green/10 text-brand-green text-[9px] px-1.5 py-0.5 rounded-md uppercase font-mono font-bold animate-pulse">
                      AI
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Hub button (Visible only if user role is admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all duration-300 ${
                  activeTab === 'admin'
                    ? 'bg-brand-gold text-white shadow-xs'
                    : 'text-brand-gold hover:bg-brand-gold/5'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Hub</span>
              </button>
            )}
          </div>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Button */}
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`p-2 rounded-full hover:bg-brand-tag transition-all duration-300 relative group border ${
                activeTab === 'wishlist'
                  ? 'text-rose-600 bg-rose-50/80 border-rose-200'
                  : 'text-brand-dark opacity-75 hover:opacity-100 border-transparent'
              }`}
              title="My Wishlist"
            >
              <Heart className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white font-mono ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="p-2 rounded-full hover:bg-brand-tag transition-all duration-300 text-brand-dark opacity-75 hover:opacity-100 relative group border border-transparent"
              title="My Shopping Cart"
            >
              <ShoppingCart className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-green text-[8px] font-bold text-white font-mono ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Session Controls */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full border border-brand-border/80 bg-white hover:bg-brand-tag text-xs text-brand-dark transition-all cursor-pointer focus:outline-none"
              >
                <div className="w-5 h-5 rounded-full bg-brand-tag border border-brand-border flex items-center justify-center shrink-0">
                  <User className="w-3 h-3 text-brand-green" />
                </div>
                <span className="hidden sm:inline font-sans font-semibold max-w-[100px] truncate">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
                </span>
                <ChevronDown className="w-3 h-3 text-brand-muted-green" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-white border border-brand-border shadow-xl p-2.5 space-y-1 font-sans text-brand-dark">
                  {currentUser ? (
                    <>
                      <div className="px-3 py-2.5 border-b border-brand-border/60">
                        <p className="text-[9px] text-brand-muted-green font-mono uppercase tracking-wider mb-1">Signed In</p>
                        <p className="font-semibold text-brand-dark truncate text-sm leading-tight">{currentUser.name}</p>
                        <p className="text-[10px] text-brand-muted-green font-mono truncate">{currentUser.email}</p>
                        <div className="mt-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20 font-mono">
                            {currentUser.role === 'admin' ? '🛡️ Administrator' : '🍁 Verified Account'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-brand-dark opacity-80 hover:bg-brand-tag hover:opacity-100 transition-colors cursor-pointer"
                      >
                        Account Dashboard
                      </button>

                      <button
                        onClick={() => {
                          onLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        Log Out <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2.5 border-b border-brand-border/60">
                        <p className="text-[9px] text-brand-muted-green font-mono uppercase">Guest Session</p>
                        <p className="text-xs text-brand-dark opacity-75 font-sans mt-0.5 leading-relaxed">
                          Access restricted. Switch mock accounts to test permissions.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('login_screen');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-brand-green hover:bg-brand-tag transition-colors flex items-center justify-between cursor-pointer"
                      >
                        Log In / Register <LogIn className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Sandbox test switcher (styled beautifully) */}
                  <div className="pt-2.5 mt-2.5 border-t border-brand-border/60 px-2.5">
                    <p className="text-[9px] text-brand-muted-green uppercase font-mono tracking-widest font-bold mb-2">
                      SANDBOX USER SIMULATOR
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => {
                          onSwitchUser('guest');
                          setDropdownOpen(false);
                        }}
                        className={`text-[9px] py-1 rounded-md text-center transition-all font-mono font-bold cursor-pointer border ${
                          !currentUser
                            ? 'bg-brand-green text-white border-transparent'
                            : 'bg-brand-tag text-brand-dark border-brand-border/40 hover:bg-brand-border'
                        }`}
                      >
                        GUEST
                      </button>
                      <button
                        onClick={() => {
                          onSwitchUser('customer');
                          setDropdownOpen(false);
                        }}
                        className={`text-[9px] py-1 rounded-md text-center transition-all font-mono font-bold cursor-pointer border ${
                          currentUser?.role === 'customer'
                            ? 'bg-brand-green text-white border-transparent'
                            : 'bg-brand-tag text-brand-dark border-brand-border/40 hover:bg-brand-border'
                        }`}
                      >
                        CUSTOMER
                      </button>
                      <button
                        onClick={() => {
                          onSwitchUser('admin');
                          setDropdownOpen(false);
                        }}
                        className={`text-[9px] py-1 rounded-md text-center transition-all font-mono font-bold cursor-pointer border ${
                          currentUser?.role === 'admin'
                            ? 'bg-brand-gold text-white border-transparent'
                            : 'bg-brand-tag text-brand-dark border-brand-border/40 hover:bg-brand-border'
                        }`}
                      >
                        ADMIN
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Sticky Bottom Navigation for Mobile Device Sizes */}
      <div className="md:hidden flex items-center justify-around h-14 border-t border-brand-border bg-white px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full text-[10px] transition-colors ${
                isActive
                  ? 'text-brand-green font-bold'
                  : 'text-brand-muted-green hover:text-brand-dark'
              }`}
            >
              <Icon className="w-4.5 h-4.5 mb-1" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center w-full h-full text-[10px] transition-colors ${
              activeTab === 'admin' ? 'text-brand-gold font-bold' : 'text-brand-muted-green hover:text-brand-gold'
            }`}
          >
            <Shield className="w-4.5 h-4.5 mb-1" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </nav>
  );
}

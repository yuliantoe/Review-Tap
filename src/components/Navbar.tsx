import React from 'react';
import { useReviewTap, AdminTab } from '../context/ReviewTapContext';
import { RotateCcw, ShieldCheck, ArrowLeft, Radio, LogOut, KeyRound, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isAdminMode,
    setIsAdminMode,
    resetToDefaults,
    isAdminAuthenticated,
    adminUser,
    logoutAdmin,
    setIsChangePasswordModalOpen,
    navigateToAdmin,
  } = useReviewTap();

  type AppTab = 'dashboard' | 'activation' | 'cards' | 'businesses' | 'simulator' | 'guide';

  const allNavLinks: { id: AppTab; label: string }[] = [
    { id: 'activation', label: 'Aktivasi' },
    { id: 'dashboard', label: 'Ringkasan' },
    { id: 'cards', label: 'Daftar Kartu' },
    { id: 'businesses', label: 'Bisnis' },
    { id: 'simulator', label: 'Simulasi' },
    { id: 'guide', label: 'Panduan' },
  ];

  return (
    <header className="bg-white border-b border-stone-200/70 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-6 h-18">
          {/* Zone 1: Geometric Logo & Wordmark (Matching reference image) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (isAdminMode && isAdminAuthenticated) {
                  setActiveTab('dashboard');
                } else {
                  setActiveTab('activation');
                }
              }}
              className="text-left group flex items-center gap-2.5 focus:outline-hidden cursor-pointer"
            >
              {/* Geometric Rhomboid Mark matching the reference image */}
              <div className="w-8 h-8 flex items-center justify-center text-stone-900 group-hover:text-[#FF6B35] transition-colors">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform group-hover:scale-105"
                >
                  <path
                    d="M12 4L6 10L14 18L20 12L12 4Z"
                    fill="currentColor"
                  />
                  <path
                    d="M20 14L14 20L20 26L26 20L20 14Z"
                    fill="#FF6B35"
                  />
                  <circle cx="16" cy="16" r="2.5" fill="currentColor" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-stone-900 group-hover:text-[#FF6B35] transition-colors">
                    ReviewTap
                  </span>
                  {isAdminMode && isAdminAuthenticated && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links with delicate orange underline active indicator */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium">
            {allNavLinks.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'activation') {
                      setActiveTab('activation');
                    } else if (isAdminAuthenticated) {
                      setActiveTab(tab.id);
                    } else {
                      navigateToAdmin(tab.id as AdminTab);
                    }
                  }}
                  className={`relative py-2 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer ${
                    isActive ? 'text-stone-950 font-semibold' : ''
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Mode Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isAdminMode && isAdminAuthenticated ? (
              /* When in Admin Mode: Authenticated Admin Controls */
              <>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-700 rounded-full text-xs font-medium">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span className="font-semibold text-stone-900">{adminUser?.username || 'admin'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  title="Ganti Password Administrator"
                  className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                </button>

                <button
                  onClick={resetToDefaults}
                  title="Reset data contoh ke bawaan"
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setActiveTab('activation');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span className="hidden lg:inline">Aktivasi</span>
                </button>

                <button
                  onClick={logoutAdmin}
                  title="Keluar dari sesi Administrator"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              /* When in Public / Activation Mode: Pill Orange Button matching reference */
              <button
                onClick={() => navigateToAdmin('dashboard')}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#FF6B35] hover:bg-[#F25A24] rounded-full shadow-sm shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bar for mobile viewports */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-stone-100 gap-2 bg-stone-50/90 scrollbar-none">
        {allNavLinks.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'activation') {
                  setActiveTab('activation');
                } else if (isAdminAuthenticated) {
                  setActiveTab(tab.id);
                } else {
                  navigateToAdmin(tab.id as AdminTab);
                }
              }}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-[#FF6B35] text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};


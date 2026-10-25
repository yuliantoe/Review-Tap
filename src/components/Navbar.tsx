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

  const adminNavLinks: { id: AdminTab; label: string }[] = [
    { id: 'dashboard', label: 'Ringkasan' },
    { id: 'cards', label: 'Daftar Kartu' },
    { id: 'businesses', label: 'Bisnis & Place ID' },
    { id: 'simulator', label: 'Simulasi Scan' },
    { id: 'guide', label: 'Panduan Penggunaan' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (isAdminMode && isAdminAuthenticated) {
                  setActiveTab('dashboard');
                } else {
                  setActiveTab('activation');
                }
              }}
              className="text-left group flex items-center gap-2.5 focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:bg-blue-700 transition-colors">
                <span>R</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                    ReviewTap
                  </span>
                  {isAdminMode && isAdminAuthenticated && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap leading-none hidden sm:inline">
                  {isAdminMode && isAdminAuthenticated
                    ? 'Dashboard Manajemen & Analitik'
                    : 'Link Utama Aktivasi Kartu NFC & QR'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          {isAdminMode && isAdminAuthenticated ? (
            /* Admin Mode Navigation */
            <nav className="hidden lg:flex items-center gap-1">
              {adminNavLinks.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          ) : (
            /* Public / Default Mode: Link Utama Aktivasi Kartu */
            <nav className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60">
                <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>Link Utama Aktivasi Kartu NFC</span>
              </span>
            </nav>
          )}

          {/* Zone 3: Primary Action & Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdminMode && isAdminAuthenticated ? (
              /* When in Admin Mode: Authenticated Admin Controls */
              <>
                {/* Admin user info chip */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-900">{adminUser?.username || 'admin'}</span>
                </div>

                {/* Change password button */}
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  title="Ganti Password Administrator"
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                </button>

                {/* Reset sample data */}
                <button
                  onClick={resetToDefaults}
                  title="Reset data contoh ke bawaan"
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Return to Public activation link */}
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setActiveTab('activation');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Ke Link Aktivasi</span>
                </button>

                {/* Logout button */}
                <button
                  onClick={logoutAdmin}
                  title="Keluar dari sesi Administrator"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              /* When in Public / Default Activation Mode: Only Administrator Dashboard button */
              <button
                onClick={() => navigateToAdmin('dashboard')}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Administrator Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bar for mobile viewports */}
      {isAdminMode && isAdminAuthenticated && (
        <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1 bg-slate-50/80 scrollbar-none">
          {adminNavLinks.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

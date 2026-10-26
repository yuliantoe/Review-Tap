import React from 'react';
import { ReviewTapProvider, useReviewTap } from './context/ReviewTapContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CardActivationView } from './components/CardActivationView';
import { CardManagementView } from './components/CardManagementView';
import { BusinessView } from './components/BusinessView';
import { CustomerSimulatorView } from './components/CustomerSimulatorView';
import { WorkflowGuideView } from './components/WorkflowGuideView';
import { CardQrModal } from './components/CardQrModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPasswordChangeModal } from './components/AdminPasswordChangeModal';
import { ShieldCheck, Lock, ArrowRight, User, LogOut } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    inspectCardCode,
    setInspectCardCode,
    cards,
    businesses,
    simulateScan,
    setActiveTab,
    isAdminMode,
    setIsAdminMode,
    isAdminAuthenticated,
    adminUser,
    logoutAdmin,
    navigateToAdmin,
    setScannedNfcCode,
  } = useReviewTap();

  // Check if incoming URL has a card code parameter (?code=... or /r/...)
  // Sebelum diaktivasi: link langsung ke web aktivasi!
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    let code = params.get('code') || params.get('c') || params.get('card');
    if (!code) {
      const match = window.location.pathname.match(/\/r\/([a-zA-Z0-9]{6})/i);
      if (match) code = match[1];
    }

    if (code) {
      const clean = code.trim().toUpperCase();
      const card = cards.find((c) => c.code.toUpperCase() === clean);

      // Sebelum diaktivasi: Buka langsung formulir web aktivasi
      if (!card || card.status !== 'aktif') {
        setScannedNfcCode(clean);
        setIsAdminMode(false);
        setActiveTab('activation');
      }
    }
  }, [cards]);

  const inspectedCard = inspectCardCode ? cards.find((c) => c.code === inspectCardCode) : null;
  const inspectedBiz = inspectedCard ? businesses.find((b) => b.id === inspectedCard.business_id) : undefined;

  const isProtectedTab = activeTab !== 'activation';
  const shouldShowProtectedContent = !isProtectedTab || isAdminAuthenticated;

  return (
    <div className="min-h-screen bg-[#FBF8F5] text-stone-900 py-3 sm:py-6 px-2 sm:px-4 lg:px-8">
      {/* Framed Canvas Container matching the reference image window layout */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl sm:rounded-[36px] shadow-sm border border-stone-200/80 overflow-hidden flex flex-col min-h-[92vh]">
        {/* Admin Mode Status Banner */}
        {isAdminMode && isAdminAuthenticated && (
          <div className="bg-[#1C1917] text-stone-300 text-xs px-4 sm:px-8 py-2.5 border-b border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
                <span className="font-semibold text-white">Konsol Administrator ReviewTap</span>
                <span className="text-stone-600 hidden sm:inline">·</span>
                <span className="text-stone-400 hidden sm:inline">
                  Login sebagai: <strong className="text-white font-medium">{adminUser?.username || 'admin'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setActiveTab('activation');
                  }}
                  className="text-[#FF7A45] hover:text-white transition-colors underline text-[11px] cursor-pointer"
                >
                  ← Kembali ke Link Aktivasi
                </button>
                <span className="text-stone-700 hidden sm:inline">|</span>
                <button
                  onClick={logoutAdmin}
                  className="text-rose-400 hover:text-rose-200 transition-colors text-[11px] font-medium hidden sm:inline-flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Navigation */}
        <Navbar />

        {/* Main Container */}
        <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
          {/* Guard for protected tabs: If not authenticated, prompt login view */}
          {!shouldShowProtectedContent ? (
            <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-stone-200/80 shadow-md text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF0EB] text-[#FF6B35] flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Akses Terproteksi Administrator
                </h2>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Anda perlu login untuk membuka menu <strong>{activeTab}</strong> dan mengelola konfigurasi kartu ulasan Google.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={() => setActiveTab('activation')}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
                >
                  Ke Halaman Aktivasi
                </button>
                <button
                  onClick={() => navigateToAdmin(activeTab)}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-[#FF6B35] hover:bg-[#F25A24] rounded-full transition-all shadow-sm shadow-orange-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Form Login</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'activation' && <CardActivationView />}
              {activeTab === 'cards' && <CardManagementView />}
              {activeTab === 'businesses' && <BusinessView />}
              {activeTab === 'simulator' && <CustomerSimulatorView />}
              {activeTab === 'guide' && <WorkflowGuideView />}
            </>
          )}
        </main>

        {/* Quiet, Compliant Warm Footer */}
        <footer className="border-t border-stone-200/70 bg-stone-50/60 py-6 px-4 sm:px-8 lg:px-12 text-xs text-stone-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 tracking-tight">ReviewTap</span>
              <span aria-hidden="true">·</span>
              <span>Aktivasi Kartu NFC & QR untuk Ulasan Google</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-stone-500">
              {(!isAdminMode || !isAdminAuthenticated) ? (
                <button
                  onClick={() => navigateToAdmin('dashboard')}
                  className="text-[#FF6B35] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>Masuk Dashboard Admin</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsAdminMode(false);
                      setActiveTab('activation');
                    }}
                    className="text-[#FF6B35] hover:underline font-semibold cursor-pointer"
                  >
                    Halaman Aktivasi
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={logoutAdmin}
                    className="text-rose-600 hover:underline font-medium cursor-pointer"
                  >
                    Keluar Admin
                  </button>
                </div>
              )}
              <span aria-hidden="true">·</span>
              <span>Standar NDEF URL</span>
              <span aria-hidden="true">·</span>
              <span>Fast 302 Redirect</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Quick QR & NDEF Modal if opened via inspection */}
      {inspectedCard && (
        <CardQrModal
          card={inspectedCard}
          business={inspectedBiz}
          onClose={() => setInspectCardCode(null)}
          onSimulate={(code, src) => {
            simulateScan(code, src);
            navigateToAdmin('simulator');
          }}
          onOpenActivation={(code) => {
            setInspectCardCode(null);
            setScannedNfcCode(code);
            setIsAdminMode(false);
            setActiveTab('activation');
          }}
        />
      )}

      {/* Admin Authentication Modals */}
      <AdminLoginModal />
      <AdminPasswordChangeModal />
    </div>
  );
};

export default function App() {
  return (
    <ReviewTapProvider>
      <MainContent />
    </ReviewTapProvider>
  );
}

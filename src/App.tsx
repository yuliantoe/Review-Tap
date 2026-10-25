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
  } = useReviewTap();

  const inspectedCard = inspectCardCode ? cards.find((c) => c.code === inspectCardCode) : null;
  const inspectedBiz = inspectedCard ? businesses.find((b) => b.id === inspectedCard.business_id) : undefined;

  const isProtectedTab = activeTab !== 'activation';
  const shouldShowProtectedContent = !isProtectedTab || isAdminAuthenticated;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Admin Mode Status Banner */}
      {isAdminMode && isAdminAuthenticated && (
        <div className="bg-slate-900 text-slate-300 text-xs px-4 py-2 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Konsol Administrator ReviewTap</span>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-slate-400 hidden sm:inline">
                Login sebagai: <strong className="text-slate-200">{adminUser?.username || 'admin'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  setActiveTab('activation');
                }}
                className="text-blue-400 hover:text-white transition-colors underline text-[11px]"
              >
                ← Kembali ke Link Aktivasi Utama
              </button>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <button
                onClick={logoutAdmin}
                className="text-rose-400 hover:text-rose-200 transition-colors text-[11px] font-medium hidden sm:inline-flex items-center gap-1"
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Guard for protected tabs: If not authenticated, prompt login view */}
        {!shouldShowProtectedContent ? (
          <div className="max-w-lg mx-auto my-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Akses Terproteksi Administrator
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Anda perlu memasukkan username dan password untuk membuka menu <strong>{activeTab}</strong> dan mengelola kartu ulasan Google.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setActiveTab('activation')}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Ke Halaman Aktivasi
              </button>
              <button
                onClick={() => navigateToAdmin(activeTab)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-blue-400" />
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
        />
      )}

      {/* Admin Authentication Modals */}
      <AdminLoginModal />
      <AdminPasswordChangeModal />

      {/* Quiet, Compliant Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 tracking-tight">ReviewTap</span>
            <span aria-hidden="true">·</span>
            <span>Aktivasi Kartu NFC & QR untuk Ulasan Google</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            {(!isAdminMode || !isAdminAuthenticated) ? (
              <button
                onClick={() => navigateToAdmin('dashboard')}
                className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3 text-blue-500" />
                <span>Masuk Dashboard Admin</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setActiveTab('activation');
                  }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Halaman Aktivasi Utama
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={logoutAdmin}
                  className="text-rose-600 hover:underline font-medium"
                >
                  Keluar Admin
                </button>
              </div>
            )}
            <span aria-hidden="true">·</span>
            <span>Standar NDEF URL</span>
            <span aria-hidden="true">·</span>
            <span>HTTP 302 Fast Redirect</span>
          </div>
        </div>
      </footer>
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

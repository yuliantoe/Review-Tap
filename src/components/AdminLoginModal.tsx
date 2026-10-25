import React, { useState, useEffect } from 'react';
import { useReviewTap } from '../context/ReviewTapContext';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, X, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, loginAdmin } = useReviewTap();

  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (isLoginModalOpen) {
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    // Minor debounce for realistic tactile feedback
    setTimeout(() => {
      const res = loginAdmin(username, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    }, 200);
  };

  const handleFillDemoCreds = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={closeLoginModal} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6 relative">
          <button
            onClick={closeLoginModal}
            aria-label="Tutup modal"
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Area Terproteksi
              </span>
              <h2 id="admin-login-title" className="text-lg font-bold text-white leading-snug">
                Login Administrator
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
            Halaman ini khusus untuk manajemen batch kartu NFC, pendaftaran Google Place ID, dan analisis performa ulasan.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Gagal Masuk</span>
                <p className="text-[11px] leading-relaxed text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Quick Preset Credentials Chip */}
          <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Kredensial Akses Administrator:</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleFillDemoCreds}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                <KeyRound className="w-3 h-3" />
                <span>Klik untuk Isi: admin / admin123</span>
              </button>
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Username Administrator</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: admin"
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Password</span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                className="w-full text-sm pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={closeLoginModal}
              className="w-full sm:w-1/2 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center order-2 sm:order-1"
            >
              Kembali ke Aktivasi
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-1/2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 order-1 sm:order-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Memeriksa...' : 'Masuk Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Link Publik: Anda tetap dapat melakukan <span className="font-semibold text-slate-700">Aktivasi Kartu</span> tanpa perlu login.
          </p>
        </div>
      </div>
    </div>
  );
};

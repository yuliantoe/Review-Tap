import React, { useState } from 'react';
import { useReviewTap } from '../context/ReviewTapContext';
import { Card } from '../types';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';

interface ActivateCardModalProps {
  card: Card;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ActivateCardModal: React.FC<ActivateCardModalProps> = ({ card, onClose, onSuccess }) => {
  const { businesses, activateCard } = useReviewTap();
  const [selectedBizId, setSelectedBizId] = useState<string>(businesses[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedBiz = businesses.find((b) => b.id === selectedBizId);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const ok = activateCard(card.code, selectedBizId);
      setIsSubmitting(false);
      if (ok) {
        setSuccess(true);
        if (onSuccess) onSuccess();
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Aktivasi Kartu #{card.code}</h3>
              <p className="text-xs text-slate-500">Hubungkan kartu ke Google Place ID bisnis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!success ? (
          <form onSubmit={handleActivate} className="p-6 space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900">
              <p className="font-semibold">Aktivasi Pertama Pemilik Bisnis</p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Pilih profil bisnis untuk menghubungkan kode kartu ini. Pelanggan yang menempelkan kartu akan langsung diarahkan ke form ulasan Google bisnis terpilih.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Profil Bisnis & Google Place ID
              </label>
              <select
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
              >
                {businesses.map((biz) => (
                  <option key={biz.id} value={biz.id}>
                    {biz.nama} ({biz.kota})
                  </option>
                ))}
              </select>
            </div>

            {selectedBiz && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Google Place ID:</span>
                  <span className="font-mono text-[11px] text-slate-800 font-semibold">{selectedBiz.place_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kategori:</span>
                  <span>{selectedBiz.kategori}</span>
                </div>
              </div>
            )}

            {/* Submit Action */}

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedBizId}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Mengaktifkan...' : 'Aktifkan Kartu Sekarang'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Kartu Berhasil Diaktifkan!</h4>
              <p className="text-xs text-slate-600 mt-1">
                Kode <strong>{card.code}</strong> kini aktif terhubung ke{' '}
                <strong className="text-slate-900">{selectedBiz?.nama}</strong>. Setiap scan sekarang akan otomatis dialihkan ke formulir ulasan Google.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

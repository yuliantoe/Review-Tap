import React, { useState } from 'react';
import { useReviewTap } from '../context/ReviewTapContext';
import { CardType } from '../types';
import { X, Layers, CheckCircle2, QrCode as QrIcon } from 'lucide-react';

interface BatchGeneratorModalProps {
  onClose: () => void;
  onSuccess: (count: number) => void;
  onDownloadBatch?: (batchCodes: string[]) => void;
}

export const BatchGeneratorModal: React.FC<BatchGeneratorModalProps> = ({ onClose, onSuccess, onDownloadBatch }) => {
  const { batchCreateCards } = useReviewTap();
  const [count, setCount] = useState<number>(10);
  const [tipe, setTipe] = useState<CardType>('nfc_qr');
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedBatch, setCompletedBatch] = useState<string[] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const generated = batchCreateCards(count, tipe);
      setCompletedBatch(generated.map((c) => c.code));
      setIsGenerating(false);
      onSuccess(count);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Buat Batch Kartu Baru</h3>
              <p className="text-xs text-slate-500">Buat kode unik 6-karakter untuk tag NFC & QR fisik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form or Result */}
        {!completedBatch ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jumlah Kartu yang Dicetak
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                      count === num
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {num} Kartu
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tipe Hardware Kartu
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTipe('nfc_qr')}
                  className={`p-2.5 text-left border rounded-lg transition-all ${
                    tipe === 'nfc_qr'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold">NFC + QR</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Disarankan (Kompatibel luas)</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTipe('nfc')}
                  className={`p-2.5 text-left border rounded-lg transition-all ${
                    tipe === 'nfc'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold">Hanya NFC</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tanpa cetakan kode QR</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTipe('qr')}
                  className={`p-2.5 text-left border rounded-lg transition-all ${
                    tipe === 'qr'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold">Hanya QR</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Stiker / Akrilik Meja</p>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Status awal kartu adalah <span className="font-medium text-slate-700">Belum aktif</span>. Pemilik bisnis akan mengaktifkannya saat kartu pertama kali ditempel atau lewat menu Aktivasi Kartu.
            </p>

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
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Membuat Kode...' : `Generate ${count} Kartu Sekarang`}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-xs font-medium">
                Berhasil membuat <strong>{completedBatch.length} kartu baru</strong>! Kode siap ditulis ke tag NFC (aplikasi NFC Tools) atau dicetak sebagai QR code.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Daftar Kode yang Dibuat:
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                {completedBatch.map((code) => (
                  <span
                    key={code}
                    className="font-mono text-center text-xs font-semibold text-slate-800 bg-white border border-slate-200/80 rounded py-1"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Tulis rekaman NDEF tipe URL: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">https://reviewtap.id/r/[KODE]?s=n</code> ke tag NTAG213/215.
            </p>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Tutup & Lihat di Daftar
              </button>
              {onDownloadBatch && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDownloadBatch(completedBatch);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <QrIcon className="w-3.5 h-3.5" />
                  <span>Cetak / Unduh QR Batch Ini ({completedBatch.length})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

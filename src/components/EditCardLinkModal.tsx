import React, { useState } from 'react';
import { useReviewTap } from '../context/ReviewTapContext';
import { Card, Business } from '../types';
import { parseGoogleReviewInput } from '../utils/googleReviewHelper';
import {
  X,
  Link2,
  CheckCircle2,
  ExternalLink,
  ClipboardPaste,
  AlertCircle,
  Building2,
  Sparkles,
  QrCode,
  Smartphone,
} from 'lucide-react';

interface EditCardLinkModalProps {
  card: Card;
  onClose: () => void;
  onSuccess?: (cardCode: string, bizName: string) => void;
  onSimulate?: (code: string) => void;
}

export const EditCardLinkModal: React.FC<EditCardLinkModalProps> = ({
  card,
  onClose,
  onSuccess,
  onSimulate,
}) => {
  const { businesses, updateCardBusiness, updateCardStatus, addBusiness } = useReviewTap();

  // Find current connected business
  const currentBusiness = businesses.find((b) => b.id === card.business_id);

  // Tab mode: 'new_link' | 'existing_biz'
  const [mode, setMode] = useState<'new_link' | 'existing_biz'>('new_link');

  // Mode 1: New Review Link / Custom Input
  const [manualBizName, setManualBizName] = useState<string>(currentBusiness?.nama || '');
  const [manualReviewLink, setManualReviewLink] = useState<string>(
    currentBusiness?.place_id ? `https://search.google.com/local/writereview?placeid=${currentBusiness.place_id}` : ''
  );
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);

  // Mode 2: Existing Business selection
  const [selectedBizId, setSelectedBizId] = useState<string>(
    card.business_id || businesses[0]?.id || ''
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    bizName: string;
    placeId: string;
  } | null>(null);

  const parsedManualReview = parseGoogleReviewInput(manualReviewLink);
  const selectedExistingBiz = businesses.find((b) => b.id === selectedBizId);

  // Paste handler
  const handlePasteReviewLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const trimmed = text.trim();
          const parsed = parseGoogleReviewInput(trimmed);
          setManualReviewLink(trimmed);
          if (!manualBizName.trim() && parsed.extractedBizName) {
            setManualBizName(parsed.extractedBizName);
          }
          setPasteFeedback('Link berhasil ditempel! Tautan langsung ulasan otomatis digenerate.');
          setTimeout(() => setPasteFeedback(null), 3000);
          return;
        }
      }
    } catch {
      // ignore
    }
    setPasteFeedback('Silakan gunakan Ctrl+V pada kolom input.');
    setTimeout(() => setPasteFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let targetBizId: string;
    let finalBizName: string;
    let finalPlaceId: string;

    if (mode === 'existing_biz') {
      if (!selectedBizId) {
        setFormError('Harap pilih salah satu profil bisnis.');
        return;
      }
      const biz = businesses.find((b) => b.id === selectedBizId);
      if (!biz) {
        setFormError('Profil bisnis tidak valid.');
        return;
      }
      targetBizId = biz.id;
      finalBizName = biz.nama;
      finalPlaceId = biz.place_id;
    } else {
      // Manual input mode
      if (!manualBizName.trim()) {
        setFormError('Harap masukkan nama bisnis.');
        return;
      }
      if (!parsedManualReview.placeId) {
        setFormError('Harap masukkan tautan Google Review atau Place ID yang valid.');
        return;
      }

      // Check if place_id already exists in businesses
      const existing = businesses.find(
        (b) => b.place_id.toLowerCase() === parsedManualReview.placeId.toLowerCase()
      );

      if (existing) {
        targetBizId = existing.id;
        finalBizName = existing.nama;
        finalPlaceId = existing.place_id;
      } else {
        const newBiz = addBusiness({
          nama: manualBizName.trim(),
          place_id: parsedManualReview.placeId,
          alamat: `${manualBizName.trim()}, Indonesia`,
          kota: 'Indonesia',
          kategori: 'Gerai Bisnis',
          pemilik_email: `owner@${manualBizName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bisnis'}.id`,
          rating: 5.0,
          total_ulasan_google: 1,
        });
        targetBizId = newBiz.id;
        finalBizName = newBiz.nama;
        finalPlaceId = newBiz.place_id;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      updateCardBusiness(card.code, targetBizId);
      if (card.status !== 'aktif') {
        updateCardStatus(card.code, 'aktif');
      }
      setIsSubmitting(false);
      setSuccessData({
        bizName: finalBizName,
        placeId: finalPlaceId,
      });
      if (onSuccess) {
        onSuccess(card.code, finalBizName);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Ganti Link Google Review</span>
                <span className="font-mono text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  #{card.code}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Ubah tautan tujuan ulasan tanpa perlu mencetak ulang fisik kartu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic QR Info Callout */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/60 px-6 py-3 flex items-start gap-2.5 text-xs text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px] text-blue-950">
            <strong>QR Code & NFC Bersifat Dinamis:</strong> Kartu fisik yang sudah dicetak (akrilik, stiker meja, atau kartu PVC) akan <strong>langsung mengalihkan pengunjung ke link Google Review baru</strong> secara real-time. Anda tidak perlu mencetak ulang QR code.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {!successData ? (
            <form id="edit-link-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Current status banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                  Tujuan Saat Ini
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    {currentBusiness ? currentBusiness.nama : 'Belum Ada Bisnis Terhubung'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {currentBusiness?.place_id || 'Tanpa Place ID'}
                  </span>
                </div>
              </div>

              {/* Mode Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Metode Penggantian Tautan:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMode('new_link')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md transition-all text-center ${
                      mode === 'new_link'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Salin Link Google Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('existing_biz')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md transition-all text-center ${
                      mode === 'existing_biz'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pilih Profil Tersimpan
                  </button>
                </div>
              </div>

              {mode === 'new_link' ? (
                /* Mode 1: Salin Link Google Review Baru */
                <div className="space-y-4 pt-1">
                  {/* Nama Bisnis */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Nama Bisnis / Gerai *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={manualBizName}
                      onChange={(e) => {
                        setManualBizName(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="misal: Kopi Kenangan Mall Kelapa Gading"
                      className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Tautan Google Review */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Tautan Google Review Baru *</span>
                      </label>
                      <button
                        type="button"
                        onClick={handlePasteReviewLink}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                      >
                        <ClipboardPaste className="w-3 h-3" />
                        <span>Tempel Clipboard</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      value={manualReviewLink}
                      onChange={(e) => {
                        const val = e.target.value;
                        setManualReviewLink(val);
                        setFormError(null);
                        if (val.trim()) {
                          const p = parseGoogleReviewInput(val.trim());
                          if (!manualBizName.trim() && p.extractedBizName) {
                            setManualBizName(p.extractedBizName);
                          }
                        }
                      }}
                      onPaste={(e) => {
                        const text = e.clipboardData.getData('text');
                        if (text && text.trim()) {
                          const parsed = parseGoogleReviewInput(text.trim());
                          if (!manualBizName.trim() && parsed.extractedBizName) {
                            setManualBizName(parsed.extractedBizName);
                          }
                          setPasteFeedback('Link ditempel! Tautan ulasan langsung otomatis digenerate.');
                          setTimeout(() => setPasteFeedback(null), 3000);
                        }
                      }}
                      placeholder="Salin URL Google Review (https://search.google.com/local/writereview?placeid=...)"
                      className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    />

                    {pasteFeedback && (
                      <p className="text-[11px] text-blue-700 animate-in fade-in">
                        {pasteFeedback}
                      </p>
                    )}

                    {/* Automatic Direct Google Review Link Generation Indicator */}
                    {manualReviewLink.trim() && (
                      <div className="p-3 bg-gradient-to-r from-emerald-50/90 to-blue-50/90 border border-emerald-200/90 rounded-xl space-y-2.5 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tautan Langsung Google Review Otomatis Digenerate:</span>
                          </span>
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                            Form Ulasan Langsung (5-Bintang)
                          </span>
                        </div>

                        {/* Direct link display with copy button */}
                        <div className="bg-white p-2 rounded-lg border border-emerald-200 text-xs flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-blue-700 font-medium truncate max-w-[320px]">
                            {parsedManualReview.directReviewUrl}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(parsedManualReview.directReviewUrl);
                              setPasteFeedback('Tautan ulasan langsung berhasil disalin!');
                              setTimeout(() => setPasteFeedback(null), 2500);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold shrink-0 cursor-pointer"
                          >
                            Salin Link
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-emerald-100/80">
                          <p className="text-[11px] text-slate-600 leading-tight">
                            {parsedManualReview.label}
                          </p>
                          <a
                            href={parsedManualReview.directReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors shrink-0"
                          >
                            <span>Uji Buka Form Review Google</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Mode 2: Pilih Profil Bisnis Tersimpan */
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Pilih Bisnis Tujuan *
                    </label>
                    <select
                      value={selectedBizId}
                      onChange={(e) => setSelectedBizId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white cursor-pointer"
                    >
                      {businesses.map((biz) => (
                        <option key={biz.id} value={biz.id}>
                          {biz.nama} ({biz.kota}) - {biz.place_id}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedExistingBiz && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Nama Bisnis:</span>
                        <span className="font-semibold text-slate-900">{selectedExistingBiz.nama}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Google Place ID:</span>
                        <span className="font-mono text-[11px] text-slate-700 font-semibold">{selectedExistingBiz.place_id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Alamat / Kota:</span>
                        <span>{selectedExistingBiz.alamat}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error message */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
            </form>
          ) : (
            /* Success confirmation */
            <div className="py-6 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Link Google Review Berhasil Diganti!
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
                  Kartu <strong>#{card.code}</strong> kini otomatis mengarahkan pengunjung ke ulasan Google <strong>{successData.bizName}</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-w-sm mx-auto text-left text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Kode Kartu / QR:</span>
                  <span className="font-bold text-slate-900">#{card.code}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Place ID Baru:</span>
                  <span className="text-slate-800 font-semibold truncate max-w-[180px]">{successData.placeId}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg max-w-md mx-auto text-xs text-emerald-800">
                <p>
                  ✓ Cetakan QR fisik atau tap NFC yang sudah ditempatkan di meja pelanggan <strong>langsung aktif mengarah ke bisnis baru ini</strong> tanpa perlu dicetak ulang.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {!successData ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="edit-link-form"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Link Review'}
              </button>
            </>
          ) : (
            <div className="flex items-center justify-end w-full gap-2">
              {onSimulate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSimulate(card.code);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Uji Scan Sekarang</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

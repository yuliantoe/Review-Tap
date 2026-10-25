import React, { useState, useEffect } from 'react';
import { useReviewTap } from '../context/ReviewTapContext';
import { parseGoogleReviewInput } from '../utils/googleReviewHelper';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ExternalLink,
  Link2,
  ClipboardPaste,
  AlertCircle,
  Radio,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export const CardActivationView: React.FC = () => {
  const { cards, businesses, activateCard, addBusiness, scannedNfcCode, setScannedNfcCode } = useReviewTap();

  // Form states: 3 primary fields
  // 1. Kode Kartu
  // 2. Nama Bisnis
  // 3. Tautan Google Review
  const [cardCode, setCardCode] = useState<string>('');
  const [manualBizName, setManualBizName] = useState<string>('');
  const [manualReviewLink, setManualReviewLink] = useState<string>('');
  
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [nfcSuccessFeedback, setNfcSuccessFeedback] = useState<string | null>(null);
  const [isNfcScanning, setIsNfcScanning] = useState<boolean>(false);
  const [nfcStatusNote, setNfcStatusNote] = useState<string | null>(null);
  
  // Status states
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);
  const [activatedCardData, setActivatedCardData] = useState<{
    code: string;
    bizName: string;
    placeId: string;
  } | null>(null);

  const hasWebNfc = typeof window !== 'undefined' && 'NDEFReader' in window;

  // 1. Auto-read code from URL query parameters (when NFC tag or QR redirects to activation page)
  // or from Context scannedNfcCode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code') || params.get('c') || params.get('card');
      if (urlCode && urlCode.trim()) {
        const clean = urlCode.trim().toUpperCase();
        setCardCode(clean);
        setNfcSuccessFeedback(`Kode kartu #${clean} terbaca otomatis dari pemindaian NFC!`);
        return;
      }
    }

    if (scannedNfcCode) {
      setCardCode(scannedNfcCode.toUpperCase());
      setNfcSuccessFeedback(`Kode kartu #${scannedNfcCode} terbaca otomatis dari pemindaian NFC!`);
    }
  }, [scannedNfcCode]);

  // Selected card
  const currentCard = cards.find((c) => c.code.toUpperCase() === cardCode.trim().toUpperCase());

  // Handle Web NFC API scan
  const handleStartWebNfc = async () => {
    if (!hasWebNfc) {
      handleSimulateNfcTap();
      return;
    }

    try {
      setIsNfcScanning(true);
      setNfcStatusNote('Sensor NFC Aktif: Dekatkan kartu NFC ke bagian belakang ponsel Anda...');
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.onreading = (event: any) => {
        try {
          let detected = '';
          for (const record of event.message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              const txt = textDecoder.decode(record.data);
              const m = txt.match(/([A-Za-z0-9]{6})/);
              if (m) detected = m[1].toUpperCase();
            } else if (record.recordType === 'url') {
              const textDecoder = new TextDecoder();
              const url = textDecoder.decode(record.data);
              const m = url.match(/\/r\/([A-Za-z0-9]{6})/i) || url.match(/[?&]code=([A-Za-z0-9]{6})/i) || url.match(/([A-Za-z0-9]{6})/);
              if (m) detected = m[1].toUpperCase();
            }
          }

          if (detected) {
            setCardCode(detected);
            setScannedNfcCode(detected);
            setNfcSuccessFeedback(`Kartu NFC #${detected} terdeteksi dan kode terisi otomatis!`);
            setNfcStatusNote(null);
            setIsNfcScanning(false);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
          }
        } catch (err) {
          console.error('Error reading NFC record', err);
        }
      };

      ndef.onreadingerror = () => {
        setNfcStatusNote('Kartu tidak terbaca. Harap tempelkan kembali kartu ke sensor ponsel.');
      };
    } catch {
      setIsNfcScanning(false);
      setNfcStatusNote('Sensor NFC tidak aktif atau izin ditolak. Menggunakan simulasi baca otomatis.');
      handleSimulateNfcTap();
    }
  };

  // Simulated NFC Tap for quick demonstration & non-WebNFC devices
  const handleSimulateNfcTap = () => {
    setIsNfcScanning(true);
    setNfcStatusNote('Membaca chip NFC kartu fisik...');

    setTimeout(() => {
      const unactivatedCards = cards.filter((c) => c.status === 'baru');
      const targetCode = unactivatedCards[0]?.code || 'N3W001';

      setCardCode(targetCode);
      setScannedNfcCode(targetCode);
      setIsNfcScanning(false);
      setNfcStatusNote(null);
      setNfcSuccessFeedback(`Kartu NFC #${targetCode} berhasil dibaca otomatis melalui sensor!`);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 450);
  };

  // Parse manual review input in real-time
  const parsedManualReview = parseGoogleReviewInput(manualReviewLink);

  // Handle paste from clipboard with automatic generation of direct review link
  const handlePasteReviewLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const trimmedText = text.trim();
          const parsed = parseGoogleReviewInput(trimmedText);
          setManualReviewLink(trimmedText);
          if (!manualBizName.trim() && parsed.extractedBizName) {
            setManualBizName(parsed.extractedBizName);
          }
          setPasteFeedback('Link berhasil ditempel! Tautan ulasan langsung otomatis digenerate.');
          setTimeout(() => setPasteFeedback(null), 3000);
          return;
        }
      }
    } catch {
      // clipboard read denied or unsupported
    }
    setPasteFeedback('Silakan gunakan Ctrl+V / Tempel pada kolom input.');
    setTimeout(() => setPasteFeedback(null), 3000);
  };

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!cardCode.trim()) {
      setFormError('Harap scan kartu NFC atau masukkan kode kartu yang akan diaktifkan.');
      return;
    }
    if (!manualBizName.trim()) {
      setFormError('Harap masukkan nama bisnis.');
      return;
    }
    if (!parsedManualReview.placeId) {
      setFormError('Harap masukkan tautan Google Review atau Place ID yang valid.');
      return;
    }

    // Check if place_id already exists in businesses
    const existingBiz = businesses.find(
      (b) => b.place_id.toLowerCase() === parsedManualReview.placeId.toLowerCase()
    );

    let targetBizId: string;
    let finalBizName = manualBizName.trim();
    let finalPlaceId = parsedManualReview.placeId;

    if (existingBiz) {
      targetBizId = existingBiz.id;
      finalBizName = existingBiz.nama;
      finalPlaceId = existingBiz.place_id;
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

    setIsActivating(true);

    setTimeout(() => {
      const ok = activateCard(cardCode.trim().toUpperCase(), targetBizId);
      setIsActivating(false);

      if (ok) {
        setActivationSuccess(true);
        setActivatedCardData({
          code: cardCode.trim().toUpperCase(),
          bizName: finalBizName,
          placeId: finalPlaceId,
        });
        setScannedNfcCode(null);
      }
    }, 350);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>Aktivasi Kartu NFC & QR</span>
          <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
            Menu Utama
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Hubungkan kartu fisik NFC tag baru ke profil ulasan Google Bisnis.
        </p>
      </div>

      {/* Main Activation Form */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        {!activationSuccess ? (
          <form onSubmit={handleActivateSubmit} className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Formulir Aktivasi Kartu
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lengkapi 3 data di bawah ini untuk mengaktifkan kartu.
              </p>
            </div>

            {/* FIELD 1: KODE KARTU (AUTO READ VIA NFC) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kode Kartu *</span>
                </label>
                {currentCard && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                      currentCard.status === 'aktif'
                        ? 'bg-emerald-50 text-emerald-700'
                        : currentCard.status === 'baru'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    Status: {currentCard.status === 'baru' ? 'Siap Diaktifkan' : currentCard.status}
                  </span>
                )}
              </div>

              {/* NFC Sensor Auto-Read Callout */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-blue-950">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Radio className={`w-4 h-4 ${isNfcScanning ? 'animate-ping' : 'animate-pulse'}`} />
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-900">
                      Deteksi NFC Otomatis
                    </span>
                    <span className="text-[11px] text-blue-800">
                      {isNfcScanning
                        ? 'Mendengarkan chip NFC... Dekatkan kartu ke ponsel'
                        : 'Tempelkan kartu ke HP untuk membaca kode otomatis'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={hasWebNfc ? handleStartWebNfc : handleSimulateNfcTap}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{hasWebNfc ? 'Mulai Scan NFC' : 'Simulasi Tap NFC'}</span>
                </button>
              </div>

              {/* NFC Feedback alerts */}
              {nfcSuccessFeedback && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{nfcSuccessFeedback}</span>
                </div>
              )}

              {nfcStatusNote && (
                <p className="text-[11px] text-blue-700 animate-in fade-in">
                  {nfcStatusNote}
                </p>
              )}

              <input
                type="text"
                required
                maxLength={6}
                value={cardCode}
                onChange={(e) => {
                  setCardCode(e.target.value.toUpperCase());
                  setNfcSuccessFeedback(null);
                }}
                placeholder="Kode kartu otomatis terisi saat tap NFC atau ketik manual (misal: N3W001)"
                className="w-full text-base font-mono font-bold tracking-widest uppercase p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal placeholder:text-xs"
              />
              <p className="text-[11px] text-slate-400">
                Kode 6 karakter otomatis terbaca saat kartu ditempelkan via NFC, atau dapat diketik manual.
              </p>
            </div>

            {/* FIELD 2: NAMA BISNIS */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Nama Bisnis *</span>
              </label>
              <input
                type="text"
                required
                value={manualBizName}
                onChange={(e) => {
                  setManualBizName(e.target.value);
                  setFormError(null);
                }}
                placeholder="misal: Kopi Kenangan Senopati atau Restoran Sederhana"
                className="w-full text-sm font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white placeholder:font-normal placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400">
                Nama bisnis atau gerai yang akan ditampilkan pada kartu ulasan Google.
              </p>
            </div>

            {/* FIELD 3: TAUTAN GOOGLE REVIEW */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tautan Google Review *</span>
                </label>
                <button
                  type="button"
                  onClick={handlePasteReviewLink}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Tempel dari Clipboard</span>
                </button>
              </div>

              <div className="relative">
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
                      setPasteFeedback('Link ditempel! Tautan langsung ulasan otomatis digenerate.');
                      setTimeout(() => setPasteFeedback(null), 3000);
                    }
                  }}
                  placeholder="Salin tautan Google Review (misal: https://search.google.com/local/writereview?placeid=... atau https://g.page/r/...)"
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
                />
              </div>

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
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-xs flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-blue-700 font-medium truncate max-w-[340px]">
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

              {/* Quick sample links for convenience */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400 block">
                  Contoh tautan siap pakai:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setManualReviewLink('https://search.google.com/local/writereview?placeid=ChIJ5cK_b_b0aS4RM_12y2PZ6e0');
                      if (!manualBizName) setManualBizName('Kopi Kenangan Senopati');
                      setFormError(null);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded text-slate-700"
                  >
                    + Kopi Kenangan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualReviewLink('https://g.page/r/Cd-6qT8tZ-B4EBM/review');
                      if (!manualBizName) setManualBizName('Restoran Sederhana');
                      setFormError(null);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded text-slate-700"
                  >
                    + Restoran Sederhana
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualReviewLink('ChIJ9Tf37Uf1aS4RzU4Lkq_Y0_g');
                      if (!manualBizName) setManualBizName('Bakery Menteng');
                      setFormError(null);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded text-slate-700 font-mono"
                  >
                    + Raw Place ID
                  </button>
                </div>
              </div>
            </div>

            {/* Validation Error Banner */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{formError}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={
                  isActivating ||
                  !cardCode.trim() ||
                  !manualBizName.trim() ||
                  !parsedManualReview.placeId
                }
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isActivating ? (
                  <span>Memproses Aktivasi...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Aktifkan Kartu Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Success View */
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Kartu #{activatedCardData?.code} Berhasil Diaktifkan!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Kartu NFC dan QR telah terhubung ke <strong>{activatedCardData?.bizName}</strong>. Setiap pelanggan yang menempelkan ponsel atau memindai kode akan langsung diarahkan ke form ulasan Google.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center">
              <button
                onClick={() => {
                  setActivationSuccess(false);
                  setCardCode('');
                  setManualBizName('');
                  setManualReviewLink('');
                  setNfcSuccessFeedback(null);
                }}
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                Aktifkan Kartu Lain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
